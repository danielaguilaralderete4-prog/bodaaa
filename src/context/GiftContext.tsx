import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, push, ref, remove, set } from 'firebase/database';
import { auth, realtimeDb } from '../lib/firebase';
import { INITIAL_GIFT_ITEMS } from '../data/initialGifts';
import { GiftItem, GiftReservation } from '../types';

// ─── Backend API base URL ──────────────────────────────────────────────────────
// En desarrollo el proxy de Vite redirige /api → localhost:3001.
// En producción el backend vive en Render (dominio distinto al de Firebase
// Hosting), así que usamos la URL absoluta definida en VITE_API_BASE_URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/gifts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un ID único para una nueva orden */
function generateOrderId(): string {
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Context Types ────────────────────────────────────────────────────────────
interface GiftContextValue {
  giftItems: GiftItem[];
  isLoading: boolean;
  saveGift: (gift: Omit<GiftItem, 'id'>) => Promise<void>;
  updateGift: (id: string, updates: Partial<GiftItem>) => Promise<void>;
  deleteGift: (id: string) => Promise<void>;
  /**
   * Inicia el flujo de pago:
   * 1. Llama al backend para crear la preference en MP
   * 2. Devuelve la URL de pago (init_point o sandbox_init_point)
   * El invitado es redirigido externamente → MP procesa el pago → webhook actualiza Firebase.
   */
  initiateGiftPayment: (payload: {
    guestName: string;
    email: string;
    phone?: string;
    message?: string;
    items: Array<{ giftId: string; giftName: string; quantity: number; amount: number }>;
    totalAmount: number;
  }) => Promise<{ checkoutUrl: string; orderId: string }>;
  /** Consulta el estado de una orden al volver de MP */
  fetchOrderStatus: (orderId: string) => Promise<GiftReservation | null>;
  giftReservations: GiftReservation[];
}

const GiftContext = createContext<GiftContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const GiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [giftItems, setGiftItems] = useState<GiftItem[]>(INITIAL_GIFT_ITEMS);
  const [giftReservations, setGiftReservations] = useState<GiftReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFallbackCatalog = () => {
      setGiftItems(INITIAL_GIFT_ITEMS);
      setIsLoading(false);
    };

    const catalogUnsubscribe = onValue(
      ref(realtimeDb, 'giftCatalog'),
      (snapshot) => {
        const value = snapshot.val() as Record<string, GiftItem> | null;
        if (value) {
          const items = Object.entries(value).map(([id, gift]) => ({ ...gift, id }));
          setGiftItems(items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        } else {
          loadFallbackCatalog();
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn('Error loading gift catalog:', error);
        loadFallbackCatalog();
      }
    );

    let unsubscribeOrders: (() => void) | undefined;

    const reservationsUnsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribeOrders?.();

      if (!user) {
        setGiftReservations([]);
        return;
      }

      unsubscribeOrders = onValue(
        ref(realtimeDb, 'giftOrders'),
        (snapshot) => {
          const value = snapshot.val() as Record<string, GiftReservation> | null;
          if (value) {
            const items = Object.entries(value).map(([id, order]) => ({ ...order, id }));
            setGiftReservations(items);
          } else {
            setGiftReservations([]);
          }
        },
        (error) => {
          console.warn('Error loading gift orders:', error);
          setGiftReservations([]);
        }
      );
    });

    return () => {
      catalogUnsubscribe();
      unsubscribeOrders?.();
      reservationsUnsubscribe();
    };
  }, []);

  // ── Admin: CRUD de regalos (requiere auth) ──────────────────────────────────

  const saveGift = async (gift: Omit<GiftItem, 'id'>) => {
    if (!auth.currentUser) {
      throw new Error('Debes iniciar sesión para administrar la lista de regalos.');
    }

    const id = push(ref(realtimeDb, 'giftCatalog')).key;
    if (!id) {
      throw new Error('No se pudo crear el regalo.');
    }

    await set(ref(realtimeDb, `giftCatalog/${id}`), {
      ...gift,
      id,
      currentAmount: 0,
      availableCupos: gift.totalCupos,
      createdAt: new Date().toISOString(),
    });
  };

  const updateGift = async (id: string, updates: Partial<GiftItem>) => {
    if (!auth.currentUser) {
      throw new Error('Debes iniciar sesión para editar la lista de regalos.');
    }

    const current = giftItems.find((g) => g.id === id);
    if (!current) throw new Error('Regalo no encontrado.');

    // Si cambia totalCupos, recalcular availableCupos
    const reservedCupos = current.totalCupos - current.availableCupos;
    const newTotal = updates.totalCupos ?? current.totalCupos;
    const newAvailable = Math.max(0, newTotal - reservedCupos);

    await set(ref(realtimeDb, `giftCatalog/${id}`), {
      ...current,
      ...updates,
      id,
      availableCupos: updates.totalCupos !== undefined ? newAvailable : (updates.availableCupos ?? current.availableCupos),
    });
  };

  const deleteGift = async (id: string) => {
    if (!auth.currentUser) {
      throw new Error('Debes iniciar sesión para eliminar un regalo.');
    }

    await remove(ref(realtimeDb, `giftCatalog/${id}`));
  };

  // ── Invitado: iniciar pago ──────────────────────────────────────────────────

  const initiateGiftPayment = async (payload: {
    guestName: string;
    email: string;
    phone?: string;
    message?: string;
    items: Array<{ giftId: string; giftName: string; quantity: number; amount: number }>;
    totalAmount: number;
  }): Promise<{ checkoutUrl: string; orderId: string }> => {
    const orderId = generateOrderId();

    const response = await fetch(`${API_BASE}/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...payload }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error de red' }));
      throw new Error(errorData.error ?? 'No se pudo iniciar el pago');
    }

    const data = await response.json() as {
      preferenceId: string;
      initPoint: string;
      sandboxInitPoint: string;
    };

    // En sandbox usamos sandboxInitPoint, en producción initPoint
    const isSandbox = import.meta.env.DEV || (import.meta.env.VITE_MP_ENV === 'sandbox');
    const checkoutUrl = isSandbox ? data.sandboxInitPoint : data.initPoint;

    return { checkoutUrl, orderId };
  };

  // ── Consultar estado de orden ────────────────────────────────────────────────

  const fetchOrderStatus = async (orderId: string): Promise<GiftReservation | null> => {
    try {
      const response = await fetch(`${API_BASE}/status/${encodeURIComponent(orderId)}`);
      if (!response.ok) return null;
      return await response.json() as GiftReservation;
    } catch {
      return null;
    }
  };

  const value = useMemo<GiftContextValue>(
    () => ({
      giftItems,
      isLoading,
      saveGift,
      updateGift,
      deleteGift,
      initiateGiftPayment,
      fetchOrderStatus,
      giftReservations,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [giftItems, isLoading, giftReservations]
  );

  return <GiftContext.Provider value={value}>{children}</GiftContext.Provider>;
};

export const useGiftContext = () => {
  const context = useContext(GiftContext);
  if (!context) {
    throw new Error('useGiftContext debe usarse dentro de GiftProvider');
  }
  return context;
};
