import CampoLista from "./CampoLista";
import Icono from "./Icono";
import { ETIQUETAS } from "./TuInfoConfig";

export default function ListaPerfil({
  config,
  items,
  onAgregar,
  onCambiar,
  onVerDetalle,
  onCrear,
}) {
  const { key, title, description, icon, fields, optional } = config;

  return (
    <article
      className={`tu-info-list-section ${optional ? "tu-info-list-section--optional" : ""}`}
    >
      <div className="tu-info-list-header">
        <div className="tu-info-list-heading">
          <div className="tu-info-list-icon">{icon}</div>
          <div>
            <div className="tu-info-list-title-row">
              <h3>{title}</h3>
              {optional && <span className="tu-info-optional">Opcional</span>}
            </div>
            <p>{description}</p>
          </div>
        </div>
        <button
          type="button"
          className="tu-info-btn tu-info-btn--add"
          onClick={onAgregar}
        >
          <Icono tipo="agregar" /> Agregar
        </button>
      </div>

      <div className="tu-info-elements">
        {items.map((item, index) =>
          item.id ? (
            <article
              className="tu-info-element tu-info-element--compact"
              key={item.id}
            >
              <div className="tu-info-element__summary">
                <div>
                  <span>ELEMENTO {index + 1}</span>
                  <h4>
                    {item.titulo ||
                      item.descripcion?.slice(0, 70) ||
                      `Elemento ${index + 1}`}
                  </h4>
                </div>
                <div className="tu-info-element__actions">
                  <span
                    className={
                      item.estado
                        ? "tu-info-item-status is-active"
                        : "tu-info-item-status"
                    }
                  >
                    <span /> {item.estado ? "Activo" : "Inactivo"}
                  </span>
                  <button
                    type="button"
                    className="tu-info-btn tu-info-btn--detail"
                    onClick={() =>
                      onVerDetalle({ listKey: key, item, fields, index })
                    }
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
              <div className="tu-info-element__details">
                {fields
                  .filter((field) => field !== "estado")
                  .map((field) => (
                    <div className="tu-info-element__detail" key={field}>
                      <span>{ETIQUETAS[field] || field}</span>
                      <strong>{item[field] || "Sin información"}</strong>
                    </div>
                  ))}
              </div>
            </article>
          ) : (
            <div className="tu-info-element" key={`${key}-${index}`}>
              <div className="tu-info-element__top">
                <div>
                  <span>NUEVO ELEMENTO</span>
                  <h4>Información por completar</h4>
                </div>
              </div>
              <div className="tu-info-element__body">
                <div
                  className={`tu-info-list-grid ${fields.includes("descripcion") ? "tu-info-list-grid--description" : ""}`}
                >
                  {fields.map((field) => (
                    <CampoLista
                      key={field}
                      field={field}
                      value={item[field]}
                      onChange={(campo, value) =>
                        onCambiar(index, campo, value)
                      }
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="tu-info-btn tu-info-btn--save-section"
                  onClick={() => onCrear(index)}
                >
                  <Icono tipo="guardar" /> Guardar elemento
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="tu-info-list-footer">
        <div>
          <strong>{items.length}</strong>
          <span>
            {items.length === 1 ? " elemento" : " elementos"} configurado
            {items.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </article>
  );
}
