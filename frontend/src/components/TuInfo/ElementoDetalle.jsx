import { ETIQUETAS } from "./TuInfoConfig";

export default function ElementoDetalle({
  selected,
  onClose,
  onActualizar,
  onEliminar,
}) {
  if (!selected) return null;

  const { listKey, item, fields, index } = selected;
  return (
    <div
      className="tu-info-detail-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="tu-info-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tu-info-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="tu-info-detail__header">
          <div>
            <span>Elemento {index + 1}</span>
            <h2 id="tu-info-detail-title">
              {item.titulo || item.descripcion || "Detalle del elemento"}
            </h2>
          </div>
          <button
            type="button"
            className="tu-info-detail__close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="tu-info-detail__fields">
          {fields.map((field) => (
            <div className="tu-info-detail__field" key={field}>
              <span>{ETIQUETAS[field] || field}</span>
              <strong>
                {field === "estado"
                  ? item[field]
                    ? "Activo"
                    : "Inactivo"
                  : item[field] || "Sin información"}
              </strong>
            </div>
          ))}
        </div>
        <div className="tu-info-detail__actions">
          <button type="button" onClick={() => onActualizar(listKey, item)}>
            Modificar
          </button>
          <button
            type="button"
            onClick={() => onEliminar(listKey, index, item)}
          >
            Eliminar
          </button>
        </div>
      </section>
    </div>
  );
}
