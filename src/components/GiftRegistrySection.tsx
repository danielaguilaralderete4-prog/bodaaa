import React from 'react';
import { WEDDING_DETAILS } from '../data/weddingInfo';
import { Gift, ExternalLink, Sparkles } from 'lucide-react';

export const GiftRegistrySection: React.FC = () => {
  return (
    <section id="gifts" className="py-20 sm:py-24 px-4 sm:px-6 bg-[#FBF8F1] border-y border-[#D8C29A]">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Badge Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E8DFCF] flex items-center justify-center mb-6 text-[#B89A62] shadow-sm">
          <Gift className="w-7 h-7" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-2">
          Muestras de Cariño
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-bold mb-4">
          Lista de Novios
        </h2>

        <p className="text-base sm:text-lg text-[#6B6B56] max-w-2xl leading-relaxed mb-8 font-light">
          El mayor y más hermoso regalo para nosotros siempre será contar con su compañía y cariño en este día tan significativo. 
          Si desea hacernos un presente para nuestro nuevo hogar, hemos dispuesto nuestra lista oficial en Paris Novios.
        </p>

        {/* Exclusive Paris Novios Card */}
        <div className="w-full max-w-md bg-[#F8F4EC] border-2 border-[#D8C29A] rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-between shadow-sm hover:shadow-md hover:border-[#18243D] transition-all group">
          <div className="w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F3E9] flex items-center justify-center mx-auto mb-5 text-[#5A5A40] group-hover:bg-[#EAE7DC] transition-colors shadow-inner">
              <Sparkles className="w-7 h-7 text-[#8D8741]" />
            </div>
            
            <h3 className="font-serif-display text-2xl font-bold text-[#333333] mb-2">
              Lista Paris Novios
            </h3>
            
            <p className="text-xs sm:text-sm text-[#6B6B56] mb-2">
              Haz clic en el botón a continuación para acceder directamente a nuestro catálogo de novios en Paris o búscanos con nuestro código:
            </p>

            <div className="my-4 py-3 px-6 rounded-2xl bg-[#EAE7DC] border border-[#E0D8C3] inline-block shadow-inner">
              <span className="text-[11px] uppercase tracking-wider text-[#6B6B56] block font-semibold mb-0.5">
                Código de Novios
              </span>
              <span className="text-2xl font-mono font-bold text-[#5A5A40] tracking-wider">
                {WEDDING_DETAILS.parisNoviosCode}
              </span>
            </div>
          </div>

          <a
            href={WEDDING_DETAILS.parisNoviosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-8 rounded-full bg-[#18243D] text-white hover:bg-[#283653] transition-all text-xs uppercase tracking-[0.15em] font-semibold shadow-md hover:shadow-lg mt-4 group/btn"
          >
            <span>Ver Lista de Regalos Paris</span>
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
