import ProductSectionP2 from "./ProductSectionP2";

export default function CollectionModalP2({
  collection,
  onClose,
  onProductSelect,
  estadoAlPorMayor,
  cantidadMinimaMayorista,
}) {
  if (!collection) return null;

  return (
    <div
      className="p2-collection-modal"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="p2-collection-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="p2-collection-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="p2-collection-modal__close"
          onClick={onClose}
          aria-label="Cerrar detalles de la colección"
        >
          ×
        </button>
        <div id="p2-collection-modal-title">
          <ProductSectionP2
            collection={collection}
            onProductSelect={onProductSelect}
            estadoAlPorMayor={estadoAlPorMayor}
            cantidadMinimaMayorista={cantidadMinimaMayorista}
          />
        </div>
      </div>
    </div>
  );
}
