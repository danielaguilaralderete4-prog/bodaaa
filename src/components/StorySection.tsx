import React, { useState } from 'react';
import { GALLERY_PHOTOS } from '../data/weddingInfo';
import { GalleryPhoto } from '../types';
import { Heart, Sparkles, X, ZoomIn } from 'lucide-react';

export const StorySection: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <section id="details" className="py-20 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Section Title Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
        <div className="w-12 h-12 rounded-full bg-[#E8DFCF] flex items-center justify-center mb-4 text-[#B89A62]">
          <Heart className="w-5 h-5 fill-[#B89A62]" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B89A62] mb-2">
          Con La Bendición de Dios
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-semibold mb-6">
          Bienvenidos a Nuestro Gran Día de Amor y Compromiso
        </h2>
        <p className="text-base sm:text-lg text-[#6B6B56] leading-relaxed font-light">
          Estamos profundamente felices y agradecidos con Dios por bendecir nuestra unión. No hay mayor alegria para nosotros que dar este paso rodeados de las personas que amamos.¡Gracias por ser parte de nuestra historia y acompañarnos en este día tan especial!.
        </p>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#B89A62] to-transparent mt-8" />
      </div>

      {/* Two-photo gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {GALLERY_PHOTOS.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className={`${photo.span ?? ''} relative h-80 sm:h-96 overflow-hidden rounded-3xl border border-[#E0D8C3] shadow-sm group cursor-pointer text-left`}
            aria-label={`Ver fotografía: ${photo.caption ?? photo.alt}`}
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                index === 0 ? 'object-center' : 'object-center'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
              <div className="text-white flex items-center justify-between w-full">
                <span className="text-sm font-medium">{photo.caption}</span>
                <ZoomIn className="w-5 h-5 text-[#EAE7DC]" />
              </div>
            </div>
            {index === 0 && (
              <>
                <div className="absolute inset-3 sm:inset-4 border border-[#FDFCF0]/60 pointer-events-none rounded-2xl" />
                <div className="absolute inset-4 sm:inset-5 border border-[#BC986A]/40 pointer-events-none rounded-xl" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Quote Card */}
      <div className="max-w-3xl mx-auto relative rounded-3xl overflow-hidden bg-[#FBF8F1] border border-[#D8C29A] flex flex-col justify-center items-center p-8 sm:p-10 text-center shadow-sm">
          <Sparkles className="w-8 h-8 text-[#B89A62] mb-4 opacity-80" />
          <p className="font-serif-display text-lg sm:text-xl text-[#333333] italic max-w-md leading-relaxed mb-4">
            &ldquo;Dos almas, un solo corazón. Uniendo nuestras vidas para siempre en este día tan esperado.&rdquo;
          </p>
          <span className="text-xs uppercase tracking-[0.2em] text-[#18243D] font-semibold">
            Bárbara & Daniel &bull; 12.12.2026
          </span>
      </div>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-[#333333]/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#333333] rounded-3xl overflow-hidden shadow-2xl border border-[#E0D8C3]/30 flex flex-col"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
              aria-label="Cerrar fotografía"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt}
              className="max-h-[75vh] w-auto object-contain"
            />
            <div className="p-4 bg-[#2A2A20] text-[#FDFCF0] text-center text-sm font-medium border-t border-white/10">
              {selectedPhoto.caption}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
