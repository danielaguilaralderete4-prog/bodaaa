import React, { useEffect, useRef } from 'react';

interface MusicPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
  audioBlobUrl: string | null;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isPlaying, audioBlobUrl }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0.8;
    }

    const audio = audioRef.current;
    if (audioBlobUrl) {
      audio.src = audioBlobUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((e) => console.warn('Audio play error:', e));
      }
    }
  }, [audioBlobUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && audio.src) {
      audio.play().catch((e) => console.warn('Audio play error:', e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return null;
};
