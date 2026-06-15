'use client';
import { useEffect, useState } from 'react';

function CountdownCompact({ endTime }: { endTime: string }) {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (diff === 0) return <span className="text-red-700">Завершено</span>;

  return (
    <span>
      {h > 0 && `${h}г `}
      {m}хв {s}с
    </span>
  );
}

export default CountdownCompact;
