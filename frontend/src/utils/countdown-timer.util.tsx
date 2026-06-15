'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
}

function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
  const [diff, setDiff] = useState(() =>
    Math.max(0, new Date(endTime).getTime() - Date.now()),
  );

  useEffect(() => {
    if (diff === 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const d = Math.max(0, new Date(endTime).getTime() - Date.now());
      setDiff(d);
      if (d === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (diff === 0) {
    return (
      <span className="text-xs tracking-[0.2em] uppercase font-sans text-red-700">
        Аукціон завершено
      </span>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const units = [
    { value: days, label: 'дн', show: days > 0 },
    { value: hours, label: 'год', show: true },
    { value: minutes, label: 'хв', show: true },
    { value: seconds, label: 'сек', show: true },
  ];

  return (
    <div className="flex items-end gap-4">
      {units
        .filter((u) => u.show)
        .map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="font-serif text-3xl text-stone-dark leading-none">
              {String(value).padStart(2, '0')}
            </p>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-warm font-sans mt-1">
              {label}
            </p>
          </div>
        ))}
    </div>
  );
}

export default CountdownTimer;
