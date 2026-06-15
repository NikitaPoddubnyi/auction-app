'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/src/contexts/auth.context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: '',
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "Ім'я обов'язкове";
    } else if (form.firstName.length < 2) {
      newErrors.firstName = 'Мінімум 2 символи';
    } else if (!/^[A-Za-zА-Яа-яІіЇїЄє'-]+$/.test(form.firstName)) {
      newErrors.firstName = 'Тільки літери';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Прізвище обов'язкове";
    } else if (form.lastName.length < 2) {
      newErrors.lastName = 'Мінімум 2 символи';
    } else if (!/^[A-Za-zА-Яа-яІіЇїЄє'-]+$/.test(form.lastName)) {
      newErrors.lastName = 'Тільки літери';
    }

    if (!form.email.trim()) {
      newErrors.email = "Email обов'язковий";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Некоректний email';
    }

    if (!form.password) {
      newErrors.password = "Пароль обов'язковий";
    } else if (form.password.length < 6) {
      newErrors.password = 'Мінімум 6 символів';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await register(form);
      router.push('/lots');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Помилка реєстрації';

      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'firstName',
      label: "Ім'я",
      placeholder: 'Іван',
      type: 'text',
    },
    {
      name: 'lastName',
      label: 'Прізвище',
      placeholder: 'Іванов',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'your@email.com',
      type: 'email',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-warm mb-3 font-sans">
            Аукціонний майданчик
          </p>

          <h1 className="font-serif text-5xl font-light text-stone-dark leading-none">
            Реєстрація
          </h1>

          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gold" />
            <div className="w-1 h-1 rounded-full bg-gold" />
            <div className="h-px w-16 bg-gold" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ name, label, placeholder, type }) => (
            <div key={name}>
              <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm mb-2 font-sans">
                {label}
              </label>

              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={(form as any)[name]}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-gold/40 px-1 py-3 text-stone-dark
                           placeholder:text-stone-warm/50 font-sans text-sm
                           focus:outline-none focus:border-gold transition-colors duration-200"
              />

              {errors[name] && (
                <p className="text-red-700 text-xs mt-1 font-sans">
                  {errors[name]}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm mb-2 font-sans">
              Пароль
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-gold/40 px-1 py-3 text-stone-dark
                           placeholder:text-stone-warm/50 font-sans text-sm
                           focus:outline-none focus:border-gold transition-colors duration-200 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-warm hover:text-stone-dark transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-700 text-xs mt-1 font-sans">
                {errors.password}
              </p>
            )}
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
              className="w-full bg-stone-dark text-stone-cream py-4 text-xs tracking-[0.3em]
                         uppercase font-sans hover:bg-gold transition-colors duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ЗАВАНТАЖЕННЯ...' : 'СТВОРИТИ АКАУНТ'}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-xs font-sans text-stone-warm tracking-wide">
          Вже є акаунт?{' '}
          <Link
            href="/login"
            className="text-stone-dark border-b border-gold/60 hover:border-gold transition-colors"
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
