import { useEffect, useState } from "react";
import { TraerAlimentoPublico } from "../../api/axios";

/* ════════════════════════════════════════
   P3ProductModal — detalle + agregar a bolsa
   Props:
     producto        — objeto producto / alimento (datos base ya cargados)
     formatearPrecio — función de formato de precio
     onClose         — callback al cerrar
     onAgregar(item) — callback cuando el usuario confirma agregar a bolsa
════════════════════════════════════════ */
export default function P3ProductModal({ producto, formatearPrecio, onClose, onAgregar }) {
  const [ingredientes, setIngredientes] = useState(producto.ingredientes ?? []);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState(false);
  const [cantidad,     setCantidad]     = useState(1);
  const [agregado,     setAgregado]     = useState(false);

  const precio     = Number(producto.precio_final ?? producto.precio ?? producto.precio_original ?? 0);
  const disponible = producto.disponible !== false;
  const idAlimento = producto.alimento_id ?? producto.id;

  /* ── Cerrar con Escape ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Cargar ingredientes frescos desde el backend ── */
  useEffect(() => {
    if (!idAlimento) return;
    let activo = true;

    setCargando(true);
    setError(false);

    TraerAlimentoPublico(idAlimento)
      .then((res) => {
        if (!activo) return;
        const data = res.data ?? {};
        setIngredientes(Array.isArray(data.ingredientes) ? data.ingredientes : []);
      })
      .catch(() => {
        if (activo) setError(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, [idAlimento]);

  /* ── Agregar a bolsa ── */
  const handleAgregar = () => {
    if (!disponible || cantidad < 1) return;

    const item = {
      alimento_id:    idAlimento,
      nombre:         producto.nombre,
      imagen:         producto.imagen ?? null,
      precio_unitario: precio,
      precio_final:   precio * cantidad,
      cantidad,
    };

    /* Persistir en localStorage */
    try {
      const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      const bolsa    = Array.isArray(guardada) ? guardada : [];

      /* Si ya existe el mismo alimento, sumar cantidad */
      const idx = bolsa.findIndex((i) => i.alimento_id === idAlimento);
      if (idx >= 0) {
        bolsa[idx].cantidad     += cantidad;
        bolsa[idx].precio_final  = bolsa[idx].precio_unitario * bolsa[idx].cantidad;
      } else {
        bolsa.push(item);
      }
      localStorage.setItem("bolsa", JSON.stringify(bolsa));
    } catch {
      /* si falla localStorage igual notificamos */
    }

    onAgregar?.(item);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <div
      className="p3-product-modal__overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="p3-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="p3-product-modal-title"
      >
        {/* Botón cerrar */}
        <button
          type="button"
          className="p3-product-modal__close"
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
        >
          ×
        </button>

        {/* ── Columna imagen ── */}
        <div className="p3-product-modal__visual">
          {producto.imagen
            ? <img src={producto.imagen} alt={producto.nombre} />
            : <span className="p3-product-modal__no-img" aria-hidden="true">🍽️</span>
          }

          {/* Badge disponibilidad */}
          <span
            className={`p3-product-modal__availability-badge${disponible ? "" : " p3-product-modal__availability-badge--off"}`}
          >
            {disponible ? "● Disponible" : "● No disponible"}
          </span>
        </div>

        {/* ── Columna contenido ── */}
        <div className="p3-product-modal__content">
          <span className="p3-product-modal__eyebrow">Detalle del producto</span>
          <h2 id="p3-product-modal-title">{producto.nombre}</h2>

          {/* Precio */}
          <p className="p3-product-modal__price">{formatearPrecio(precio)}</p>

          {/* Descripción */}
          {producto.descripcion && (
            <p className="p3-product-modal__description">{producto.descripcion}</p>
          )}

          {/* Tiempo de preparación */}
          {producto.tiempo_preparacion && (
            <span className="p3-product-modal__time">
              ⏱ {producto.tiempo_preparacion} min de preparación
            </span>
          )}

          {/* ── Ingredientes ── */}
          <div className="p3-product-modal__ingredients">
            <h3 className="p3-product-modal__ingredients-title">Ingredientes</h3>

            {cargando && (
              <p className="p3-product-modal__ing-status">Cargando ingredientes…</p>
            )}
            {!cargando && error && (
              <p className="p3-product-modal__ing-status p3-product-modal__ing-status--error">
                No se pudieron cargar los ingredientes.
              </p>
            )}
            {!cargando && !error && ingredientes.length === 0 && (
              <p className="p3-product-modal__ing-status">
                Este producto no tiene ingredientes registrados.
              </p>
            )}
            {!cargando && !error && ingredientes.length > 0 && (
              <ul className="p3-product-modal__ing-list">
                {ingredientes.map((ing) => (
                  <li key={ing.id} className="p3-product-modal__ing-item">
                    <span className="p3-product-modal__ing-dot" aria-hidden="true" />
                    <span className="p3-product-modal__ing-name">{ing.nombre}</span>
                    {(ing.cantidad || ing.unidad) && (
                      <span className="p3-product-modal__ing-qty">
                        {ing.cantidad ? `${ing.cantidad}` : ""}
                        {ing.unidad ? ` ${ing.unidad}` : ""}
                      </span>
                    )}
                    {ing.descripcion && (
                      <span className="p3-product-modal__ing-note">{ing.descripcion}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Selector de cantidad + botón agregar ── */}
          {disponible && (
            <div className="p3-product-modal__add-row">
              {/* Cantidad */}
              <div className="p3-product-modal__qty" role="group" aria-label="Cantidad">
                <button
                  type="button"
                  className="p3-product-modal__qty-btn"
                  aria-label="Reducir cantidad"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  disabled={cantidad <= 1}
                >
                  −
                </button>
                <span className="p3-product-modal__qty-val" aria-live="polite">
                  {cantidad}
                </span>
                <button
                  type="button"
                  className="p3-product-modal__qty-btn"
                  aria-label="Aumentar cantidad"
                  onClick={() => setCantidad((c) => c + 1)}
                >
                  +
                </button>
              </div>

              {/* Precio total */}
              <span className="p3-product-modal__total">
                {formatearPrecio(precio * cantidad)}
              </span>

              {/* Botón agregar */}
              <button
                type="button"
                className={`p3-product-modal__add-btn${agregado ? " p3-product-modal__add-btn--done" : ""}`}
                onClick={handleAgregar}
                disabled={agregado}
                aria-live="polite"
              >
                {agregado ? "✓ Agregado" : "Agregar a la bolsa"}
              </button>
            </div>
          )}

          {!disponible && (
            <p className="p3-product-modal__unavailable-msg">
              Este producto no está disponible en este momento.
            </p>
          )}

          <button
            type="button"
            className="p3-product-modal__back"
            onClick={onClose}
          >
            ← Seguir viendo el menú
          </button>
        </div>
      </section>
    </div>
  );
}
