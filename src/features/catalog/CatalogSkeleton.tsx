const CARD_COUNT = 12;

// Скелетон только для самого первого показа, когда в кэше ещё ничего нет.
export function CatalogSkeleton() {
  return (
    <div className="catalog__grid catalog__grid--skeleton" aria-hidden="true">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div key={index} className="catalog__skeleton-card">
          <div className="catalog__skeleton-cover" />
          <div className="catalog__skeleton-line" />
          <div className="catalog__skeleton-line catalog__skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}
