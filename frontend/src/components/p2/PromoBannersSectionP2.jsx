export default function PromoBannersSectionP2({
  collections = [],
  selectedCollection,
  setSelectedCollection,
  setCollectionModalOpen,
}) {
  if (collections.length === 0) return null;

  return (
    <section
      className="p2-collections-selector"
      aria-labelledby="p2-collections-title"
    >
      <div className="p2-collections-selector__heading">
        <p className="p2-collections-selector__eyebrow">Explora el catálogo</p>
        <h2 id="p2-collections-title">Filtra nuestras colecciones</h2>
        <p>Selecciona la colección que desees ver</p>
      </div>
      <div className="p2-collections-selector__grid">
        {collections.map((collection) => {
          const name = collection.coleccion_nombre ?? collection.nombre;
          const description =
            collection.coleccion_descripcion ?? collection.descripcion;
          const isSelected =
            (selectedCollection?.coleccion_nombre ??
              selectedCollection?.nombre) === name;

          return (
            <button
              key={name}
              type="button"
              className={`p2-collection-card ${isSelected ? "p2-collection-card--selected" : ""}`}
              aria-pressed={isSelected}
              onClick={() => {
                setSelectedCollection(collection);
                setCollectionModalOpen(true);
              }}
            >
              <span className="p2-collection-card__name">{name}</span>
              {description && (
                <span className="p2-collection-card__description">
                  {description}
                </span>
              )}
              <span className="p2-collection-card__action">
                Ver detalles <span aria-hidden="true">→</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
