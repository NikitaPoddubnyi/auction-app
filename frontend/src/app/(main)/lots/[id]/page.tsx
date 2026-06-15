'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { lotsApi, type Bid, type Lot } from '@/src/api/lots';
import { bidsApi } from '@/src/api/bids';
import { useAuth } from '@/src/contexts/auth.context';
import { CountdownTimer } from '@/src/utils';

export default function LotPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [lot, setLot] = useState<Lot | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [winner, setWinner] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const [amount, setAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    lotsApi.getOne(id).then((data) => {
      setLot(data);
      setBids(data.bids ?? []);
      setIsClosed(data.status === 'CLOSED');
      if (data.status === 'CLOSED' && data.winner) setWinner(data.winner);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const socket = io(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/auction`,
    );
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('joinLot', id));

    socket.on(
      'newBid',
      (payload: {
        amount: number;
        createdAt: string;
        bidder: Bid['bidder'];
      }) => {
        setLot((prev) =>
          prev ? { ...prev, currentPrice: payload.amount } : prev,
        );
        setBids((prev) => [
          {
            id: Date.now().toString(),
            amount: payload.amount,
            createdAt: payload.createdAt,
            bidderId: payload.bidder.id,
            bidder: payload.bidder,
          },
          ...prev,
        ]);
      },
    );

    socket.on(
      'lotClosed',
      (payload: { finalPrice: number; winner: Lot['winner'] }) => {
        setIsClosed(true);
        setLot((prev) =>
          prev
            ? { ...prev, status: 'CLOSED', currentPrice: payload.finalPrice }
            : prev,
        );
        if (payload.winner) setWinner(payload.winner);
      },
    );

    return () => {
      socket.emit('leaveLot', id);
      socket.disconnect();
    };
  }, [id]);

  const handleBid = async () => {
    if (!lot) return;
    const value = Number(amount);

    if (!value || value <= (lot.currentPrice ?? lot.startPrice)) {
      setBidError(
        `Ставка має перевищувати ${lot.currentPrice?.toLocaleString('uk-UA')} ₴`,
      );
      return;
    }

    setBidError('');
    setBidLoading(true);
    try {
      await bidsApi.create(id, value);
      setAmount('');
    } catch (err: any) {
      setBidError(err.response?.data?.message ?? 'Помилка при ставці');
    } finally {
      setBidLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-2xl font-light text-stone-warm">
          Завантаження...
        </p>
      </div>
    );

  if (!lot)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-2xl font-light text-stone-warm">
          Лот не знайдено
        </p>
      </div>
    );

  const minBid = (lot.currentPrice ?? lot.startPrice) + 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link
        href="/lots"
        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase
                   font-sans text-stone-warm hover:text-stone-dark transition-colors mb-10"
      >
        ← Всі лоти
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-4/3 relative overflow-hidden bg-[#E8E2D6] mb-6">
            {lot.logo?.url ? (
              <Image
                src={lot.logo.url}
                alt={lot.title ?? ''}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-6xl text-[#C9A84C]/30">
                  {lot.title?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs tracking-[0.2em] uppercase font-sans px-3 py-1.5 ${
                  isClosed
                    ? 'bg-stone-dark/80 text-[#F5F0E8]'
                    : 'bg-[#F5F0E8]/90 text-emerald-700'
                }`}
              >
                {isClosed ? 'Завершено' : 'Активний'}
              </span>
            </div>
          </div>

          <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-2">
            {lot.creator.firstName} {lot.creator.lastName}
          </p>
          <h1 className="font-serif text-4xl font-light text-stone-dark mb-4">
            {lot.title}
          </h1>
          <div className="h-px bg-[#C9A84C]/30 mb-4" />
          {lot.description && (
            <p className="font-sans text-sm text-stone-warm leading-relaxed">
              {lot.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-[#C9A84C]/20 p-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-1">
                  Поточна ставка
                </p>
                <p className="font-serif text-4xl text-stone-dark">
                  {lot.currentPrice?.toLocaleString('uk-UA')} ₴
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-1">
                  Початкова
                </p>
                <p className="font-serif text-xl text-stone-warm">
                  {lot.startPrice?.toLocaleString('uk-UA')} ₴
                </p>
              </div>
            </div>
            <div className="h-px bg-[#C9A84C]/20 mb-4" />
            <p className="text-xs tracking-[0.15em] uppercase text-stone-warm font-sans mb-3">
              {isClosed ? 'Аукціон завершено' : 'Залишилось'}
            </p>
            {!isClosed && (
              <CountdownTimer
                endTime={lot.endTime}
                onExpire={() => setIsClosed(true)}
              />
            )}
          </div>

          {isClosed && (
            <div className="border border-[#C9A84C]/40 bg-[#C9A84C]/5 p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-2">
                Переможець
              </p>
              {winner ? (
                <>
                  <p className="font-serif text-2xl text-stone-dark">
                    {winner.firstName} {winner.lastName}
                  </p>
                  <p className="font-sans text-sm text-stone-warm mt-1">
                    Фінальна ціна: {lot.currentPrice?.toLocaleString('uk-UA')} ₴
                  </p>
                </>
              ) : (
                <p className="font-serif text-xl text-stone-warm">
                  Ставок не було
                </p>
              )}
            </div>
          )}

          {!isClosed && (
            <div className="border border-[#C9A84C]/20 p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-warm font-sans mb-4">
                Зробити ставку
              </p>

              {user ? (
                <>
                  <div className="mb-4">
                    <label className="block text-xs tracking-[0.15em] uppercase text-stone-warm font-sans mb-2">
                      Ваша ставка (мін. {minBid.toLocaleString('uk-UA')} ₴)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setBidError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBid();
                        }
                      }}
                      placeholder={String(minBid)}
                      min={minBid}
                      className="w-full bg-transparent border-b border-[#C9A84C]/40 py-3
                                 text-stone-dark font-sans text-sm placeholder:text-stone-warm/40
                                 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  {bidError && (
                    <p className="text-red-700 text-xs font-sans border-l-2 border-red-700 pl-3 mb-4">
                      {bidError}
                    </p>
                  )}

                  <button
                    onClick={handleBid}
                    disabled={
                      bidLoading ||
                      !amount ||
                      Number(amount) <= (lot.currentPrice ?? 0)
                    }
                    className="w-full bg-stone-dark text-[#F5F0E8] py-4 text-xs tracking-[0.3em]
                               uppercase font-sans hover:bg-gold transition-colors duration-300
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {bidLoading ? 'Відправка...' : 'Зробити ставку'}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="font-sans text-sm text-stone-warm mb-4">
                    Щоб зробити ставку, увійдіть в акаунт
                  </p>
                  <Link
                    href={`/login?redirect=/lots/${id}`}
                    className="inline-block text-xs tracking-[0.3em] uppercase font-sans
                               bg-stone-dark text-[#F5F0E8] px-8 py-3
                               hover:bg-gold transition-colors duration-300"
                  >
                    Увійти
                  </Link>
                </div>
              )}
            </div>
          )}

          <p className="text-xs font-sans text-stone-warm">
            Всього ставок:{' '}
            <span className="text-stone-dark font-medium">{bids.length}</span>
          </p>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-serif text-3xl font-light text-stone-dark">
            Історія ставок
          </h2>
          <div className="h-px flex-1 bg-[#C9A84C]/20" />
        </div>

        {bids.length === 0 ? (
          <div className="text-center py-12 border border-[#C9A84C]/20">
            <p className="font-serif text-xl font-light text-stone-warm">
              Ставок ще немає
            </p>
            <p className="text-xs tracking-[0.2em] uppercase font-sans text-stone-warm/50 mt-2">
              Будьте першим
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#C9A84C]/10">
            {bids.map((bid, index) => (
              <div
                key={bid.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif text-sm text-[#C9A84C]/50 w-6 text-right">
                    {bids.length - index}
                  </span>
                  <div>
                    <p className="font-sans text-sm text-stone-dark">
                      {bid.bidder.firstName} {bid.bidder.lastName}
                    </p>
                    <p className="text-xs font-sans text-stone-warm">
                      {new Date(bid.createdAt).toLocaleString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-stone-dark">
                    {bid.amount?.toLocaleString('uk-UA')} ₴
                  </p>
                  {index === 0 && !isClosed && (
                    <p className="text-xs tracking-[0.15em] uppercase font-sans text-emerald-600">
                      Лідер
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
