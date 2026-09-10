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

      {/* Bento Grid Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Main large photo */}
        <div
          onClick={() => setSelectedPhoto(GALLERY_PHOTOS[0])}
          className="col-span-1 sm:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer aspect-[16/10] sm:aspect-auto sm:h-84 border border-[#E0D8C3] shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={GALLERY_PHOTOS[0].url}
            alt={GALLERY_PHOTOS[0].alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Double border frame for high-end craft */}
          <div className="absolute inset-3 sm:inset-4 border border-[#FDFCF0]/60 pointer-events-none rounded-2xl" />
          <div className="absolute inset-4 sm:inset-5 border border-[#BC986A]/40 pointer-events-none rounded-xl" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="text-white flex items-center justify-between w-full">
              <span className="text-sm font-medium">{GALLERY_PHOTOS[0].caption}</span>
              <ZoomIn className="w-5 h-5 text-[#EAE7DC]" />
            </div>
          </div>
        </div>

        {/* Second Photo: Rings */}
        <div
          onClick={() => setSelectedPhoto(GALLERY_PHOTOS[1])}
          className="col-span-1 relative rounded-3xl overflow-hidden group cursor-pointer aspect-square sm:aspect-auto sm:h-84 border border-[#E0D8C3] shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={GALLERY_PHOTOS[1].url}
            alt={GALLERY_PHOTOS[1].alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="text-white flex items-center justify-between w-full">
              <span className="text-sm font-medium">{GALLERY_PHOTOS[1].caption}</span>
              <ZoomIn className="w-5 h-5 text-[#EAE7DC]" />
            </div>
          </div>
        </div>

        {/* Third Photo: Black and white */}
        <div
          onClick={() => setSelectedPhoto(GALLERY_PHOTOS[2])}
          className="col-span-1 relative rounded-3xl overflow-hidden group cursor-pointer aspect-square sm:aspect-auto sm:h-84 border border-[#E0D8C3] shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={GALLERY_PHOTOS[2].url}
            alt={GALLERY_PHOTOS[2].alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="text-white flex items-center justify-between w-full">
              <span className="text-sm font-medium">{GALLERY_PHOTOS[2].caption}</span>
              <ZoomIn className="w-5 h-5 text-[#EAE7DC]" />
            </div>
          </div>
        </div>

        {/* Quote Card */}
        <div className="col-span-1 sm:col-span-2 relative rounded-3xl overflow-hidden bg-[#F7F3E9] border border-[#E0D8C3] flex flex-col justify-center items-center p-8 sm:p-10 text-center shadow-sm">
          <Sparkles className="w-8 h-8 text-[#8D8741] mb-4 opacity-80" />
          <p className="font-serif-display text-lg sm:text-xl text-[#333333] italic max-w-md leading-relaxed mb-4">
            &ldquo;Dos almas, un solo corazón. Uniendo nuestras vidas para siempre en este día tan esperado.&rdquo;
          </p>
          <span className="text-xs uppercase tracking-[0.2em] text-[#5A5A40] font-semibold">
            Bárbara & Daniel &bull; 12.12.2026
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {GALLERY_PHOTOS.slice(4).map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[#E0D8C3] shadow-sm group cursor-pointer text-left"
            aria-label={`Ver fotografía: ${photo.caption}`}
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-10 text-[11px] text-white/95 opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.caption}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-[#333333]/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#333333] rounded-3xl overflow-hidden shadow-2xl border border-[#E0D8C3]/30 flex flex-col"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt}
              className="max-h-[75vh] w-auto object-contain"
            />
            {selectedPhoto.caption && (
              <div className="p-4 bg-[#2A2A20] text-[#FDFCF0] text-center text-sm font-medium border-t border-white/10">
                {selectedPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
