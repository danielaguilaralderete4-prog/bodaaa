import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#EAE7DC] border-t border-[#E0D8C3] py-14 px-4 sm:px-6 text-center text-[#6B6B56]">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
        {/* Couple signature */}
        <div className="flex items-center gap-2 text-[#8D8741]">
          <Sparkles className="w-4 h-4" />
          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#5A5A40] tracking-widest uppercase">
            Bárbara & Daniel
          </h3>
          <Sparkles className="w-4 h-4" />
        </div>

        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6B6B56]">
          12 de Diciembre, 2026 &bull; Centro eventos Matri, Osorno
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wider font-medium text-[#5A5A40]">
          <a href="#hero" className="hover:text-[#333333] transition-colors">
            Inicio
          </a>
          <a href="#details" className="hover:text-[#333333] transition-colors">
            Nuestra Historia
          </a>
          <a href="#event" className="hover:text-[#333333] transition-colors">
            El Evento
          </a>
          <a href="#protocol" className="hover:text-[#333333] transition-colors">
            Protocolo
          </a>
          <a href="#gifts" className="hover:text-[#333333] transition-colors">
            Lista de Novios
          </a>
          <a href="#rsvp" className="hover:text-[#333333] transition-colors">
            Confirmar Asistencia
          </a>
        </div>

        <div className="w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent" />

        <div className="flex flex-col items-center gap-1 text-xs text-[#6B6B56] font-light">
          <p className="italic font-serif-display text-sm text-[#5A5A40]">
            &ldquo;El amor no se mira, se siente, y aún más cuando ella está junto a él.&rdquo;
          </p>
          <p className="mt-2 text-[11px]">
            Con cariño, Bárbara & Daniel &bull; Diseñado con dedicación para nuestro gran día.
          </p>
        </div>
      </div>
    </footer>
  );
};
