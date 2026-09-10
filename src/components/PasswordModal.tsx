import React, { useEffect, useRef, useState } from 'react';
import { Heart, LockKeyhole, X } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface PasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onSuccess();
    } catch (signInError) {
      const code = (signInError as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
        'auth/wrong-password': 'El correo o la contraseña no son correctos.',
        'auth/user-not-found': 'No existe una cuenta con ese correo en este proyecto Firebase.',
        'auth/invalid-email': 'El formato del correo electrónico no es válido.',
        'auth/too-many-requests': 'Hubo demasiados intentos. Espera unos minutos y vuelve a probar.',
        'auth/operation-not-allowed':
          'El acceso por correo y contraseña no está activado en Firebase Authentication.',
        'auth/unauthorized-domain':
          'Este dominio no está autorizado en Firebase Authentication. Agrégalo en Dominios autorizados.',
        'auth/network-request-failed':
          'No se pudo conectar con Firebase. Revisa tu conexión o bloqueadores del navegador.',
        'auth/invalid-api-key':
          'La configuración de Firebase no corresponde al proyecto activo.',
      };
      setError(messages[code ?? ''] ?? `Firebase rechazó el acceso (${code ?? 'error desconocido'}).`);
      setPassword('');
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#333333]/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exclusive-couple-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#E0D8C3] bg-[#FDFCF0] p-8 sm:p-10 text-center shadow-2xl animate-fade-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-3 rounded-[1.5rem] border border-[#E0D8C3]/70 pointer-events-none" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar acceso exclusivo"
          className="absolute right-5 top-5 z-10 rounded-full p-2 text-[#6B6B56] transition-colors hover:bg-[#EAE7DC] hover:text-[#5A5A40]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAE7DC] text-[#8D8741]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8D8741]">
            Espacio exclusivo
          </p>
          <h2 id="exclusive-couple-title" className="font-serif-display text-3xl text-[#333333]">
            Bárbara &amp; Daniel
          </h2>
          <div className="mx-auto my-5 h-px w-16 bg-gradient-to-r from-transparent via-[#BC986A] to-transparent" />
          <p className="mb-6 text-sm leading-relaxed text-[#6B6B56]">
            Ingresa tus credenciales para acceder al panel privado de los novios.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <label htmlFor="couple-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="couple-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="Correo electrónico"
              autoComplete="email"
              required
              className="w-full rounded-full border border-[#E0D8C3] bg-white/70 px-5 py-3 text-center text-sm text-[#4A4A4A] outline-none transition focus:border-[#8D8741] focus:ring-2 focus:ring-[#8D8741]/15"
            />
            <label htmlFor="couple-password" className="sr-only">
              Contraseña
            </label>
            <input
              ref={inputRef}
              id="couple-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
              className="w-full rounded-full border border-[#E0D8C3] bg-white/70 px-5 py-3 text-center text-sm text-[#4A4A4A] outline-none transition focus:border-[#8D8741] focus:ring-2 focus:ring-[#8D8741]/15"
            />
            {error && <p className="text-center text-xs text-[#9B5C52]">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-[#5A5A40] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-md transition-all hover:bg-[#474732] hover:shadow-lg"
            >
              {isSubmitting ? 'Validando acceso...' : 'Entrar al panel'}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#BC986A]">
            <Heart className="h-3 w-3 fill-[#BC986A]" />
            Solo para los novios
            <Heart className="h-3 w-3 fill-[#BC986A]" />
          </div>
        </div>
      </div>
    </div>
  );
};
