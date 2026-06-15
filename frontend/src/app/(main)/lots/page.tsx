'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/contexts/auth.context';
import { Lot, lotsApi } from '@/src/api/lots';
import LotCard from '@/src/components/lot-card';
import { Pagination } from '@/src/components/pagination';

export default function LotsPage() {
  const { user } = useAuth();

  const [lots, setLots] = useState<Lot[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    lotsApi
      .getAll(page)
      .then(({ items, meta }) => {
        if (!isMounted) return;

        setLots(items);
        setMeta(meta);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-stone-warm font-sans mb-2">
            Активні торги
          </p>

          <h1 className="font-serif text-5xl font-light text-stone-dark">
            Лоти
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-12 bg-gold" />
            <div className="w-1 h-1 rounded-full bg-gold" />
          </div>
        </div>

        {user && (
          <Link
            href="/lots/new"
            className="
              text-xs tracking-[0.3em] uppercase font-sans
              bg-stone-dark text-[#F5F0E8]
              px-6 py-3
              hover:bg-gold transition-colors duration-300
            "
          >
            Виставити лот
          </Link>
        )}
      </div>

      {loading && (
        <div className="text-center py-24">
          <p className="font-serif text-2xl font-light text-stone-warm">
            Завантаження...
          </p>
        </div>
      )}

      {!loading && lots.length === 0 && (
        <div className="text-center py-24 border border-[#C9A84C]/20">
          <p className="font-serif text-3xl font-light text-stone-warm mb-4">
            Активних лотів немає
          </p>

          <p className="text-xs tracking-[0.2em] uppercase font-sans text-stone-warm/60 mb-8">
            Станьте першим, хто виставить лот
          </p>

          {user ? (
            <Link
              href="/lots/new"
              className="
                text-xs tracking-[0.3em] uppercase font-sans
                bg-stone-dark text-[#F5F0E8]
                px-8 py-3
                hover:bg-gold transition-colors duration-300
              "
            >
              Виставити лот
            </Link>
          ) : (
            <Link
              href="/login"
              className="
                text-xs tracking-[0.3em] uppercase font-sans
                border border-stone-dark text-stone-dark
                px-8 py-3
                hover:bg-stone-dark hover:text-[#F5F0E8]
                transition-colors duration-300
              "
            >
              Увійти щоб виставити лот
            </Link>
          )}
        </div>
      )}

      {!loading && lots.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              maxVisible={5}
            />
          )}
        </>
      )}
    </div>
  );
}
