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
          className="w-full h-full bg-[length:auto_180%] bg-bottom bg-no-repeat sm:bg-cover sm:bg-[center_82%] transition-transform duration-1000"
          style={{
            backgroundImage: `url("${heroCouple}")`,
          }}
        />
        {/* Natural Tones Soft Overlays */}
        <div className="absolute inset-0 bg-[#FDFCF0]/8" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCF0]/25 via-transparent to-[#FDFCF0]/35" />
      </div>

      {/* Main Hero Card Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in">
        {/* Couple Names */}
        <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-bold text-[#333333] tracking-tight mb-2">
          Bárbara & Daniel
        </h1>

        <p className="text-sm sm:text-base uppercase tracking-[0.2em] text-[#6B6B56] font-medium mb-3">
          ¡Nos casamos!
        </p>

        {/* Elegant Natural Gold Divider */}
        <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-[#8D8741] to-transparent my-2" />

        {/* Date & Location Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[#333333] my-4 text-sm sm:text-base">
          <div className="flex items-center gap-1.5 font-serif-display italic text-lg sm:text-xl text-[#333333]">
            <Calendar className="w-4 h-4 text-[#333333]" />
            <span>{WEDDING_DETAILS.weddingDateFormatted}</span>
          </div>
          <span className="text-[#D8C3A5] hidden sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm tracking-wide text-[#333333]">
            <MapPin className="w-3.5 h-3.5 text-[#333333]" />
            <span>Osorno, Los Lagos, Chile</span>
          </div>
        </div>

        {/* Countdown Floating Card */}
        <div className="w-full max-w-lg mt-[28rem] sm:mt-40 bg-[#FDFCF0]/97 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#E0D8C3] shadow-[0_12px_36px_rgba(90,90,64,0.08)]">
          <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-5">
            Cuenta Regresiva
          </h3>
          <CountdownTimer targetDateISO={WEDDING_DETAILS.weddingDateISO} />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-12 w-full max-w-md justify-center">
          <a
            href="#rsvp"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5A5A40] text-white hover:bg-[#474732] transition-all shadow-md hover:shadow-lg text-xs uppercase tracking-[0.15em] font-semibold"
          >
            Confirmar Asistencia (RSVP)
          </a>
          <a
            href="#event"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F7F3E9] hover:bg-[#EAE7DC] text-[#5A5A40] border border-[#E0D8C3] transition-all text-xs uppercase tracking-[0.15em] font-medium"
          >
            Ver Detalles del Evento
          </a>
        </div>

        {/* Scroll indicator */}
        <a
          href="#details"
          className="mt-12 text-[#5A5A40]/70 hover:text-[#5A5A40] transition-colors animate-bounce flex flex-col items-center gap-1"
        >
          <span className="text-[10px] uppercase tracking-widest font-medium">Descubrir más</span>
          <ChevronDown className="w-4 h-4 text-[#8D8741]" />
        </a>
      </div>
    </section>
  );
};
