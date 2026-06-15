'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/src/contexts/auth.context';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/lots');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/lots');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Невірний email або пароль';

      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-warm mb-3 font-sans">
            Аукціонний майданчик
          </p>

          <h1 className="font-serif text-5xl font-light text-stone-dark leading-none">
            Вхід
          </h1>

          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gold" />
            <div className="w-1 h-1 rounded-full bg-gold" />
            <div className="h-px w-16 bg-gold" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm mb-2 font-sans">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full bg-transparent border-b border-gold/40  px-1 py-3 text-stone-dark
                         placeholder:text-stone-warm/50 font-sans text-sm
                         focus:outline-none focus:border-gold transition-colors duration-200"
            />
          </div>

          <div className="group">
            <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm mb-2 font-sans">
              Пароль
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-gold/40 px-1 py-3 text-stone-dark
                           placeholder:text-stone-warm/50 font-sans text-sm
                           focus:outline-none focus:border-gold transition-colors duration-200 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-warm hover:text-stone-dark transition-colors duration-200"
                aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="border-l-2 border-red-700 pl-3 py-1">
              <p className="text-red-700 text-xs font-sans tracking-wide">
                {error}
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-dark! text-stone-cream py-4 text-xs tracking-[0.3em]
                         uppercase font-sans hover:bg-gold! transition-colors duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ЗАВАНТАЖЕННЯ...' : 'УВІЙТИ'}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-xs font-sans text-stone-warm tracking-wide">
          Немає акаунту?{' '}
          <Link
            href="/register"
            className="text-stone-dark border-b border-gold/60 hover:border-gold transition-colors"
          >
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
