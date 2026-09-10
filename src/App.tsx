import React, { useState, useEffect } from 'react';
import { GuestProvider } from './context/GuestContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ParentsBlessingSection } from './components/ParentsBlessingSection';
import { StorySection } from './components/StorySection';
import { EventDetailsSection } from './components/EventDetailsSection';
import { ProtocolSection } from './components/ProtocolSection';
import { GiftRegistrySection } from './components/GiftRegistrySection';
import { RSVPSection } from './components/RSVPSection';
import { AdminDashboard } from './components/AdminDashboard';
import { PasswordModal } from './components/PasswordModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { FloatingMusicButton } from './components/FloatingMusicButton';
import { getSavedAudioUrl } from './utils/audioStorage';
import { weddingAudio } from './utils/audioEngine';
import defaultWeddingSong from './assets/audio/caminar-de-tu-mano.mp3';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    weddingAudio.setCustomAudioUrl(defaultWeddingSong);

    const loadAudio = async () => {
      const url = await getSavedAudioUrl();
      if (url) {
        setAudioBlobUrl(url);
        weddingAudio.setCustomAudioUrl(url);
      }
    };
    loadAudio();

    // Browser audio policy: user gesture handler
    const handleFirstUserInteraction = () => {
      if (!weddingAudio.getPlayingState()) {
        weddingAudio.start();
        setIsPlayingMusic(true);
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminAuthenticated(Boolean(user));
    });
    return unsubscribe;
  }, []);

  const toggleMusic = () => {
    setIsPlayingMusic((prev) => !prev);
  };

  const handleAdminToggle = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen((prev) => !prev);
      return;
    }
    setIsPasswordModalOpen(true);
  };

  return (
    <GuestProvider>
      <div className="min-h-screen bg-[#FDFCF0] text-[#4A4A4A] font-sans antialiased selection:bg-[#EAE7DC] selection:text-[#5A5A40] relative">
        {/* Floating Music Button visible at bottom right */}
        <FloatingMusicButton
          isPlaying={isPlayingMusic}
          onToggle={toggleMusic}
          audioBlobUrl={audioBlobUrl}
        />

        {/* Desktop & Mobile Header */}
        <Header
          isAdminOpen={isAdminOpen}
          onToggleAdmin={handleAdminToggle}
        />

        {/* Main Wedding Invitation View */}
        <main className="w-full pb-24 md:pb-0">
          <HeroSection />
          <ParentsBlessingSection />
          <StorySection />
          <EventDetailsSection />
          <ProtocolSection />
          <GiftRegistrySection />
          <RSVPSection />
        </main>

        {/* Footer */}
        <Footer />

        {/* Mobile Fixed Bottom Navigation */}
        <MobileBottomNav
          isAdminOpen={isAdminOpen}
          onToggleAdmin={handleAdminToggle}
        />

        {/* Fullscreen Admin Management Dashboard Modal */}
        {isAdminOpen && (
          <AdminDashboard
            onClose={() => {
              setIsAdminOpen(false);
              setIsAdminAuthenticated(false);
              void signOut(auth);
            }}
          />
        )}

        {isPasswordModalOpen && (
          <PasswordModal
            onClose={() => setIsPasswordModalOpen(false)}
            onSuccess={() => {
              setIsPasswordModalOpen(false);
              setIsAdminAuthenticated(true);
              setIsAdminOpen(true);
            }}
          />
        )}
      </div>
    </GuestProvider>
  );
}
