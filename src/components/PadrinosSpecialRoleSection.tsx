import React from 'react';
import { Crown, Sparkles, Clock, Shirt, Heart, Star, MapPin } from 'lucide-react';

interface PadrinosSpecialRoleSectionProps {
  padrinoName?: string;
}

export const PadrinosSpecialRoleSection: React.FC<PadrinosSpecialRoleSectionProps> = ({
  padrinoName,
}) => {
  return (
    <section
      id="padrinos-rol"
      className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#FDFCF0] via-[#FAF6E9] to-[#F8F4EC] border-y-2 border-[#D4AF37]/50 relative overflow-hidden"
    >
      {/* Decorative Golden Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#BC986A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* VIP Crest Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18243D] text-[#D4AF37] border border-[#D4AF37] shadow-sm mb-4">
          <Crown className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-bold">
            Sección Exclusiva de Honor
          </span>
        </div>

        <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#18243D] mb-4">
          Su Rol Especial como Padrinos
        </h2>

        {padrinoName && (
          <p className="font-serif-display text-lg sm:text-xl text-[#B89A62] font-semibold mb-3">
            {padrinoName}
          </p>
        )}

        <p className="text-sm sm:text-base text-[#5A5A40] max-w-2xl mx-auto leading-relaxed mb-12 font-light">
          Para nosotros es una bendición infinita contar con ustedes como padrinos. Queremos que disfruten
          cada momento de esta celebración y tengan el lugar de privilegio que representan en nuestras vidas.
        </p>

        {/* 3 Detail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1: Vestuario y Armonía */}
          <div className="p-6 rounded-3xl bg-white/90 border-2 border-[#D4AF37]/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Shirt className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#18243D] mb-2 flex items-center gap-2">
              <span>Coordinación y Estilo</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B56] leading-relaxed">
              Deseamos que brillen junto a nosotros en las fotografías oficiales del cortejo. En las próximas semanas nos pondremos en contacto para sugerirles la paleta armónica de colores.
            </p>
          </div>

          {/* Card 2: Horario y Acompañamiento */}
          <div className="p-6 rounded-3xl bg-white/90 border-2 border-[#D4AF37]/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#18243D] mb-2 flex items-center gap-2">
              <span>Llegada Anticipada</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B56] leading-relaxed">
              Les solicitamos llegar <strong>30 minutos antes (17:30 hrs)</strong> al recinto para realizar la sesión de fotos familiares y estar juntos antes del inicio de la ceremonia.
            </p>
          </div>

          {/* Card 3: Asiento de Honor */}
          <div className="p-6 rounded-3xl bg-white/90 border-2 border-[#D4AF37]/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Star className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#18243D] mb-2 flex items-center gap-2">
              <span>Lugar en el Altar</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B56] leading-relaxed">
              Tendrán asientos de honor reservados en la primera fila de la ceremonia y en la mesa principal para acompañarnos con su bendición en todo momento.
            </p>
          </div>
        </div>

        {/* Emotive Closing Ribbon */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#5A5A40] font-medium">
          <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
          <span>¡Gracias por aceptar acompañarnos y ser parte fundamental de nuestro gran día!</span>
        </div>
      </div>
    </section>
  );
};

