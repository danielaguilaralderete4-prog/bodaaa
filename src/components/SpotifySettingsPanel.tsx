import React, { useEffect, useState } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { ExternalLink, Music2 } from 'lucide-react';
import { realtimeDb } from '../lib/firebase';
import { DEFAULT_SPOTIFY_PLAYLIST_URL } from './MusicRequestsSection';

export const SpotifySettingsPanel: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState(DEFAULT_SPOTIFY_PLAYLIST_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onValue(
      ref(realtimeDb, 'musicSettings/playlistUrl'),
      (snapshot) => {
        const value = snapshot.val();
        if (typeof value === 'string' && value.trim()) setPlaylistUrl(value);
        setIsLoading(false);
      },
      (loadError) => {
        console.error('No se pudo cargar la configuración de Spotify:', loadError);
        setError('No se pudo cargar la configuración. Recarga el panel e inténtalo de nuevo.');
        setIsLoading(false);
      }
    );
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(playlistUrl.trim());
    } catch {
      setError('Pega un enlace válido de una playlist de Spotify.');
      return;
    }

    if (
      parsedUrl.hostname !== 'open.spotify.com' ||
      !/^\/playlist\/[A-Za-z0-9]+\/?$/.test(parsedUrl.pathname)
    ) {
      setError('El enlace debe tener el formato https://open.spotify.com/playlist/…');
      return;
    }

    setIsSaving(true);
    try {
      await set(ref(realtimeDb, 'musicSettings/playlistUrl'), parsedUrl.toString());
      setPlaylistUrl(parsedUrl.toString());
      setMessage('Enlace actualizado. La página pública ya usa la nueva playlist.');
    } catch (saveError) {
      console.error('No se pudo guardar el enlace de Spotify:', saveError);
      setError('No se pudo guardar el enlace. Verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-[#D8C29A] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAE7DC] text-[#5A5A40]">
          <Music2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif-display text-xl font-bold text-[#333333]">Playlist de Spotify</h2>
          <p className="text-sm text-[#6B6B56]">Cambia el enlace sin modificar ni volver a publicar el sitio.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A5A40]">
          Enlace para invitar colaboradores
          <input
            type="url"
            required
            value={playlistUrl}
            onChange={(event) => setPlaylistUrl(event.target.value)}
            disabled={isLoading || isSaving}
            placeholder="https://open.spotify.com/playlist/…"
            className="mt-2 w-full rounded-xl border border-[#E0D8C3] bg-white px-3.5 py-3 text-sm font-normal normal-case tracking-normal text-[#333333] outline-none focus:border-[#5A5A40] disabled:opacity-60"
          />
        </label>
        <p className="text-xs leading-relaxed text-[#6B6B56]">
          En Spotify, usa «Invitar colaboradores» y pega aquí el enlace nuevo si el anterior deja
          de funcionar. El botón y el reproductor público se actualizarán automáticamente.
        </p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="rounded-xl bg-[#5A5A40] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#474732] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Guardando…' : 'Guardar enlace'}
          </button>
          <a
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A5A40] hover:underline"
          >
            Probar enlace <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </form>
    </section>
  );
};
