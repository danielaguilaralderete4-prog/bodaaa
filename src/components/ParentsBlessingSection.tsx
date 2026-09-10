import React from 'react';
import { WEDDING_DETAILS } from '../data/weddingInfo';
import { Sparkles, Heart } from 'lucide-react';

export const ParentsBlessingSection: React.FC = () => {
  const { parents } = WEDDING_DETAILS;

  return (
    <section id="blessing" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Soft Glow & Subtle Botanical Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F7F3E9]/60 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main Elegant Card Container */}
        <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-8 sm:p-12 md:p-16 shadow-[0_10px_30px_rgba(90,90,64,0.04)] text-center relative overflow-hidden">
          
          {/* Subtle Decorative Frame */}
          <div className="absolute inset-3 sm:inset-5 border border-[#E0D8C3]/50 pointer-events-none rounded-2xl" />

          {/* Intertwined Gold Rings Graphic Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-12 flex items-center justify-center">
              {/* Left Ring */}
              <div className="w-9 h-9 rounded-full border-[2.5px] border-[#BC986A] shadow-sm transform -rotate-12 absolute left-1" />
              {/* Right Ring */}
              <div className="w-9 h-9 rounded-full border-[2.5px] border-[#8D8741] shadow-sm transform rotate-12 absolute right-1" />
              {/* Sparkle Accent */}
              <div className="absolute -top-1 right-2">
                <Sparkles className="w-3.5 h-3.5 text-[#BC986A]" />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <span className="text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold text-[#8D8741] block mb-2">
            Con la bendición de nuestros
          </span>

          <h2 className="font-serif-display italic text-3xl sm:text-4xl md:text-5xl text-[#5A5A40] font-normal mb-8 sm:mb-12">
            Padres:
          </h2>

          {/* Parents Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-8 max-w-2xl mx-auto items-center">
            {/* Bride's Parents */}
            <div className="flex flex-col items-center space-y-1.5 p-4 rounded-2xl bg-[#F7F3E9]/50 border border-[#E0D8C3]/40">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8D8741] font-semibold mb-2">
                Padres de la Novia
              </span>
              <p className="font-serif-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#333333]">
                {parents.bride.father}
              </p>
              <span className="font-serif-display italic text-lg text-[#BC986A] font-light">
                &amp;
              </span>
              <p className="font-serif-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#333333]">
                {parents.bride.mother}
              </p>
            </div>

            {/* Groom's Parents */}
            <div className="flex flex-col items-center space-y-1.5 p-4 rounded-2xl bg-[#F7F3E9]/50 border border-[#E0D8C3]/40">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8D8741] font-semibold mb-2">
                Padres del Novio
              </span>
              <p className="font-serif-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#333333]">
                {parents.groom.father}
              </p>
              <span className="font-serif-display italic text-lg text-[#BC986A] font-light">
                &amp;
              </span>
              <p className="font-serif-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#333333]">
                {parents.groom.mother}
              </p>
            </div>
          </div>

          {/* Subtle Bottom Accent Line */}
          <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent mx-auto mt-10" />
        </div>
      </div>
    </section>
  );
};
