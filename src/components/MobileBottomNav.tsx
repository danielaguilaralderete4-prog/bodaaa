import React from 'react';
import { Heart, Calendar, Mail, Gift, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  onToggleAdmin: () => void;
  isAdminOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onToggleAdmin,
  isAdminOpen,
}) => {
  return (
    <nav
      id="mobile-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFCF0]/95 backdrop-blur-md border-t border-[#E0D8C3] px-2 py-1.5 flex justify-around items-center shadow-lg"
    >
      <a
        href="#details"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-[#6B6B56] hover:text-[#5A5A40] transition-colors"
      >
        <Heart className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Historia</span>
      </a>

      <a
        href="#event"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-[#6B6B56] hover:text-[#5A5A40] transition-colors"
      >
        <Calendar className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Evento</span>
      </a>

      <a
        href="#rsvp"
        className="flex flex-col items-center justify-center py-1 px-3.5 bg-[#5A5A40] text-white rounded-full font-bold shadow-sm transition-transform active:scale-95"
      >
        <Mail className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] tracking-tight">RSVP</span>
      </a>

      <a
        href="#gifts"
        className="flex flex-col items-center justify-center py-1 px-2.5 text-[#6B6B56] hover:text-[#5A5A40] transition-colors"
      >
        <Gift className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Regalos</span>
      </a>

      <button
        onClick={onToggleAdmin}
        className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
          isAdminOpen ? 'text-[#5A5A40] font-bold' : 'text-[#6B6B56] hover:text-[#5A5A40]'
        }`}
      >
        <Shield className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Admin</span>
      </button>
    </nav>
  );
};
