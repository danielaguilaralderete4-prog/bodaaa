import React, { useState, useEffect } from 'react';
import { useGuests } from '../context/GuestContext';
import { Guest } from '../types';
import { WEDDING_DETAILS } from '../data/weddingInfo';
import rsvpKiss from '../assets/images/rsvp-kiss.jpeg';
import {
  Mail,
  CheckCircle,
  Users,
  Check,
  RotateCcw,
  Sparkles,
  Send,
  Heart,
  Utensils,
  Phone,
  MessageSquare,
  Lock,
  Search,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react';

export const RSVPSection: React.FC = () => {
  const { submitRSVP, findGuestByName, searchGuests, guests } = useGuests();

  // Selected Guest from database
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notFoundAlert, setNotFoundAlert] = useState(false);

  // Form Fields
  const [attending, setAttending] = useState<boolean>(true);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [attendeeNames, setAttendeeNames] = useState<string[]>(['']);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loveNote, setLoveNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<{
    guest: Guest;
    message: string;
  } | null>(null);

  // Check URL parameters for personalized link (e.g., ?invitado=Daniel+Morales)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const nameFromUrl =
        params.get('invitado') ||
        params.get('nombre') ||
        params.get('invitacion') ||
        params.get('guest');

      if (nameFromUrl) {
        const found = findGuestByName(nameFromUrl) || searchGuests(nameFromUrl)[0];
        if (found) {
          loadGuestIntoForm(found);
        }
      }
    } catch (e) {
      console.error('Error parsing URL params', e);
    }
  }, [guests]);

  const loadGuestIntoForm = (guest: Guest) => {
    setSelectedGuest(guest);
    setNameInput(guest.nombre_principal);
    setIsTyping(false);
    setNotFoundAlert(false);
    setPhoneNumber(guest.telefono || '');

    if (guest.confirmado && guest.asistira !== null) {
      setAttending(guest.asistira);
      if (guest.cupos_confirmados > 0) {
        setGuestCount(Math.min(guest.cupos_confirmados, guest.cupos_totales));
        if (guest.asistentes_nombres && guest.asistentes_nombres.length > 0) {
          setAttendeeNames(guest.asistentes_nombres);
        } else {
          setAttendeeNames([guest.nombre_principal]);
        }
      } else {
        setGuestCount(Math.min(guest.cupos_totales, 1));
        setAttendeeNames([guest.nombre_principal]);
      }
      if (guest.comentarios_dieta) setDietaryNotes(guest.comentarios_dieta);
      if (guest.mensaje_novios) setLoveNote(guest.mensaje_novios);
    } else {
      setAttending(true);
      // Default to their maximum assigned spots
      setGuestCount(guest.cupos_totales);
      const initialNames = [guest.nombre_principal];
      while (initialNames.length < guest.cupos_totales) {
        initialNames.push('');
      }
      setAttendeeNames(initialNames);
      setDietaryNotes(guest.comentarios_dieta || '');
      setLoveNote(guest.mensaje_novios || '');
    }
  };

  // Search suggestions as user types their name
  const filteredSuggestions =
    nameInput.trim().length >= 2 && !selectedGuest
      ? guests
          .filter((g) =>
            g.nombre_principal.toLowerCase().includes(nameInput.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const handleSelectSuggestion = (guest: Guest) => {
    loadGuestIntoForm(guest);
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const found = findGuestByName(nameInput) || searchGuests(nameInput)[0];
    if (found) {
      loadGuestIntoForm(found);
    } else {
      setNotFoundAlert(true);
    }
  };

  const handleCountChange = (count: number) => {
    if (!selectedGuest) return;
    const cappedCount = Math.min(count, selectedGuest.cupos_totales);
    setGuestCount(cappedCount);
    setAttendeeNames((prev) => {
      const next = [...prev];
      if (next.length === 0 && selectedGuest) {
        next.push(selectedGuest.nombre_principal);
      }
      while (next.length < cappedCount) {
        next.push('');
      }
      return next.slice(0, cappedCount);
    });
  };

  const handleAttendeeNameChange = (index: number, val: string) => {
    setAttendeeNames((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) {
      setErrorMessage('Por favor busca y selecciona tu nombre de la lista.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const finalAttendees = attending
        ? attendeeNames
            .map((name, i) => {
              if (i === 0 && (!name || !name.trim())) {
                return selectedGuest.nombre_principal;
              }
              return name.trim();
            })
            .filter((n) => n.length > 0)
        : [];

      const result = submitRSVP(selectedGuest.id, {
        asistira: attending,
        cupos_confirmados: attending ? guestCount : 0,
        asistentes_nombres:
          finalAttendees.length > 0
            ? finalAttendees
            : attending
            ? [selectedGuest.nombre_principal]
            : [],
        comentarios_dieta: dietaryNotes.trim(),
        mensaje_novios: loveNote.trim(),
      });

      setIsSubmitting(false);

      if (result.success && result.guest) {
        setConfirmedData({
          guest: result.guest,
          message: result.message,
        });
      } else {
        setErrorMessage(result.message);
      }
    }, 500);
  };

  const handleResetForm = () => {
    setConfirmedData(null);
    setSelectedGuest(null);
    setNameInput('');
    setNotFoundAlert(false);
    setAttending(true);
    setGuestCount(1);
    setAttendeeNames(['']);
    setDietaryNotes('');
    setPhoneNumber('');
    setLoveNote('');
    setErrorMessage(null);
  };

  return (
    <section id="rsvp" className="py-20 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] flex items-center justify-center mb-4 text-[#8D8741]">
          <Mail className="w-5 h-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-2">
          Confirmación de Asistencia
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-bold mb-4">
          Confirmar Asistencia
        </h2>
        <p className="text-base text-[#6B6B56] leading-relaxed">
          Para nosotros es fundamental contar con tu presencia. Por favor confirma antes del{' '}
          <strong className="text-[#5A5A40] font-semibold">{WEDDING_DETAILS.rsvpDeadline}</strong>{' '}
          para reservar tus cupos en nuestro gran día.
        </p>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent mt-6" />
      </div>

      {/* Main RSVP Card */}
      <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Photograph (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#BC986A]/40 p-1.5 shadow-md group">
              <img
                src={rsvpKiss}
                alt="Bárbara & Daniel"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-5 text-white text-left">
                <span className="text-[11px] uppercase tracking-widest text-[#E0D8C3] font-semibold">
                  12 de Diciembre, 2026
                </span>
                <p className="font-serif-display text-lg font-bold">
                  Bárbara & Daniel
                </p>
              </div>
            </div>

            {/* Reassurance Note */}
            <div className="mt-6 w-full max-w-sm p-4 bg-[#F7F3E9] rounded-2xl border border-[#E0D8C3] text-left">
              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-[#8D8741] shrink-0 mt-0.5" />
                <p className="text-xs text-[#6B6B56] leading-relaxed">
                  Los cupos son personales y reservados con antelación para que disfrutes de una velada inolvidable.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {confirmedData ? (
              /* Success / Confirmation Screen */
              <div className="space-y-6 text-center animate-fade-in py-2">
                <div className="w-16 h-16 rounded-full bg-[#EAE7DC] border border-[#BC986A] text-[#5A5A40] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8 text-[#8D8741]" />
                </div>

                <div>
                  <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#333333] mb-2">
                    {confirmedData.guest.asistira
                      ? '¡Confirmación Recibida!'
                      : 'Respuesta Registrada'}
                  </h3>
                  <p className="text-sm text-[#6B6B56] max-w-md mx-auto leading-relaxed">
                    {confirmedData.message}
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#F7F3E9] rounded-3xl p-6 border border-[#E0D8C3] text-left space-y-3 text-xs sm:text-sm max-w-md mx-auto shadow-sm">
                  <div className="flex justify-between pb-2 border-b border-[#E0D8C3]">
                    <span className="text-[#6B6B56]">Invitado / Familia:</span>
                    <span className="font-bold text-[#333333]">{confirmedData.guest.nombre_principal}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#E0D8C3]">
                    <span className="text-[#6B6B56]">Cupos Asignados:</span>
                    <span className="font-bold text-[#333333]">{confirmedData.guest.cupos_totales} cupo(s)</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#E0D8C3]">
                    <span className="text-[#6B6B56]">Estado:</span>
                    <span
                      className={`font-bold ${
                        confirmedData.guest.asistira ? 'text-[#5A5A40]' : 'text-[#BC986A]'
                      }`}
                    >
                      {confirmedData.guest.asistira
                        ? `Asistirá (${confirmedData.guest.cupos_confirmados} persona/s)`
                        : 'No Asistirá'}
                    </span>
                  </div>
                  {confirmedData.guest.asistira &&
                    confirmedData.guest.asistentes_nombres &&
                    confirmedData.guest.asistentes_nombres.length > 0 && (
                      <div className="pb-2 border-b border-[#E0D8C3]">
                        <span className="text-[#6B6B56] block mb-1">Nombres de Asistentes:</span>
                        <ul className="list-disc list-inside font-medium text-[#333333] pl-1">
                          {confirmedData.guest.asistentes_nombres.map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {confirmedData.guest.comentarios_dieta && (
                    <div className="pb-2 border-b border-[#E0D8C3]">
                      <span className="text-[#6B6B56] block">Alergias / Dietas:</span>
                      <span className="italic text-[#333333]">{confirmedData.guest.comentarios_dieta}</span>
                    </div>
                  )}
                  {confirmedData.guest.mensaje_novios && (
                    <div className="pt-1">
                      <span className="text-[#6B6B56] block">Mensaje:</span>
                      <span className="italic text-[#333333]">"{confirmedData.guest.mensaje_novios}"</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-6 rounded-full border border-[#E0D8C3] bg-[#FDFCF0] text-[#5A5A40] hover:bg-[#EAE7DC] text-xs uppercase tracking-wider font-medium transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Modificar o buscar otro nombre</span>
                  </button>
                </div>
              </div>
            ) : !selectedGuest ? (
              /* STEP 1: Look up Name */
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#F7F3E9] border border-[#E0D8C3]">
                  <div className="flex items-center gap-3 mb-2 text-[#5A5A40]">
                    <Search className="w-5 h-5 text-[#8D8741]" />
                    <h3 className="font-serif-display text-xl font-bold text-[#333333]">
                      Busca tu Nombre o Familia
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B6B56] leading-relaxed mb-4">
                    Escribe tu nombre y apellido (o apellido de familia) para ver tus cupos asignados:
                  </p>

                  <form onSubmit={handleManualSearchSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          setNotFoundAlert(false);
                          setIsTyping(true);
                        }}
                        placeholder="Ej: Daniel Morales o Familia Soto Pérez..."
                        className="w-full bg-white border-2 border-[#E0D8C3] focus:border-[#5A5A40] focus:ring-2 focus:ring-[#EAE7DC] rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#333333] placeholder:text-[#6B6B56]/50 outline-none transition-all"
                      />

                      {/* Dropdown Suggestions */}
                      {filteredSuggestions.length > 0 && isTyping && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E0D8C3] rounded-2xl shadow-xl z-20 overflow-hidden">
                          <div className="px-3.5 py-1.5 bg-[#F7F3E9] text-[10px] uppercase font-bold text-[#6B6B56] tracking-wider">
                            Selecciona tu invitación:
                          </div>
                          {filteredSuggestions.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => handleSelectSuggestion(g)}
                              className="w-full text-left px-4 py-3 text-xs text-[#333333] hover:bg-[#EAE7DC] flex justify-between items-center transition-colors border-b border-[#E0D8C3]/40 last:border-0"
                            >
                              <span className="font-bold text-sm text-[#333333]">
                                {g.nombre_principal}
                              </span>
                              <span className="text-xs font-semibold text-[#5A5A40] bg-[#EAE7DC] px-3 py-1 rounded-full border border-[#E0D8C3]">
                                {g.cupos_totales} {g.cupos_totales === 1 ? 'cupo' : 'cupos'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {notFoundAlert && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                        <div>
                          <p className="font-semibold">No encontramos ese nombre en la lista.</p>
                          <p className="mt-0.5 text-amber-800">
                            Por favor escribe tu primer nombre y apellido, o contáctanos por WhatsApp para ayudarte.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-xs uppercase tracking-[0.15em] shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Ver Mis Cupos Asignados</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* STEP 2: Personalized RSVP Form (Strictly Limited to Assigned Spots) */
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                {/* Personalized Welcome Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#EAE7DC] border-2 border-[#BC986A]/60 flex items-start justify-between gap-3 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#8D8741] block">
                        Invitación Confirmada para:
                      </span>
                      <h4 className="font-serif-display text-lg font-bold text-[#333333]">
                        {selectedGuest.nombre_principal}
                      </h4>
                      <p className="text-xs text-[#5A5A40] font-medium mt-0.5">
                        Hemos reservado{' '}
                        <strong className="underline decoration-[#8D8741]">
                          {selectedGuest.cupos_totales}{' '}
                          {selectedGuest.cupos_totales === 1 ? 'cupo personal' : 'cupos'}
                        </strong>{' '}
                        para esta invitación (Sin acompañantes adicionales).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGuest(null);
                      setIsTyping(false);
                    }}
                    className="text-xs text-[#6B6B56] hover:text-[#333333] underline whitespace-nowrap pt-1"
                  >
                    Cambiar
                  </button>
                </div>

                {/* 1. ¿Podrás asistir? */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-2.5">
                    1. ¿Podrás acompañarnos en nuestro matrimonio? <span className="text-[#8D8741]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        attending
                          ? 'border-[#5A5A40] bg-[#F7F3E9] shadow-sm'
                          : 'border-[#E0D8C3] bg-white hover:border-[#5A5A40]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        checked={attending}
                        onChange={() => setAttending(true)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          attending ? 'border-[#5A5A40] bg-[#5A5A40]' : 'border-[#E0D8C3]'
                        }`}
                      >
                        {attending && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#333333] block">
                          ¡Sí, asistiré con alegría!
                        </span>
                        <span className="text-xs text-[#6B6B56]">Cuenten conmigo</span>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        !attending
                          ? 'border-[#5A5A40] bg-[#F7F3E9] shadow-sm'
                          : 'border-[#E0D8C3] bg-white hover:border-[#5A5A40]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        checked={!attending}
                        onChange={() => setAttending(false)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          !attending ? 'border-[#5A5A40] bg-[#5A5A40]' : 'border-[#E0D8C3]'
                        }`}
                      >
                        {!attending && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#333333] block">
                          No podré asistir
                        </span>
                        <span className="text-xs text-[#6B6B56]">Los acompañaré de corazón</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Strict Seat Selection (ONLY up to selectedGuest.cupos_totales) */}
                {attending && (
                  <div className="space-y-5 pt-2 border-t border-[#E0D8C3] animate-fade-in">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-2">
                        2. ¿Cuántos de los {selectedGuest.cupos_totales} cupos asignados confirmas? <span className="text-[#8D8741]">*</span>
                      </label>

                      {selectedGuest.cupos_totales === 1 ? (
                        <div className="p-3.5 rounded-xl bg-[#F7F3E9] border border-[#E0D8C3] text-xs text-[#5A5A40] font-semibold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#8D8741]" />
                          <span>Invitación Individual: 1 cupo confirmado para {selectedGuest.nombre_principal}.</span>
                        </div>
                      ) : (
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(selectedGuest.cupos_totales, 5)}, minmax(0, 1fr))`,
                          }}
                        >
                          {Array.from({ length: selectedGuest.cupos_totales }, (_, i) => i + 1).map(
                            (num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleCountChange(num)}
                                className={`py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                                  guestCount === num
                                    ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                                    : 'bg-white text-[#6B6B56] border-[#E0D8C3] hover:border-[#5A5A40]'
                                }`}
                              >
                                {num} {num === 1 ? 'persona' : 'personas'}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nombres de los asistentes */}
                    <div className="space-y-2.5">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40]">
                        3. Nombres de quienes asistirán ({guestCount} persona/s): <span className="text-[#8D8741]">*</span>
                      </label>
                      {Array.from({ length: guestCount }).map((_, idx) => (
                        <div key={idx}>
                          <input
                            type="text"
                            required
                            value={
                              attendeeNames[idx] !== undefined
                                ? attendeeNames[idx]
                                : idx === 0
                                ? selectedGuest.nombre_principal
                                : ''
                            }
                            onChange={(e) => handleAttendeeNameChange(idx, e.target.value)}
                            placeholder={
                              idx === 0
                                ? `Titular: ${selectedGuest.nombre_principal}`
                                : `Nombre y Apellido del Acompañante ${idx + 1}`
                            }
                            className="w-full bg-white border border-[#E0D8C3] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl px-4 py-2.5 text-sm text-[#333333] outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Alergias / Dietas */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1.5 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-[#8D8741]" />
                        <span>4. Restricciones Alimentarias / Alergias (Opcional):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        placeholder="Ej: Vegetariano, Vegano, Celíaco (Sin Gluten), Alergia a mariscos/frutos secos..."
                        className="w-full bg-white border border-[#E0D8C3] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl p-3 text-sm text-[#333333] outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Dedicatoria a los novios */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A5A40] mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#8D8741]" />
                    <span>{attending ? '5.' : '2.'} Mensaje de Felicitaciones para Bárbara & Daniel:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={loveNote}
                    onChange={(e) => setLoveNote(e.target.value)}
                    placeholder="Escribe tus buenos deseos y bendiciones..."
                    className="w-full bg-white border border-[#E0D8C3] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] rounded-xl p-3 text-sm text-[#333333] outline-none resize-none"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 animate-fade-in">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold text-xs uppercase tracking-[0.15em] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Confirmación</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
