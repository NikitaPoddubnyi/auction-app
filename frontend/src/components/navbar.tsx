'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth.context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-gold/30 bg-stone-cream">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/lots"
          className="font-serif text-2xl font-light tracking-widest text-stone-dark"
        >
          АУКЦІОН
        </Link>

        <div className="hidden md:block h-px flex-1 mx-8 bg-gold/20" />

        <nav className="flex items-center gap-6">
          <Link
            href="/lots"
            className="text-xs tracking-[0.2em] uppercase font-sans text-stone-warm hover:text-stone-dark transition-colors"
          >
            Лоти
          </Link>

          {user ? (
            <>
              <Link
                href="/lots/new"
                className="text-xs tracking-[0.2em] uppercase font-sans text-stone-warm hover:text-stone-dark transition-colors"
              >
                Виставити лот
              </Link>
              <span className="text-[18px] font-bold font-sans text-gold">
                {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs tracking-[0.2em] uppercase font-sans border-b border-gold/40 
                           hover:border-gold text-stone-dark transition-colors"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs tracking-[0.2em] uppercase font-sans text-stone-warm hover:text-stone-dark transition-colors"
              >
                Вхід
              </Link>
              <Link
                href="/register"
                className="text-xs tracking-[0.2em] uppercase font-sans bg-stone-dark text-stone-cream 
                           px-4 py-2 hover:bg-gold transition-colors duration-300"
              >
                Реєстрація
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
