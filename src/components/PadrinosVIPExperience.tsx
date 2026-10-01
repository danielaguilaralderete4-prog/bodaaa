import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Heart, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useGuests } from '../context/GuestContext';
import { Guest } from '../types';

interface PadrinosVIPExperienceProps {
  onUnlockInvitation: () => void;
  isUnlocked: boolean;
}

export const PadrinosVIPExperience: React.FC<PadrinosVIPExperienceProps> = ({
  onUnlockInvitation,
  isUnlocked,
}) => {
  const { guests, findGuestByName, searchGuests, submitRSVP } = useGuests();

  // URL checking
  const [isPadrinoParam, setIsPadrinoParam] = useState(false);
  const [identifiedGuest, setIdentifiedGuest] = useState<Guest | null>(null);
  const [currentStep, setCurrentStep] = useState<'envelope' | 'question' | 'celebration' | 'done'>('envelope');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationSeconds, setCelebrationSeconds] = useState(3);
  const [isOpen, setIsOpen] = useState(false);

  // Check URL params on load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isPadrino = params.get('padrino') === 'true' || params.get('padrino') === '1';
      const nameParam =
        params.get('invitado') ||
        params.get('nombre') ||
        params.get('invitacion') ||
        params.get('guest');

      if (isPadrino) {
        setIsPadrinoParam(true);
        // Only show if not previously dismissed in this session
        const dismissed = sessionStorage.getItem('padrinos_overlay_dismissed');
        if (!dismissed) {
          setIsOpen(true);
        }
      }

      if (nameParam) {
        const found = findGuestByName(nameParam) || searchGuests(nameParam)[0];
        if (found) {
          setIdentifiedGuest(found);
          if (found.es_padrino) {
            setIsPadrinoParam(true);
          }
        }
      }
    } catch (e) {
      console.error('Error reading padrino parameters', e);
    }
  }, [guests]);

  // Sync identifiedGuest if guests list updates
  useEffect(() => {
    if (identifiedGuest) {
      const fresh = guests.find((g) => g.id === identifiedGuest.id);
      if (fresh) setIdentifiedGuest(fresh);
    }
  }, [guests]);

  // Timer for Step B (Celebration)
  useEffect(() => {
    if (currentStep === 'celebration') {
      const interval = setInterval(() => {
        setCelebrationSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinishVIPFlow();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const guestDisplayName = identifiedGuest?.nombre_principal || 'Queridos Padrinos';

  // Step A: Handle "Acepto ser Padrino/Madrina"
  const handleAcceptPadrino = async () => {
    setIsSubmitting(true);
    try {
      if (identifiedGuest) {
        await submitRSVP(identifiedGuest.id, {
          asistira: true,
          cupos_confirmados: identifiedGuest.cupos_totales,
          asistentes_nombres:
            identifiedGuest.asistentes_nombres && identifiedGuest.asistentes_nombres.length > 0
              ? identifiedGuest.asistentes_nombres
              : [identifiedGuest.nombre_principal],
          mensaje_novios: '¡Aceptamos con inmenso amor y honor ser sus padrinos de matrimonio!',
          acepto_padrino: true,
        });
      }
    } catch (e) {
      console.warn('Error saving padrino acceptance to DB, proceeding with UI:', e);
    } finally {
      setIsSubmitting(false);
      setCurrentStep('celebration');
    }
  };

  // Handle "Acepto asistir (No como padrino)"
  const handleDeclineRoleOnly = async () => {
    setIsSubmitting(true);
    try {
      if (identifiedGuest) {
        await submitRSVP(identifiedGuest.id, {
          asistira: true,
          cupos_confirmados: identifiedGuest.cupos_totales,
          asistentes_nombres:
            identifiedGuest.asistentes_nombres && identifiedGuest.asistentes_nombres.length > 0
              ? identifiedGuest.asistentes_nombres
              : [identifiedGuest.nombre_principal],
          mensaje_novios: 'Acompañaremos con mucha alegría en el matrimonio.',
          acepto_padrino: false,
        });
      }
    } catch (e) {
      console.warn('Error saving response:', e);
    } finally {
      setIsSubmitting(false);
      handleFinishVIPFlow();
    }
  };

  // Handle "No podré asistir"
  const handleDeclineAll = async () => {
    setIsSubmitting(true);
    try {
      if (identifiedGuest) {
        await submitRSVP(identifiedGuest.id, {
          asistira: false,
          cupos_confirmados: 0,
          asistentes_nombres: [],
          mensaje_novios: 'Lamentablemente no podremos acompañarlos, ¡muchas felicidades!',
          acepto_padrino: false,
        });
      }
    } catch (e) {
      console.warn('Error saving decline:', e);
    } finally {
      setIsSubmitting(false);
      handleFinishVIPFlow();
    }
  };

  const handleFinishVIPFlow = () => {
    setCurrentStep('done');
    setIsOpen(false);
    sessionStorage.setItem('padrinos_overlay_dismissed', 'true');
    onUnlockInvitation();

    // Scroll smoothly to top or to special padrinos role
    setTimeout(() => {
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  if (!isOpen || !isPadrinoParam) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18243D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Decorative Golden Ambient Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#BC986A]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto my-auto">
        {/* Subtle Close Button */}
        <button
          onClick={handleFinishVIPFlow}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 rounded-full bg-white/90 text-gray-700 hover:text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          title="Ver invitación directamente"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── PASO A: SOBRE Y PETICIÓN ESPECIAL ─────────────────────────────────── */}
        {currentStep === 'envelope' && (
          <div className="bg-[#FAF8F2] rounded-3xl sm:rounded-[2.5rem] border-2 border-[#D4AF37] p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.45)] text-center relative overflow-hidden animate-scale-up">
            {/* Golden Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18243D] text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] shadow-sm mb-6 border border-[#D4AF37]/50">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>Invitación de Honor VIP</span>
            </div>

            {/* Couple Monogram & Seal */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#B89A62] via-[#D4AF37] to-[#F3E5AB] mx-auto mb-6 flex items-center justify-center text-[#18243D] shadow-lg ring-4 ring-[#D4AF37]/30">
              <span className="font-serif-display text-2xl font-bold tracking-widest">
                B&D
              </span>
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-[#8D8741] font-semibold mb-2">
              Una petición muy especial
            </p>

            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#18243D] mb-4">
              {guestDisplayName}
            </h2>

            {/* Emotive Message */}
            <div className="bg-white/80 rounded-2xl p-5 sm:p-6 border border-[#E0D8C3] shadow-inner mb-8">
              <p className="font-serif-display text-base sm:text-lg text-[#333333] leading-relaxed italic">
                &ldquo;Para nosotros este día no estaría completo sin ustedes a nuestro lado.
                No solo los invitamos a ser parte de nuestro matrimonio,{' '}
                <strong className="text-[#18243D] font-bold not-italic underline decoration-[#D4AF37] decoration-2">
                  queremos pedirles formalmente que sean nuestros padrinos
                </strong>.&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#8D8741] font-medium">
                <Heart className="w-3.5 h-3.5 fill-[#8D8741]" />
                <span>Con todo nuestro cariño, Bárbara &amp; Daniel</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary: Acepto ser Padrino */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAcceptPadrino}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A028] to-[#B89A62] text-[#18243D] font-serif-display text-base sm:text-lg font-bold shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_30px_rgba(212,175,55,0.6)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Crown className="w-5 h-5 text-[#18243D] group-hover:rotate-12 transition-transform" />
                <span>¡Acepto ser Padrino/Madrina!</span>
                <Sparkles className="w-5 h-5 text-[#18243D] animate-pulse" />
              </button>

              {/* Secondary Options */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeclineRoleOnly}
                  className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#E0D8C3] text-xs font-semibold text-[#5A5A40] hover:bg-[#EAE7DC] hover:text-[#18243D] transition-colors"
                >
                  Acepto asistir (No como padrino)
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeclineAll}
                  className="flex-1 py-3 px-4 rounded-xl bg-transparent border border-transparent text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                >
                  Lamentablemente no podré asistir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO B: CELEBRACIÓN Y BIENVENIDA VIP (3 SEGUNDOS) ────────────────── */}
        {currentStep === 'celebration' && (
          <div className="bg-[#FAF8F2] rounded-3xl sm:rounded-[2.5rem] border-2 border-[#D4AF37] p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.5)] text-center relative overflow-hidden animate-scale-up">
            {/* Golden Confetti Particles (CSS Animated) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <span className="absolute top-4 left-8 w-2 h-4 bg-[#D4AF37] rotate-45 rounded-sm animate-bounce" />
              <span className="absolute top-12 right-12 w-3 h-3 bg-[#BC986A] rounded-full animate-ping" />
              <span className="absolute bottom-8 left-16 w-2.5 h-2.5 bg-[#8D8741] rotate-12 animate-pulse" />
              <span className="absolute top-1/2 left-4 w-3 h-2 bg-[#D4AF37] rotate-90" />
              <span className="absolute bottom-12 right-10 w-2 h-4 bg-[#F3E5AB] -rotate-45" />
            </div>

            {/* Glowing Crown Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF3C4] mx-auto mb-6 flex items-center justify-center text-[#18243D] shadow-[0_0_40px_rgba(212,175,55,0.7)] animate-bounce">
              <Crown className="w-12 h-12 text-[#18243D]" />
            </div>

            <span className="text-xs uppercase tracking-[0.3em] text-[#8D8741] font-bold block mb-2">
              ¡Respuesta Registrada con Éxito!
            </span>

            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#18243D] mb-3">
              ¡Bienvenidos Padrinos!
            </h2>

            <p className="font-serif-display text-xl text-[#B89A62] font-semibold mb-6">
              {guestDisplayName}
            </p>

            <p className="text-sm sm:text-base text-[#5A5A40] max-w-md mx-auto leading-relaxed mb-8">
              Es un inmenso honor tener su bendición, ejemplo y compañía en este momento tan sagrado e importante de nuestras vidas.
            </p>

            {/* 3s Countdown / Progress Bar */}
            <div className="max-w-xs mx-auto mb-6">
              <div className="flex justify-between items-center text-xs font-semibold text-[#8D8741] mb-2">
                <span>Abriendo invitación completa</span>
                <span>{celebrationSeconds}s</span>
              </div>
              <div className="h-2 w-full bg-[#EAE7DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#18243D] transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((4 - celebrationSeconds) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Immediate Continue Button */}
            <button
              type="button"
              onClick={handleFinishVIPFlow}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#18243D] text-[#D4AF37] hover:text-white hover:bg-[#283653] text-xs uppercase tracking-[0.18em] font-semibold transition-all shadow-md"
            >
              <span>Continuar a la Invitación</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

