import React from 'react';
import { ExternalLink, Music2, Sparkles } from 'lucide-react';

const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/5O0p3bCLI6WbehiwhOAphs?si=a0JFITffSLa3DeG4hOKzzQ&utm_source=copy-link&pt=7169f688ff3efd6dd0fbba6480464e4b&pi=B-2pwCKmTNCq-';
const SPOTIFY_EMBED_URL = 'https://open.spotify.com/embed/playlist/5O0p3bCLI6WbehiwhOAphs?utm_source=generator&theme=0';

export const MusicRequestsSection: React.FC = () => {
  return (
    <section id="music" className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[#D8C29A] bg-[#FBF8F1] px-6 py-12 text-center shadow-sm sm:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E8DFCF]/55" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full border border-[#B89A62]/25" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8DFCF] text-[#18243D]">
            <Music2 className="h-6 w-6" />
          </div>
          <Sparkles className="mb-3 h-4 w-4 text-[#B89A62]" />
          <h2 className="font-serif-display text-3xl font-semibold text-[#18243D] sm:text-4xl">
            ¡Que comience la fiesta!
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[#536078] sm:text-base">
            Siempre hay canciones que encienden la pista. Ayúdennos a crear la banda sonora de
            este día agregando sus canciones favoritas a nuestra playlist.
          </p>
          <a
            href={SPOTIFY_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#18243D] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-md transition-all hover:bg-[#283653] hover:shadow-lg"
          >
            Ser colaborador
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#B89A62]">
            Agrega esa canción que no puede faltar
          </p>
          <div className="mt-8 w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#D8C29A]/70 shadow-md">
            <iframe
              title="Playlist colaborativa de Spotify"
              src={SPOTIFY_EMBED_URL}
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="block border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
