import React from 'react';
import { CountdownTimer } from './CountdownTimer';
import { WEDDING_DETAILS } from '../data/weddingInfo';
import { Heart, Calendar, MapPin, ChevronDown } from 'lucide-react';
import heroCouple from '../assets/images/hero-new.jpeg';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative isolate min-h-[100svh] w-full flex flex-col items-center justify-start pt-24 sm:pt-28 pb-16 px-4 overflow-hidden"
    >
      {/* Background Image with Natural Tones Editorial Overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className="w-full h-full bg-[length:auto_125%] bg-[center_90%] bg-no-repeat sm:bg-cover sm:bg-[center_82%] transition-transform duration-1000"
          style={{
            backgroundImage: `url("${heroCouple}")`,
          }}
        />
        {/* Natural Tones Soft Overlays */}
        <div className="absolute inset-0 bg-[#F8F4EC]/8" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F4EC]/25 via-transparent to-[#F8F4EC]/35" />
      </div>

      {/* Main Hero Card Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in">
        {/* Couple Names */}
        <h1 className="relative top-6 sm:top-3 whitespace-nowrap font-serif-display text-[2.65rem] sm:text-6xl md:text-7xl font-bold text-[#111111] tracking-tight mb-2">
          Bárbara & Daniel
        </h1>

        <p className="relative top-6 sm:top-3 text-base sm:text-lg uppercase tracking-[0.24em] text-[#111111] font-semibold mb-3 [text-shadow:0_1px_2px_rgba(255,255,255,0.45)]">
          ¡Nos casamos!
        </p>

        {/* Elegant Natural Gold Divider */}
        <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-[#B89A62] to-transparent my-2" />

        {/* Date & Location Badges */}
        <div className="relative top-3 sm:top-[28rem] sm:z-20 flex flex-wrap items-center justify-center gap-4 rounded-full bg-[#FDFCF0]/35 px-4 py-2 text-[#111111] my-4 text-sm sm:text-base shadow-sm backdrop-blur-[2px]">
          <div className="flex items-center gap-1.5 font-serif-display italic text-lg sm:text-xl font-semibold text-[#111111]">
            <Calendar className="w-4 h-4 text-[#111111]" />
            <span className="[text-shadow:0_1px_2px_rgba(255,255,255,0.5)]">{WEDDING_DETAILS.weddingDateFormatted}</span>
          </div>
          <span className="text-[#D8C29A] hidden sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm tracking-wide text-[#111111]">
            <MapPin className="w-3.5 h-3.5 text-[#111111]" />
            <span className="[text-shadow:0_1px_2px_rgba(255,255,255,0.5)]">Osorno, Los Lagos, Chile</span>
          </div>
        </div>

        {/* Countdown Floating Card */}
        <div className="w-full max-w-lg mt-[28rem] sm:mt-[28rem] rounded-[2rem] border border-[#B89A62]/70 bg-[#F8F4EC]/95 p-2 shadow-[0_18px_45px_rgba(24,36,61,0.18)] backdrop-blur-md">
          <div className="rounded-[1.65rem] border border-[#D8C29A]/70 px-4 py-5 sm:px-6 sm:py-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#B89A62]" />
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#B89A62]">
                Cuenta Regresiva
              </h3>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#B89A62]" />
            </div>
            <CountdownTimer targetDateISO={WEDDING_DETAILS.weddingDateISO} />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-12 w-full max-w-md justify-center">
          <a
            href="#rsvp"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#18243D] text-white hover:bg-[#283653] transition-all shadow-md hover:shadow-lg text-xs uppercase tracking-[0.15em] font-semibold"
          >
            Confirmar Asistencia (RSVP)
          </a>
          <a
            href="#event"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FBF8F1] hover:bg-[#E8DFCF] text-[#18243D] border border-[#D8C29A] transition-all text-xs uppercase tracking-[0.15em] font-medium"
          >
            Ver Detalles del Evento
          </a>
        </div>

        {/* Scroll indicator */}
        <a
          href="#details"
          className="mt-8 inline-flex flex-col items-center gap-1 rounded-full border border-[#B89A62]/70 bg-[#F8F4EC]/80 px-4 py-2 text-[#111111] shadow-[0_6px_18px_rgba(24,36,61,0.12)] backdrop-blur-sm transition-all hover:bg-[#F8F4EC]/95 animate-bounce"
        >
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold">Descubrir más</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#B89A62]" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
};
