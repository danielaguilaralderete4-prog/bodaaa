import React from 'react';
import { Shield } from 'lucide-react';

interface HeaderProps {
  isAdminOpen: boolean;
  onToggleAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminOpen,
  onToggleAdmin,
}) => {
  return (
    <header
      id="main-header"
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#F8F4EC]/95 backdrop-blur-md border-b border-[#D8C29A]/60 transition-all duration-300"
    >
      <div className="relative max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 z-10 flex-1 justify-start">
          <a
            href="#details"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#536078] hover:text-[#18243D] transition-colors whitespace-nowrap"
          >
            Nuestra Historia
          </a>
          <a
            href="#event"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#536078] hover:text-[#18243D] transition-colors whitespace-nowrap"
          >
            El Evento
          </a>
          <a
            href="#protocol"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#536078] hover:text-[#18243D] transition-colors whitespace-nowrap"
          >
            Protocolo
          </a>
        </nav>

        {/* Center Title / Names - Centered in navbar in a single line */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto z-20">
          <a
            href="#hero"
            className="font-serif-display text-lg sm:text-xl md:text-2xl text-[#18243D] tracking-[0.15em] font-medium transition-transform hover:scale-105 active:scale-95 inline-flex items-center justify-center whitespace-nowrap"
          >
            <span className="whitespace-nowrap text-center tracking-[0.15em]">
              Bárbara & Daniel
            </span>
          </a>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 z-10 flex-1">
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#gifts"
              className="text-xs uppercase tracking-[0.2em] font-medium text-[#536078] hover:text-[#18243D] transition-colors"
            >
              Lista de Novios
            </a>
            <a
              href="#rsvp"
              className="text-xs uppercase tracking-[0.2em] font-semibold text-[#18243D] bg-[#E8DFCF] hover:bg-[#D8C29A]/60 px-3.5 py-1.5 rounded-full transition-colors"
            >
              RSVP
            </a>
          </nav>

          {/* Admin Panel Toggle */}
          <button
            onClick={onToggleAdmin}
            id="btn-admin-toggle"
            title="Panel de Novios"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all border ${
              isAdminOpen
                ? 'bg-[#18243D] text-white border-[#18243D] shadow-sm'
                : 'bg-white/80 text-[#18243D] border-[#D8C29A] hover:border-[#18243D]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel Novios</span>
          </button>
        </div>
      </div>
    </header>
  );
};
