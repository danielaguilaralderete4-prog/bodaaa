import React, { useState, useEffect } from 'react';
import { GuestProvider } from './context/GuestContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { EventDetailsSection } from './components/EventDetailsSection';
import { ProtocolSection } from './components/ProtocolSection';
import { GiftRegistrySection } from './components/GiftRegistrySection';
import {GiftRegistryPage} from './components/GiftRegistryPage';
import {RSVPSection} from './components/RSVPSection';
import {MusicRequestsSection} from './components/MusicRequestsSection';
import {AdminDashboard} from './components/AdminDashboard';
import {PasswordModal} from './components/PasswordModal';
import {MobileBottomNav} from './components/MobileBottomNav';
import {Footer} from './components/Footer';
import {FloatingMusicButton} from './components/FloatingMusicButton';
import {getSavedAudioUrl} from './utils/audioStorage';
import {weddingAudio} from './utils/audioEngine';
import defaultWeddingSong from './assets/audio/caminar-de-tu-mano.mp3';
import {auth} from './lib/firebase';
import {onAuthStateChanged, signOut} from 'firebase/auth';
import { GiftProvider } from './context/GiftContext';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showGiftPage, setShowGiftPage] = useState(false);
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

  const syncGiftPageState = () => {
    const params = new URLSearchParams(window.location.search);
    setShowGiftPage(params.get('page') === 'regalos');
  };

  useEffect(() => {
    syncGiftPageState();

    const handleLocationChange = () => syncGiftPageState();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const openGiftPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'regalos');
    window.history.pushState({}, '', url);
    syncGiftPageState();
  };

  const openInvitationPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    window.history.pushState({}, '', url);
    syncGiftPageState();
  };

  return (
    <GiftProvider>
      <GuestProvider>
        <div className="min-h-screen bg-[#F8F4EC] text-[#3B3B3B] font-sans antialiased selection:bg-[#E8DFCF] selection:text-[#18243D] relative">
          {showGiftPage ? (
            <GiftRegistryPage onClose={openInvitationPage} />
          ) : (
            <>
              {/* Floating Music Button visible at bottom right */}
              <FloatingMusicButton
                isPlaying={isPlayingMusic}
                onToggle={toggleMusic}
                audioBlobUrl={audioBlobUrl}
              />

              <Header isAdminOpen={isAdminOpen} onToggleAdmin={handleAdminToggle} />

              <main className="w-full pb-24 md:pb-0">
                <HeroSection />
                <StorySection />
                <EventDetailsSection />
                <ProtocolSection />
                <GiftRegistrySection onOpenGiftPage={openGiftPage} />
                <RSVPSection />
                <MusicRequestsSection />
              </main>

              <Footer onOpenGiftPage={openGiftPage} />

              <MobileBottomNav isAdminOpen={isAdminOpen} onToggleAdmin={handleAdminToggle} />
            </>
          )}

          {showGiftPage && (
            <div className="fixed bottom-4 left-4 z-40">
              <button
                type="button"
                onClick={openInvitationPage}
                className="rounded-full bg-[#18243D] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
              >
                Volver a la invitación
              </button>
            </div>
          )}

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
    </GiftProvider>
  );
}
