'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { lotsApi } from '@/src/api/lots';
import { useAuth } from '@/src/contexts/auth.context';

export default function NewLotPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startPrice: '',
    endTime: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoading && !user) {
    router.push('/login?redirect=/lots/new');
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Введіть назву лота');
      return;
    }
    if (!form.startPrice || Number(form.startPrice) <= 0) {
      setError('Початкова ціна має бути більше 0');
      return;
    }
    if (!form.endTime) {
      setError('Вкажіть час завершення');
      return;
    }
    if (new Date(form.endTime) <= new Date()) {
      setError('Час завершення має бути в майбутньому');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('startPrice', form.startPrice);
      formData.append('endTime', new Date(form.endTime).toISOString());
      if (file) formData.append('file', file);

      const lot = await lotsApi.create(formData);
      router.push(`/lots/${lot.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Помилка при створенні лота');
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/lots"
        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase
                   font-sans text-stone-warm hover:text-stone-dark transition-colors mb-10"
      >
        ← Всі лоти
      </Link>

      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-warm font-sans mb-2">
          Новий лот
        </p>
        <h1 className="font-serif text-5xl font-light text-stone-dark">
          Виставити лот
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-px w-12 bg-gold" />
          <div className="w-1 h-1 rounded-full bg-gold" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-3">
            Фото лота
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video relative border border-[#C9A84C]/30 hover:border-[#C9A84C]/70
                       transition-colors cursor-pointer overflow-hidden bg-[#E8E2D6] group"
          >
            {preview ? (
              <Image
                src={preview}
                alt="preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <span className="font-serif text-4xl text-[#C9A84C]/40">+</span>
                <p className="text-xs tracking-[0.2em] uppercase font-sans text-stone-warm/60">
                  Натисніть щоб додати фото
                </p>
              </div>
            )}

            {preview && (
              <div
                className="absolute inset-0 bg-stone-dark/40 opacity-0 group-hover:opacity-100
                              transition-opacity flex items-center justify-center"
              >
                <p className="text-xs tracking-[0.2em] uppercase font-sans text-[#F5F0E8]">
                  Змінити фото
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        <div className="h-px bg-[#C9A84C]/20" />

        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-2">
            Назва *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Наприклад: Vintage Gibson Les Paul 1959"
            required
            className="w-full bg-transparent border-b border-[#C9A84C]/40 py-3 text-stone-dark
                       font-sans text-sm placeholder:text-stone-warm/40
                       focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-2">
            Опис
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Детальний опис лота..."
            rows={4}
            className="w-full bg-transparent border-b border-[#C9A84C]/40 py-3 text-stone-dark
                       font-sans text-sm placeholder:text-stone-warm/40 resize-none
                       focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-2">
              Початкова ціна (₴) *
            </label>
            <input
              type="number"
              name="startPrice"
              value={form.startPrice}
              onChange={handleChange}
              placeholder="500"
              min={1}
              required
              className="w-full bg-transparent border-b border-[#C9A84C]/40 py-3 text-stone-dark
                         font-sans text-sm placeholder:text-stone-warm/40
                         focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-2">
              Завершення *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              min={minDateTime}
              required
              className="w-full bg-transparent border-b border-[#C9A84C]/40 py-3 text-stone-dark
                         font-sans text-sm placeholder:text-stone-warm/40
                         focus:outline-none focus:border-gold transition-colors
                         color-scheme:light"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-700 text-xs font-sans border-l-2 border-red-700 pl-3">
            {error}
          </p>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-stone-dark text-[#F5F0E8] py-4 text-xs tracking-[0.3em]
                       uppercase font-sans hover:bg-gold transition-colors duration-300
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Публікація...' : 'Опублікувати лот'}
          </button>
          <Link
            href="/lots"
            className="px-8 py-4 text-xs tracking-[0.3em] uppercase font-sans
                       border border-[#C9A84C]/40 text-stone-warm
                       hover:border-stone-dark hover:text-stone-dark transition-colors"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
