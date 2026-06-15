import Image from 'next/image';
import Link from 'next/link';
import { Lot } from '../api/lots';
import { CountdownCompact } from '../utils';

export default function LotCard({ lot }: { lot: Lot }) {
  return (
    <Link href={`/lots/${lot.id}`} className="group block">
      <div className="border border-[#C9A84C]/20 hover:border-[#C9A84C]/60 transition-colors duration-300 bg-white/40">
        <div className="aspect-4/3 overflow-hidden bg-[#E8E2D6] relative">
          {lot.logo?.url ? (
            <Image
              src={lot.logo.url}
              alt={lot.title ?? ''}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-4xl text-[#C9A84C]/30">
                {lot.title?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-1">
            {lot.creator.firstName} {lot.creator.lastName}
          </p>
          <h3 className="font-serif text-xl font-light text-stone-dark mb-3 line-clamp-1">
            {lot.title}
          </h3>

          <div className="h-px bg-[#C9A84C]/20 mb-3" />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-stone-warm font-sans">
                Поточна ставка
              </p>
              <p className="font-serif text-2xl text-stone-dark">
                {lot.currentPrice?.toLocaleString('uk-UA')} ₴
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs tracking-[0.15em] uppercase text-stone-warm font-sans">
                Залишилось
              </p>
              <p className="font-sans text-sm text-stone-dark">
                <CountdownCompact endTime={lot.endTime} />
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-sans text-stone-warm">
              {lot._count?.bids ?? 0} ставок
            </span>
            <span
              className={`text-xs tracking-[0.15em] uppercase font-sans px-2 py-1 ${
                lot.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-stone-100 text-stone-warm'
              }`}
            >
              {lot.status === 'ACTIVE' ? 'Активний' : 'Завершено'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
