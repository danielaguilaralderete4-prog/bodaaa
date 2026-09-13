import React from 'react';
import { Shirt, Users, Footprints, Sparkles } from 'lucide-react';

export const ProtocolSection: React.FC = () => {
  return (
    <section id="protocol" className="py-20 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
        <div className="w-12 h-12 rounded-full bg-[#EAE7DC] flex items-center justify-center mb-4 text-[#8D8741]">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-2">
          Protocolo & Recomendaciones
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-semibold mb-4">
          Detalles para tu Comodidad
        </h2>
        <p className="text-sm sm:text-base text-[#6B6B56]">
          Queremos que disfrutes al máximo de esta velada inolvidable. Ten en cuenta las siguientes consideraciones:
        </p>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent mt-6" />
      </div>

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Dress Code */}
        <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-8 shadow-sm flex items-center justify-center relative overflow-hidden group hover:border-[#5A5A40] transition-all min-h-[190px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EAE7DC]/40 rounded-bl-full pointer-events-none" />
          <div className="relative w-full flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 text-center sm:text-left">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40]">
              <Shirt className="w-6 h-6 text-[#8D8741]" />
            </div>
            <div className="flex items-center gap-5 sm:gap-8">
              <div className="hidden sm:block w-16 h-px bg-gradient-to-r from-transparent via-[#BC986A] to-transparent" />
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-2">
                  Código de vestimenta
                </span>
                <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#333333]">
                  Formal
                </h3>
              </div>
              <div className="hidden sm:block w-16 h-px bg-gradient-to-r from-[#BC986A] to-transparent" />
            </div>
          </div>
        </div>

        {/* Card 2: Adults Only */}
        <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#5A5A40] transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EAE7DC]/40 rounded-bl-full pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40] mb-5">
              <Users className="w-6 h-6 text-[#8D8741]" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-1">
              Ambiente
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#333333] mb-3">
              Solo Adultos
            </h3>
            <p className="text-sm text-[#6B6B56] leading-relaxed mb-4">
              Adoramos a los niños, sin embargo, para que todos nuestros invitados puedan relajarse y brindar sin preocupaciones durante toda la noche, hemos optado por una celebración exclusivamente para adultos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] mt-2 text-center">
            <p className="text-xs text-[#6B6B56] italic">
              Agradecemos profundamente su comprensión y apoyo para esta noche tan especial.
            </p>
          </div>
        </div>

        {/* Card 3: Guest recommendation */}
        <div className="md:col-span-2 bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:border-[#5A5A40] transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EAE7DC]/40 rounded-bl-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40]">
              <Footprints className="w-6 h-6 text-[#8D8741]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-1">
                Recomendaciones
              </span>
              <p className="text-sm sm:text-base text-[#6B6B56] leading-relaxed">
                A nuestras invitadas les recomendamos considerar un calzado cómodo, ya que habrá sectores con césped durante el evento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
