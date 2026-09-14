import React, { useState } from 'react';
import { WEDDING_DETAILS } from '../data/weddingInfo';
import eventMapImage from '../assets/images/event-map-real.png';
import {
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Check,
  CalendarPlus,
  Share2,
  Car,
} from 'lucide-react';

export const EventDetailsSection: React.FC = () => {
  const [copiedCalendar, setCopiedCalendar] = useState(false);

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent('Matrimonio Bárbara & Daniel 💍');
    const details = encodeURIComponent(
      'Celebración del Matrimonio de Bárbara & Daniel. \nLugar: Centro eventos Matri, Osorno.\nCódigo de Vestimenta: Formal (evitar blanco o azul marino).\n¡Los esperamos para celebrar juntos!'
    );
    const location = encodeURIComponent(WEDDING_DETAILS.venueAddress);
    // 2026-12-12 15:30 to 2026-12-13 04:00 (Osorno Chile UTC-3 in December).
    const dates = '20261212T183000Z/20261213T070000Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // Download .ics file
  const downloadIcsFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Barbara and Daniel Wedding//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Matrimonio Bárbara & Daniel 💍
DESCRIPTION:Celebración de la Boda de Bárbara & Daniel.\\nCentro eventos Matri, Osorno.
LOCATION:${WEDDING_DETAILS.venueAddress}
DTSTART:20261212T183000Z
DTEND:20261213T070000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Matrimonio_Barbara_y_Daniel.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCalendar(true);
    setTimeout(() => setCopiedCalendar(false), 3000);
  };

  return (
    <section id="event" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
        <div className="w-12 h-12 rounded-full bg-[#E8DFCF] flex items-center justify-center mb-4 text-[#B89A62]">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8D8741] mb-2">
          Coordenadas & Horarios
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#333333] font-semibold mb-4">
          La Celebración de Nuestro matrimonio
        </h2>
        <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#BC986A] to-transparent mt-4" />
      </div>

      {/* Venue details */}
      <div className="max-w-2xl mx-auto">
          <div className="bg-[#F8F4EC] border border-[#D8C29A] rounded-3xl p-6 sm:p-8 relative shadow-sm">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#5A5A40]" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#5A5A40]" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#5A5A40]" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#5A5A40]" />

            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#8D8741] font-semibold block mb-2">
                Recepción & Ceremonia
              </span>
              <h3 className="font-serif-display text-2xl text-[#333333] font-bold mb-1">
                {WEDDING_DETAILS.venueName}
              </h3>
              <p className="text-sm text-[#6B6B56] flex items-center justify-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-[#8D8741] shrink-0" />
                <span>{WEDDING_DETAILS.venueAddress}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8DFCF] text-[#18243D] rounded-full text-xs font-semibold mt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Inicio: {WEDDING_DETAILS.ceremonyTime}</span>
              </div>
            </div>

            {/* Map Preview Image */}
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#E0D8C3] mb-6 shadow-inner relative group">
              <img
                src={eventMapImage}
                alt="Mapa Centro eventos Matri Osorno - Ruta U-421"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs text-white/90 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  Ruta U-421, Km 7 &bull; Osorno
                </span>
              </div>
            </div>

            {/* Google Maps Action */}
            <a
              href={WEDDING_DETAILS.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#18243D] hover:bg-[#283653] text-white font-medium text-xs uppercase tracking-[0.15em] py-3.5 px-6 rounded-full transition-all shadow-sm hover:shadow-md mb-4"
            >
              <Navigation className="w-4 h-4" />
              Abrir en Google Maps
            </a>

            {/* Calendar actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E0D8C3]">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#18243D] bg-[#FBF8F1] hover:bg-[#E8DFCF] py-2.5 px-3 rounded-full border border-[#D8C29A] transition-colors font-medium"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#8D8741]" />
                <span>Google Calendar</span>
              </a>
              <button
                onClick={downloadIcsFile}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#18243D] bg-[#FBF8F1] hover:bg-[#E8DFCF] py-2.5 px-3 rounded-full border border-[#D8C29A] transition-colors font-medium"
              >
                {copiedCalendar ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#8D8741]" />
                    <span>¡Descargado!</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-[#8D8741]" />
                    <span>Apple / iCal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
    </section>
  );
};
