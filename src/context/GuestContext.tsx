import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { auth, realtimeDb } from '../lib/firebase';
import { Guest, AdminMetrics } from '../types';
import { INITIAL_GUESTS } from '../data/initialGuests';
import { saveGuestListToCache, getGuestListFromCache, clearGuestCache } from '../utils/guestCache';

interface GuestContextType {
  guests: Guest[];
  metrics: AdminMetrics;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  findGuestByCode: (code: string) => Guest | undefined;
  findGuestByName: (name: string) => Guest | undefined;
  searchGuests: (query: string) => Guest[];
  submitRSVP: (
    guestId: string,
    data: {
      asistira: boolean;
      cupos_confirmados: number;
      asistentes_nombres: string[];
      mensaje_novios?: string;
    }
  ) => Promise<{ success: boolean; message: string; guest?: Guest }>;
  submitDirectRSVP: (data: {
    nombre_principal: string;
    asistira: boolean;
    cupos_confirmados: number;
    asistentes_nombres: string[];
    mensaje_novios?: string;
    telefono?: string;
  }) => Promise<{ success: boolean; message: string; guest: Guest }>;
  addGuest: (guest: Omit<Guest, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<{ success: boolean; message: string }>;
  deleteGuest: (id: string) => Promise<void>;
  resetRSVP: (id: string) => Promise<void>;
  resetAllToDefault: () => Promise<void>;
  exportGuestListCSV: () => void;
  lastConfirmedGuest: Guest | null;
  setLastConfirmedGuest: (guest: Guest | null) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);
type GuestDirectoryEntry = Pick<Guest, 'codigo_invitacion' | 'nombre_principal' | 'cupos_totales'>;

const toDirectoryEntry = (guest: Guest): GuestDirectoryEntry => ({
  codigo_invitacion: guest.codigo_invitacion,
  nombre_principal: guest.nombre_principal,
  cupos_totales: guest.cupos_totales,
});

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guests, setGuests] = useState<Guest[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastConfirmedGuest, setLastConfirmedGuest] = useState<Guest | null>(null);

  // The private guest list is only subscribed to after Firebase Authentication
  // confirms that the current visitor is a member of the couple's account.
  useEffect(() => {
    let unsubscribeData: (() => void) | undefined;
    let privateGuests: Guest[] = [];
    let responses: Record<string, Partial<Guest>> = {};
    const publish = () => {
      const guestList = privateGuests.map((guest) => ({ ...guest, ...(responses[guest.id] || {}) }));
      setGuests(guestList);
      // Save to cache whenever guests update
      saveGuestListToCache(guestList);
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeData?.();
      
      // Try to load from cache first for instant UI
      const cachedGuests = getGuestListFromCache();
      if (cachedGuests && cachedGuests.length > 0) {
        setGuests(cachedGuests);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        setGuests([]);
      }

      const path = user ? 'guests' : 'guestDirectory';
      unsubscribeData = onValue(
        ref(realtimeDb, path),
        (snapshot) => {
          setIsLoading(false);
          setIsFirebaseConnected(true);
          const data = snapshot.val() as Record<string, Guest | GuestDirectoryEntry> | null;
          privateGuests = data
            ? Object.entries(data).map(([id, guest]) => ({ ...guest, id } as Guest))
            : [];
          publish();
        },
        (error) => {
          console.warn('Realtime Database subscription error:', error);
          setIsLoading(false);
          setIsFirebaseConnected(false);
        }
      );
      if (user) {
        const responseUnsubscribe = onValue(ref(realtimeDb, 'guestResponses'), (snapshot) => {
          const rawResponses =
            (snapshot.val() as Record<string, (Partial<Guest> & { guest_id?: string }) | null> | null) ||
            {};
          responses = {};
          Object.values(rawResponses).forEach((response) => {
            if (response?.guest_id) {
              responses[response.guest_id] = response;
            }
          });
          publish();
        });
        const original = unsubscribeData;
        unsubscribeData = () => {
          original();
          responseUnsubscribe();
        };
      }
    });
    return () => {
      unsubscribeAuth();
      unsubscribeData?.();
    };
  }, []);

  // Compute live admin statistics
  const metrics: AdminMetrics = useMemo(() => {
    const totalInvitados = guests.length;
    const cuposTotales = guests.reduce((acc, g) => acc + (g.cupos_totales || 0), 0);
    const confirmadosList = guests.filter((g) => g.confirmado && g.asistira === true);
    const declinadosList = guests.filter((g) => g.confirmado && g.asistira === false);
    const pendientesList = guests.filter((g) => !g.confirmado);

    const cuposConfirmados = confirmadosList.reduce(
      (acc, g) => acc + (g.cupos_confirmados || 0),
      0
    );
    const porcentajeConfirmacion =
      cuposTotales > 0 ? Math.round((cuposConfirmados / cuposTotales) * 100) : 0;

    return {
      totalInvitados,
      cuposTotales,
      confirmadosCount: confirmadosList.length,
      cuposConfirmados,
      declinadosCount: declinadosList.length,
      pendientesCount: pendientesList.length,
      porcentajeConfirmacion,
    };
  }, [guests]);

  const findGuestByCode = (code: string): Guest | undefined => {
    if (!code) return undefined;
    const cleanCode = code.trim().toUpperCase();
    return guests.find((g) => g.codigo_invitacion?.trim().toUpperCase() === cleanCode);
  };

  const findGuestByName = (name: string): Guest | undefined => {
    if (!name || !name.trim()) return undefined;
    const clean = name.trim().toLowerCase();
    return guests.find(
      (g) =>
        g.nombre_principal.toLowerCase() === clean ||
        g.nombre_principal.toLowerCase().includes(clean) ||
        clean.includes(g.nombre_principal.toLowerCase())
    );
  };

  const searchGuests = (query: string): Guest[] => {
    if (!query.trim()) return guests;
    const q = query.toLowerCase().trim();
    return guests.filter(
      (g) =>
        g.nombre_principal?.toLowerCase().includes(q) ||
        g.codigo_invitacion?.toLowerCase().includes(q) ||
        (g.categoria && g.categoria.toLowerCase().includes(q)) ||
        (g.asistentes_nombres &&
          g.asistentes_nombres.some((name) => name.toLowerCase().includes(q)))
    );
  };

  const submitDirectRSVP = async (data: {
    nombre_principal: string;
    asistira: boolean;
    cupos_confirmados: number;
    asistentes_nombres: string[];
    mensaje_novios?: string;
    telefono?: string;
  }) => {
    const existing = findGuestByName(data.nombre_principal);
    let updatedOrNewGuest: Guest;

    if (existing) {
      updatedOrNewGuest = {
        ...existing,
        nombre_principal: data.nombre_principal.trim(),
        confirmado: true,
        asistira: data.asistira,
        cupos_confirmados: data.asistira ? data.cupos_confirmados : 0,
        asistentes_nombres: data.asistira ? data.asistentes_nombres : [],
        mensaje_novios: data.mensaje_novios || '',
        telefono: data.telefono || existing.telefono || '',
        fecha_confirmacion: new Date().toISOString(),
      };

      await set(push(ref(realtimeDb, 'guestResponses')), {
        guest_id: existing.id,
        confirmado: true,
        asistira: data.asistira,
        cupos_confirmados: data.asistira ? data.cupos_confirmados : 0,
        asistentes_nombres: data.asistira ? data.asistentes_nombres : [],
        mensaje_novios: data.mensaje_novios || '',
        fecha_confirmacion: updatedOrNewGuest.fecha_confirmacion,
      });
      setGuests((prev) => prev.map((g) => (g.id === existing.id ? updatedOrNewGuest : g)));
    } else {
      const generatedCode = `BD-${Math.floor(100 + Math.random() * 900)}`;
      const newId = `g-${Date.now()}`;
      updatedOrNewGuest = {
        id: newId,
        codigo_invitacion: generatedCode,
        nombre_principal: data.nombre_principal.trim(),
        cupos_totales: data.asistira ? Math.max(1, data.cupos_confirmados) : 1,
        confirmado: true,
        asistira: data.asistira,
        cupos_confirmados: data.asistira ? data.cupos_confirmados : 0,
        asistentes_nombres: data.asistira ? data.asistentes_nombres : [],
        mensaje_novios: data.mensaje_novios || '',
        telefono: data.telefono || '',
        categoria: 'General',
        fecha_confirmacion: new Date().toISOString(),
      };

      await set(push(ref(realtimeDb, 'guestResponses')), {
        ...updatedOrNewGuest,
        guest_id: newId,
      });
    }

    setLastConfirmedGuest(updatedOrNewGuest);

    return {
      success: true,
      message: data.asistira
        ? `¡Muchas gracias por confirmar tu asistencia! Hemos registrado tus datos con éxito en la base de datos.`
        : `Hemos recibido tu respuesta. Lamentamos que no puedas acompañarnos, ¡muchas gracias por avisar a los novios!`,
      guest: updatedOrNewGuest,
    };
  };

  const submitRSVP = async (
    guestId: string,
    data: {
      asistira: boolean;
      cupos_confirmados: number;
      asistentes_nombres: string[];
      mensaje_novios?: string;
    }
  ) => {
    const targetGuest = guests.find((g) => g.id === guestId);
    if (!targetGuest) {
      return { success: false, message: 'Invitación no encontrada.' };
    }

    if (data.asistira && data.cupos_confirmados > targetGuest.cupos_totales) {
      return {
        success: false,
        message: `No es posible confirmar más de ${targetGuest.cupos_totales} cupos asignados.`,
      };
    }

    const updatedGuest: Guest = {
      ...targetGuest,
      confirmado: true,
      asistira: data.asistira,
      cupos_confirmados: data.asistira ? data.cupos_confirmados : 0,
      asistentes_nombres: data.asistira ? data.asistentes_nombres : [],
      mensaje_novios: data.mensaje_novios || '',
      fecha_confirmacion: new Date().toISOString(),
    };

    await set(push(ref(realtimeDb, 'guestResponses')), {
      guest_id: guestId,
      confirmado: true,
      asistira: data.asistira,
      cupos_confirmados: data.asistira ? data.cupos_confirmados : 0,
      asistentes_nombres: data.asistira ? data.asistentes_nombres : [],
      mensaje_novios: data.mensaje_novios || '',
      fecha_confirmacion: updatedGuest.fecha_confirmacion,
    });

    setGuests((prev) => prev.map((g) => (g.id === guestId ? updatedGuest : g)));
    setLastConfirmedGuest(updatedGuest);

    return {
      success: true,
      message: data.asistira
        ? `¡Gracias por confirmar! Hemos reservado ${data.cupos_confirmados} cupo(s) para su grupo.`
        : 'Hemos recibido tu respuesta. Lamentamos que no puedas acompañarnos, ¡gracias por avisarnos!',
      guest: updatedGuest,
    };
  };

  const addGuest = async (newGuestData: Omit<Guest, 'id'>) => {
    const existing = findGuestByCode(newGuestData.codigo_invitacion);
    if (existing) {
      return { success: false, message: 'Ya existe un invitado con ese código.' };
    }

    const newId = `g-${Date.now()}`;
    const newGuest: Guest = {
      ...newGuestData,
      id: newId,
      confirmado: false,
      cupos_confirmados: 0,
      asistira: null,
      asistentes_nombres: [],
    };

    await update(ref(realtimeDb), {
      [`guests/${newId}`]: newGuest,
      [`guestDirectory/${newId}`]: toDirectoryEntry(newGuest),
    });

    return { success: true, message: 'Invitado agregado exitosamente.' };
  };

  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    const current = guests.find((guest) => guest.id === id);
    await update(ref(realtimeDb), {
      [`guests/${id}`]: updates,
      ...(current
        ? { [`guestDirectory/${id}`]: toDirectoryEntry({ ...current, ...updates }) }
        : {}),
    });

    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return { ...g, ...updates };
        }
        return g;
      })
    );
    return { success: true, message: 'Invitado actualizado.' };
  };

  const deleteGuest = async (id: string): Promise<void> => {
    try {
      await update(ref(realtimeDb), {
        [`guests/${id}`]: null,
        [`guestDirectory/${id}`]: null,
        [`guestResponses/${id}`]: null,
      });
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  };

  const resetRSVP = async (id: string) => {
    const updates: Partial<Guest> = {
      confirmado: false,
      asistira: null,
      cupos_confirmados: 0,
      asistentes_nombres: [],
      mensaje_novios: '',
    };

    await update(ref(realtimeDb), {
      [`guests/${id}`]: updates,
      [`guestResponses/${id}`]: null,
    });

    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, fecha_confirmacion: undefined } : g))
    );
  };

  const resetAllToDefault = async () => {
    const seeded = Object.fromEntries(INITIAL_GUESTS.map((guest) => [guest.id, guest]));
    await update(ref(realtimeDb), {
      guests: seeded,
      guestDirectory: Object.fromEntries(
        INITIAL_GUESTS.map((guest) => [guest.id, toDirectoryEntry(guest)])
      ),
      guestResponses: null,
    });
    setGuests(INITIAL_GUESTS);
    clearGuestCache(); // Clear cache when resetting
  };

  const exportGuestListCSV = () => {
    const headers = [
      'ID',
      'Código Invitación',
      'Nombre Principal / Familia',
      'Categoría',
      'Cupos Totales',
      'Estado RSVP',
      'Asiste',
      'Cupos Confirmados',
      'Nombres Asistentes',
      'Mesa',
      'Teléfono',
      'Fecha Confirmación',
      'Mensaje a los Novios',
    ];

    const rows = guests.map((g) => [
      g.id,
      g.codigo_invitacion,
      `"${(g.nombre_principal || '').replace(/"/g, '""')}"`,
      `"${(g.categoria || 'General').replace(/"/g, '""')}"`,
      g.cupos_totales,
      g.confirmado ? 'Respondido' : 'Pendiente',
      g.asistira === true ? 'SÍ' : g.asistira === false ? 'NO' : 'Pendiente',
      g.cupos_confirmados,
      `"${(g.asistentes_nombres || []).join('; ').replace(/"/g, '""')}"`,
      `"${(g.mesa_asignada || 'Por asignar').replace(/"/g, '""')}"`,
      `"${(g.telefono || '').replace(/"/g, '""')}"`,
      `"${(g.fecha_confirmacion || '').replace(/"/g, '""')}"`,
      `"${(g.mensaje_novios || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Lista_Invitados_Barbara_Daniel_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <GuestContext.Provider
      value={{
        guests,
        metrics,
        isLoading,
        isFirebaseConnected,
        findGuestByCode,
        findGuestByName,
        searchGuests,
        submitRSVP,
        submitDirectRSVP,
        addGuest,
        updateGuest,
        deleteGuest,
        resetRSVP,
        resetAllToDefault,
        exportGuestListCSV,
        lastConfirmedGuest,
        setLastConfirmedGuest,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuests = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuests must be used within a GuestProvider');
  }
  return context;
};
