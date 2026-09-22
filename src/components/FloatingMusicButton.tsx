import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Disc, Music, Play, Pause } from 'lucide-react';
import { weddingAudio } from '../utils/audioEngine';

interface FloatingMusicButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  audioBlobUrl: string | null;
}

export const FloatingMusicButton: React.FC<FloatingMusicButtonProps> = ({
  isPlaying,
  onToggle,
  audioBlobUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    weddingAudio.setCustomAudioUrl(audioBlobUrl);
  }, [audioBlobUrl]);

  const handleButtonClick = () => {
    if (isPlaying) {
      weddingAudio.stop();
      onToggle();
    } else {
      weddingAudio.start();
      onToggle();
    }
  };

  return (
    <aside aria-label="Reproductor de música" className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center">
      <button
        type="button"
        onClick={handleButtonClick}
        id="btn-floating-music"
        title={isPlaying 
          ? 'Pausar música - Reduce distracciones mientras lees' 
          : 'Reproducir "Caminar de tu mano" - Río Roma ft. Fonseca'}
        className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 transition-all duration-300 transform active:scale-95 hover:scale-105 cursor-pointer backdrop-blur-md ${
          isPlaying
            ? 'bg-[#5A5A40] text-white border-[#BC986A] shadow-[#5A5A40]/50 ring-4 ring-[#5A5A40]/25'
            : 'bg-[#FDFCF0] text-[#5A5A40] border-[#BC986A] shadow-lg hover:bg-[#EAE7DC]'
        }`}
      >
        {/* Animated Spinning Vinyl */}
        <div
          className={`relative flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
          style={{ animationDuration: '3.5s' }}
        >
          <Disc className={`w-5 h-5 ${isPlaying ? 'text-[#E0D8C3]' : 'text-[#8D8741]'}`} />
        </div>

        {/* Song Info */}
        <div className="text-left pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#BC986A] dark:text-[#E0D8C3]">
              {isPlaying ? 'Sonando' : 'Música de Boda'}
            </span>
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            )}
          </div>
          <p className="text-xs font-serif-display font-bold leading-tight text-current">
            Caminar de tu mano
          </p>
          <span className="text-[10px] text-current/80 block leading-tight font-sans">
            Río Roma ft. Fonseca
          </span>
        </div>

        {/* Volume status icon */}
        <div className="pl-2 border-l border-current/20 flex items-center">
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-[#E0D8C3] animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#8D8741]" />
          )}
        </div>
      </button>
    </aside>
  );
};
