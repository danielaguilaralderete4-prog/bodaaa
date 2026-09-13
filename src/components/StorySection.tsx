import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const StorySection: React.FC = () => {
  return (
    <section id="details" className="py-20 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Section Title Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] flex items-center justify-center mb-4 text-[#8D8741]">
          <Heart className="w-5 h-5 fill-[#8D8741]" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-2">
          Un Camino Juntos
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-semibold mb-6">
          Nuestra Historia
        </h2>
        <p className="text-base sm:text-lg text-[#6B6B56] leading-relaxed font-light">
          Nuestra unión es el reflejo de un camino compartido con complicidad, amor sincero y respeto mutuo. 
          Hoy, con la mayor alegría de nuestros corazones, damos el siguiente paso en nuestras vidas para celebrar 
          nuestro matrimonio civil y religioso rodeados de las personas que más amamos.
        </p>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent mt-8" />
      </div>

      {/* Quote Card */}
      <div className="max-w-3xl mx-auto relative rounded-3xl overflow-hidden bg-[#F7F3E9] border border-[#E0D8C3] flex flex-col justify-center items-center p-8 sm:p-10 text-center shadow-sm">
          <Sparkles className="w-8 h-8 text-[#8D8741] mb-4 opacity-80" />
          <p className="font-serif-display text-lg sm:text-xl text-[#333333] italic max-w-md leading-relaxed mb-4">
            &ldquo;Dos almas, un solo corazón. Uniendo nuestras vidas para siempre en este día tan esperado.&rdquo;
          </p>
          <span className="text-xs uppercase tracking-[0.2em] text-[#5A5A40] font-semibold">
            Bárbara & Daniel &bull; 12.12.2026
          </span>
      </div>

    </section>
  );
};
