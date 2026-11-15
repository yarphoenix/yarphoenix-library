import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useStrings } from '../../shared/i18n/useStrings';
import './Pagination.scss';

type PageItem = number | 'gap';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

// Компактное окно страниц: 1 … p-1 p p+1 … total.
const pageWindow = (page: number, totalPages: number): PageItem[] => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: PageItem[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) {
      items.push('gap');
    }
    items.push(p);
    prev = p;
  }
  return items;
};

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useStrings();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label={t.paginationLabel}>
      <button
        type="button"
        className="pagination__arrow"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label={t.prevPage}
      >
        <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>

      {pageWindow(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`pagination__page ${item === page ? 'pagination__page--active' : ''}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__arrow"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label={t.nextPage}
      >
        <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </nav>
  );
}
