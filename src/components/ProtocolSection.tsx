import React from 'react';
import { Shirt, Users, Footprints, Trees, Sparkles } from 'lucide-react';

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
        <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-[#5A5A40] transition-all min-h-[260px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EAE7DC]/40 rounded-bl-full pointer-events-none" />
          <div className="relative text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40] mb-5">
              <Shirt className="w-6 h-6 text-[#8D8741]" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-2">
              Código de vestimenta
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#333333] mb-3">
              Formal
            </h3>
            <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[#BC986A] to-transparent" />
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

        {/* Card 3: Footwear / Lawn Recommendation */}
        <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#5A5A40] transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40] mb-5">
              <Footprints className="w-6 h-6 text-[#8D8741]" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-1">
              Recomendación de Calzado
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#333333] mb-3">
              Áreas de Césped & Jardines
            </h3>
            <p className="text-sm text-[#6B6B56] leading-relaxed mb-2">
              Tanto la ceremonia como el cóctel de bienvenida se llevarán a cabo en los hermosos jardines del centro de eventos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] mt-4">
            <p className="text-xs text-[#6B6B56] leading-relaxed">
              Sugerimos a nuestras invitadas considerar tacón ancho, corrido, cubretacones o calzado cómodo apto para superficies de pasto.
            </p>
          </div>
        </div>

        {/* Card 4: Spaces & Venue Comforts */}
        <div className="bg-[#FDFCF0] border border-[#E0D8C3] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#5A5A40] transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] flex items-center justify-center text-[#5A5A40] mb-5">
              <Trees className="w-6 h-6 text-[#8D8741]" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8D8741] font-semibold block mb-1">
              Espacios & Comodidades
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#333333] mb-3">
              Estacionamiento & Áreas Verdes
            </h3>
            <p className="text-sm text-[#6B6B56] leading-relaxed mb-2">
              El Centro eventos Matri cuenta con amplio estacionamiento para todos los vehículos, hermosas áreas verdes al aire libre y baños privados para su total confort.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F3E9] border border-[#E0D8C3] mt-4">
            <p className="text-xs text-[#6B6B56] leading-relaxed">
              Un entorno natural, tranquilo y espacioso pensado para que disfruten cada momento de la celebración junto a nosotros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
