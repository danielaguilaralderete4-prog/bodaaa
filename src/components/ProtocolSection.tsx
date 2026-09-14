import React from 'react';
import { Shirt, Users, Footprints, Sparkles } from 'lucide-react';

export const ProtocolSection: React.FC = () => {
  return (
    <section id="protocol" className="py-20 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
        <div className="w-12 h-12 rounded-full bg-[#E8DFCF] flex items-center justify-center mb-4 text-[#B89A62]">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-2">
          Protocolo & Recomendaciones
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-semibold mb-4">
          Detalles para su Comodidad
        </h2>
        <p className="text-sm sm:text-base text-[#6B6B56]">
          Queremos que disfruten al máximo de esta velada inolvidable. Tengan en cuenta las siguientes consideraciones:
        </p>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent mt-6" />
      </div>

      {/* Protocol Cards */}
      <div className="flex flex-col gap-6">
        {/* Dress code */}
        <div className="bg-[#F8F4EC] border border-[#D8C29A] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:border-[#18243D] transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8DFCF]/40 rounded-bl-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40]">
              <Shirt className="w-6 h-6 text-[#8D8741]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-1">
                Código de vestimenta
              </span>
              <p className="text-sm sm:text-base text-[#6B6B56] leading-relaxed">
                Formal
              </p>
            </div>
          </div>
        </div>

        {/* Adults only */}
        <div className="bg-[#F8F4EC] border border-[#D8C29A] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:border-[#18243D] transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8DFCF]/40 rounded-bl-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40]">
              <Users className="w-6 h-6 text-[#8D8741]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-1">
                Ambiente
              </span>
              <p className="text-sm sm:text-base text-[#6B6B56] leading-relaxed">
                Celebración exclusiva para adultos. Adoramos a los niños, sin embargo, queremos que todos nuestros invitados puedan relajarse y disfrutar plenamente de esta noche tan especial.
              </p>
              <p className="text-xs text-[#6B6B56] italic leading-relaxed mt-2">
                Agradecemos profundamente su comprensión y apoyo.
              </p>
            </div>
          </div>
        </div>

        {/* Guest recommendation */}
        <div className="bg-[#F8F4EC] border border-[#D8C29A] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:border-[#18243D] transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8DFCF]/40 rounded-bl-full pointer-events-none" />
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
