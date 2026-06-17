'use client';

import { getPageNumbers } from '../utils/pagination.util';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages, maxVisible);

  return (
    <div className="mt-12 flex items-center justify-center gap-2 font-sans">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          px-4 py-2 text-xs tracking-[0.2em] uppercase
          border border-[#C9A84C]/30 text-stone-warm
          hover:border-gold hover:text-stone-dark
          transition-colors duration-300
          disabled:opacity-40 disabled:hover:border-[#C9A84C]/30
          disabled:hover:text-stone-warm
        "
      >
        Попер
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`dots-${index}`} className="px-2 text-stone-warm/60">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`
              w-10 h-10 text-xs font-sans transition-all duration-300
              border
              ${
                page === currentPage
                  ? 'bg-stone-dark text-[#F5F0E8] border-stone-dark'
                  : 'border-[#C9A84C]/30 text-stone-warm hover:border-gold hover:text-stone-dark'
              }
            `}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          px-4 py-2 text-xs tracking-[0.2em] uppercase
          border border-[#C9A84C]/30 text-stone-warm
          hover:border-gold hover:text-stone-dark
          transition-colors duration-300
          disabled:opacity-40 disabled:hover:border-[#C9A84C]/30
          disabled:hover:text-stone-warm
        "
      >
        Наст
      </button>
    </div>
  );
}
