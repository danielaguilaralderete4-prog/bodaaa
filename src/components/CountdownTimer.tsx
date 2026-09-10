import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

interface CountdownTimerProps {
  targetDateISO: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDateISO }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const target = new Date(targetDateISO).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateISO]);

  if (timeLeft.isPast) {
    return (
      <div id="countdown-container" className="text-center py-4">
        <p className="font-serif-display text-2xl text-[#5A5A40] italic">
          ¡Hoy es el gran día de nuestra boda!
        </p>
      </div>
    );
  }

  return (
    <div
      id="countdown-container"
      className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 text-center"
    >
      {/* Days */}
      <div className="flex flex-col items-center min-w-[56px] sm:min-w-[72px]">
        <span
          id="days"
          className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#333333] tracking-tight"
        >
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-[#6B6B56] uppercase tracking-[0.15em] mt-1">
          Días
        </span>
      </div>

      <div className="text-2xl sm:text-3xl text-[#D8C3A5] font-light -mt-4">:</div>

      {/* Hours */}
      <div className="flex flex-col items-center min-w-[56px] sm:min-w-[72px]">
        <span
          id="hours"
          className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#333333] tracking-tight"
        >
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-[#6B6B56] uppercase tracking-[0.15em] mt-1">
          Horas
        </span>
      </div>

      <div className="text-2xl sm:text-3xl text-[#D8C3A5] font-light -mt-4">:</div>

      {/* Minutes */}
      <div className="flex flex-col items-center min-w-[56px] sm:min-w-[72px]">
        <span
          id="mins"
          className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#333333] tracking-tight"
        >
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-[#6B6B56] uppercase tracking-[0.15em] mt-1">
          Min
        </span>
      </div>

      <div className="text-2xl sm:text-3xl text-[#D8C3A5] font-light -mt-4">:</div>

      {/* Seconds */}
      <div className="flex flex-col items-center min-w-[56px] sm:min-w-[72px]">
        <span
          id="secs"
          className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#8D8741] tracking-tight"
        >
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-[#6B6B56] uppercase tracking-[0.15em] mt-1">
          Seg
        </span>
      </div>
    </div>
  );
};
