import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Guest, AdminMetrics } from '../types';
import { INITIAL_GUESTS } from '../data/initialGuests';

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
      comentarios_dieta: string;
      mensaje_novios?: string;
    }
  ) => Promise<{ success: boolean; message: string; guest?: Guest }>;
  submitDirectRSVP: (data: {
    nombre_principal: string;
    asistira: boolean;
    cupos_confirmados: number;
    asistentes_nombres: string[];
    comentarios_dieta: string;
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

const STORAGE_KEY = 'barbara_daniel_guests_v1';
const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guests, setGuests] = useState<Guest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_GUESTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastConfirmedGuest, setLastConfirmedGuest] = useState<Guest | null>(null);

  // Real-time Firestore sync with fallback to initial data
  useEffect(() => {
    const guestsColRef = collection(db, 'guests');

    const unsubscribe = onSnapshot(
      guestsColRef,
      async (snapshot) => {
        setIsLoading(false);
        setIsFirebaseConnected(true);

        if (snapshot.empty) {
          // Seed initial guests into Firestore in bulk
          try {
            const batch = writeBatch(db);
            INITIAL_GUESTS.forEach((guest) => {
              const docRef = doc(db, 'guests', guest.id);
              batch.set(docRef, guest);
            });
            await batch.commit();
            setGuests(INITIAL_GUESTS);
          } catch (seedErr) {
            console.error('Error seeding initial guests to Firestore:', seedErr);
            setGuests(INITIAL_GUESTS);
          }
        } else {
          const loadedGuests = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Guest;
            return {
              ...data,
              id: docSnap.id,
            };
          });
          setGuests(loadedGuests);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedGuests));
          } catch {
            // ignore
          }
        }
      },
      (error) => {
        console.warn('Firestore subscription error, using local storage cache:', error);
        setIsLoading(false);
        setIsFirebaseConnected(false);
      }
    );

    return () => unsubscribe();
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
    const conAlergiasCount = guests.filter(
      (g) => g.comentarios_dieta && g.comentarios_dieta.trim().length > 0 && g.asistira === true
    ).length;

    const porcentajeConfirmacion =
      cuposTotales > 0 ? Math.round((cuposConfirmados / cuposTotales) * 100) : 0;

    return {
      totalInvitados,
      cuposTotales,
      confirmadosCount: confirmadosList.length,
      cuposConfirmados,
      declinadosCount: declinadosList.length,
      pendientesCount: pendientesList.length,
      conAlergiasCount,
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
    comentarios_dieta: string;
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
        comentarios_dieta: data.comentarios_dieta || '',
        mensaje_novios: data.mensaje_novios || '',
        telefono: data.telefono || existing.telefono || '',
        fecha_confirmacion: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'guests', existing.id), updatedOrNewGuest, { merge: true });
      } catch (err) {
        console.warn('Fallback local update:', err);
      }
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
        comentarios_dieta: data.comentarios_dieta || '',
        mensaje_novios: data.mensaje_novios || '',
        telefono: data.telefono || '',
        categoria: 'General',
        fecha_confirmacion: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'guests', newId), updatedOrNewGuest);
      } catch (err) {
        console.warn('Fallback local add:', err);
      }
      setGuests((prev) => [updatedOrNewGuest, ...prev]);
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
      comentarios_dieta: string;
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
      comentarios_dieta: data.comentarios_dieta || '',
      mensaje_novios: data.mensaje_novios || '',
      fecha_confirmacion: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'guests', guestId), updatedGuest, { merge: true });
    } catch (err) {
      console.warn('Fallback local update:', err);
    }

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

    try {
      await setDoc(doc(db, 'guests', newId), newGuest);
    } catch (err) {
      console.warn('Fallback local add:', err);
    }

    setGuests((prev) => [newGuest, ...prev]);
    return { success: true, message: 'Invitado agregado exitosamente.' };
  };

  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    try {
      await updateDoc(doc(db, 'guests', id), updates);
    } catch (err) {
      console.warn('Fallback local update:', err);
    }

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

  const deleteGuest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'guests', id));
    } catch (err) {
      console.warn('Fallback local delete:', err);
    }
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const resetRSVP = async (id: string) => {
    const updates: Partial<Guest> = {
      confirmado: false,
      asistira: null,
      cupos_confirmados: 0,
      asistentes_nombres: [],
      comentarios_dieta: '',
      mensaje_novios: '',
    };

    try {
      await updateDoc(doc(db, 'guests', id), updates);
    } catch (err) {
      console.warn('Fallback local reset:', err);
    }

    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, fecha_confirmacion: undefined } : g))
    );
  };

  const resetAllToDefault = async () => {
    try {
      const batch = writeBatch(db);
      // Delete current
      guests.forEach((g) => {
        batch.delete(doc(db, 'guests', g.id));
      });
      // Insert initial
      INITIAL_GUESTS.forEach((g) => {
        batch.set(doc(db, 'guests', g.id), g);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Fallback local reset all:', err);
    }
    setGuests(INITIAL_GUESTS);
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
      'Restricciones Alimentarias / Alergias',
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
      `"${(g.comentarios_dieta || '').replace(/"/g, '""')}"`,
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
