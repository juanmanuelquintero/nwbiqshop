import { useEffect, useState } from "react";
import { mostrarAlerta } from "../../utils/alerts";
import { MirarVariantes } from "../../api/axios";

/*
  P4ProductModal — detalle + agregar a bolsa (mayorista)

  Lógica de precio:
  - Precio base = precioFinal (ya con descuento si aplica)
  - Si la bolsa total de unidades >= cantMinima Y existe precio_alpormayor
    → se usa precioMayorista como precio_unitario
  - La talla es OBLIGATORIA para productos de tipo variantes

  Estructura de item en bolsa:
  {
    producto_id, variante_id (id del color), talla_id (id de la talla),
    tipo, nombre, imagen, color, talla, referencia, marca,
    cantidad, precio_unitario, precio_final,
    precio_original, precio_alpormayor, descuento
  }
*/
export default function P4ProductModal({
  producto,
  descuento = 0,
  cantMinima = 6,
  fmtPrecio,
  onClose,
  estadoalpormayor,
}) {
  // ── Estado de variantes ────────────────────────────
  const [variantes, setVariantes] = useState([]);
  const [colorActivo, setColorActivo] = useState(null);
  const [tallaActiva, setTallaActiva] = useState(null);
  const [cantidadtalla, setcantidadtalla] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  // ── Estado de bolsa y UI ───────────────────────────
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [errTalla, setErrTalla] = useState(false); // validación: talla no elegida

  const tieneVariantes = producto.tipo === "variantes";

  // ── Precios base ───────────────────────────────────
  const precioOriginal = Number(producto.precio ?? 0);
  const precioFinal =
    descuento > 0 ? precioOriginal * (1 - descuento / 100) : precioOriginal;
  const precioMayoristaBase =
    producto.precio_alpormayor != null
      ? descuento > 0
        ? Number(producto.precio_alpormayor) * (1 - descuento / 100)
        : Number(producto.precio_alpormayor)
      : null;

  // ── Calcular total de unidades en bolsa ───────────

  // Si sumando lo que ya hay en bolsa + cantidad actual >= cantMinima → mayorista
  const aplicaMayorista =
    estadoalpormayor === true &&
    precioMayoristaBase != null &&
    cantidad >= cantMinima;

  const precioUnitario = aplicaMayorista ? precioMayoristaBase : precioFinal;

  const ganancia =
    estadoalpormayor === true && precioMayoristaBase != null
      ? precioFinal - precioMayoristaBase
      : null;

  // ── Imagen activa ──────────────────────────────────
  const imagenActiva = colorActivo?.imagen ?? producto.imagen ?? null;

  // ── Cargar variantes ───────────────────────────────
  useEffect(() => {
    if (!tieneVariantes) return;
    let activo = true;
    setCargando(true);
    setError(false);

    MirarVariantes(producto.id)
      .then((res) => {
        if (!activo) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setVariantes(data);
        setColorActivo(data[0] ?? null);
        setTallaActiva(null);
      })
      .catch(() => {
        if (activo) setError(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [producto.id, tieneVariantes]);

  // Limpiar talla cuando cambia el color
  useEffect(() => {
    setTallaActiva(null);
    setErrTalla(false);
  }, [colorActivo]);

  // ── Cerrar con Escape ──────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Agregar a bolsa ────────────────────────────────
  const handleAgregar = () => {
    // Validación: talla obligatoria en variantes
    if (tieneVariantes && !tallaActiva) {
      setErrTalla(true);
      return;
    }

    const item = {
      producto_id: producto.id,
      variante_id: colorActivo?.id ?? null,
      talla_id: tallaActiva?.id ?? null,
      tipo: producto.tipo,
      nombre: producto.nombre,
      imagen: imagenActiva,
      color: colorActivo?.color ?? null,
      talla: tallaActiva?.talla ?? null,
      referencia: colorActivo?.referencia ?? producto.referencia ?? null,
      marca: colorActivo?.marca ?? null,
      cantidad,
      precio_unitario: precioUnitario,
      precio_final: precioUnitario * cantidad,
      precio_original: precioOriginal,
      precio_alpormayor: precioMayoristaBase,
      descuento,
    };

    try {
      const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");

      const bolsa = Array.isArray(guardada) ? guardada : [];

      const idx = bolsa.findIndex(
        (i) =>
          i.producto_id === item.producto_id &&
          i.variante_id === item.variante_id &&
          i.talla_id === item.talla_id,
      );

      if (idx >= 0) {
        bolsa[idx].cantidad += cantidad;
      } else {
        bolsa.push(item);
      }

      // SOLO ejecutar lógica mayorista si está habilitado
      if (estadoalpormayor === true) {
        const cantidadTotalProducto = bolsa
          .filter((i) => i.producto_id === item.producto_id)
          .reduce((total, i) => total + Number(i.cantidad ?? 1), 0);

        const aplicaMayoristaProducto =
          precioMayoristaBase != null && cantidadTotalProducto >= cantMinima;

        bolsa.forEach((i) => {
          if (i.producto_id === item.producto_id) {
            if (aplicaMayoristaProducto) {
              i.precio_unitario = i.precio_alpormayor;
            } else {
              i.precio_unitario =
                i.descuento > 0
                  ? i.precio_original * (1 - i.descuento / 100)
                  : i.precio_original;
            }

            i.precio_final = i.precio_unitario * i.cantidad;
          }
        });
      }

      localStorage.setItem("bolsa", JSON.stringify(bolsa));
      onClose();
      mostrarAlerta("success", "Producto agregado");
    } catch {
      /* si falla localStorage, continúa */
    }

    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const referencia =
    producto.referencia ?? producto.codigo ?? `REF-${producto.id}`;

  return (
    <div
      className="p4-modal-overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="p4-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="p4-modal-titulo"
      >
        {/* ── Cerrar ── */}
        <button
          type="button"
          className="p4-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* ══ COLUMNA IMAGEN ══ */}
        <div className="p4-modal__visual">
          <div className="p4-modal__img-wrap">
            {imagenActiva ? (
              <img
                src={imagenActiva}
                alt={producto.nombre}
                className="p4-modal__img"
              />
            ) : (
              <div className="p4-modal__img-ph">
                <div className="p4-img-ph__inner" />
              </div>
            )}
            {descuento > 0 && (
              <span className="p4-modal__discount-badge">-{descuento}%</span>
            )}
          </div>

          {/* Miniaturas */}
          {variantes.length > 1 && (
            <div className="p4-modal__color-thumbs">
              {variantes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`p4-modal__thumb ${colorActivo?.id === v.id ? "p4-modal__thumb--active" : ""}`}
                  onClick={() => setColorActivo(v)}
                  aria-label={`Color ${v.color ?? "sin nombre"}`}
                >
                  {v.imagen ? (
                    <img src={v.imagen} alt={v.color ?? ""} />
                  ) : (
                    <div className="p4-modal__thumb-ph">
                      <span>{(v.color ?? "?").charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ COLUMNA CONTENIDO ══ */}
        <div className="p4-modal__content">
          <span className="p4-modal__ref">{referencia.toUpperCase()}</span>
          <h2 className="p4-modal__title" id="p4-modal-titulo">
            {producto.nombre}
          </h2>
          {producto.descripcion && (
            <p className="p4-modal__desc">{producto.descripcion}</p>
          )}

          {/* ── Precios ── */}
          <div className="p4-modal__prices">
            {/* Precio unidad */}
            <div className="p4-modal__price-block">
              <div>
                <span className="p4-modal__price-label">
                  Precio unidad
                  {aplicaMayorista && (
                    <span className="p4-modal__mayorista-tag">
                      {" "}
                      · precio mayorista aplicado ✓
                    </span>
                  )}
                </span>
                {descuento > 0 && (
                  <span className="p4-modal__price-original">
                    {fmtPrecio(precioOriginal)}
                  </span>
                )}
                <strong className="p4-modal__price-final">
                  {fmtPrecio(precioUnitario)}
                </strong>
              </div>
            </div>

            {/* Precio mayorista info */}
            {estadoalpormayor ? (
              precioMayoristaBase != null && (
                <div className="p4-modal__price-block p4-modal__price-block--pink">
                  <div className="p4-modal__price-icon" aria-hidden="true">
                    <span className="p4-icon-heart-sm" />
                  </div>
                  <div>
                    <span className="p4-modal__price-label">
                      Precio mayorista · desde {cantMinima} uds
                      {!aplicaMayorista && (
                        <span className="p4-modal__mayorista-faltan">
                          {" "}
                          (faltan {cantMinima - cantidad} uds para activar)
                        </span>
                      )}
                    </span>
                    {descuento > 0 && (
                      <span className="p4-modal__price-original">
                        {fmtPrecio(Number(producto.precio_alpormayor))}
                      </span>
                    )}
                    <strong className="p4-modal__price-final p4-modal__price-final--pink">
                      {fmtPrecio(precioMayoristaBase)} c/u
                    </strong>
                  </div>
                </div>
              )
            ) : (
              <></>
            )}

            {/* Ganancia */}
            {estadoalpormayor ? (
              ganancia != null && (
                <div className="p4-modal__price-block p4-modal__price-block--yellow">
                  <div className="p4-modal__price-icon" aria-hidden="true">
                    <span className="p4-icon-star-sm" />
                  </div>
                  <div>
                    <span className="p4-modal__price-label">
                      Ganancia potencial
                    </span>
                    <strong className="p4-modal__price-final">
                      {fmtPrecio(ganancia > 0 ? ganancia : 0)} c/u
                    </strong>
                  </div>
                </div>
              )
            ) : (
              <></>
            )}
          </div>

          {/* ── Variantes ── */}
          {tieneVariantes && (
            <div className="p4-modal__variantes">
              {cargando && (
                <div className="p4-modal__variantes-loading">
                  <div className="p4-antojate__spinner" aria-hidden="true" />
                  <span>Cargando colores y tallas…</span>
                </div>
              )}
              {!cargando && error && (
                <p className="p4-modal__variantes-error">
                  No se pudieron cargar las opciones.
                </p>
              )}

              {!cargando && !error && variantes.length > 0 && (
                <>
                  {/* Selector de color */}
                  <div className="p4-modal__section">
                    <p className="p4-modal__section-label">
                      Color{colorActivo?.color ? `: ${colorActivo.color}` : ""}
                    </p>
                    <div className="p4-modal__colors">
                      {variantes.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={`p4-modal__color-btn ${colorActivo?.id === v.id ? "p4-modal__color-btn--active" : ""}`}
                          onClick={() => setColorActivo(v)}
                        >
                          {v.color ?? "Sin color"}
                          {v.referencia && (
                            <span className="p4-modal__color-ref">
                              {" "}
                              · {v.referencia}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector de talla */}
                  {colorActivo?.tallas?.length > 0 && (
                    <div className="p4-modal__section">
                      <p className="p4-modal__section-label">
                        Talla
                        {tallaActiva ? `: ${tallaActiva.talla ?? "Única"}` : ""}
                        {errTalla && (
                          <span className="p4-modal__err-talla">
                            {" "}
                            — elige una talla
                          </span>
                        )}
                      </p>
                      <div className="p4-modal__tallas">
                        {colorActivo.tallas.map((t) => {
                          const agotada = t.cantidad === 0;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={agotada}
                              className={`p4-modal__talla-chip-btn
                                ${tallaActiva?.id === t.id ? "p4-modal__talla-chip-btn--active" : ""}
                                ${agotada ? "p4-modal__talla-chip-btn--agotada" : ""}`}
                              onClick={() => {
                                setTallaActiva(t);
                                setErrTalla(false);
                                setcantidadtalla(t.cantidad);
                              }}
                            >
                              <span className="p4-modal__talla-nombre">
                                {t.talla ?? "Única"}
                              </span>
                              <span
                                className={`p4-modal__talla-stock
                                ${
                                  t.cantidad === 0
                                    ? "p4-modal__talla-stock--red"
                                    : t.cantidad <= 5
                                      ? "p4-modal__talla-stock--yellow"
                                      : "p4-modal__talla-stock--green"
                                }`}
                              >
                                {t.cantidad === 0
                                  ? "Agotado"
                                  : `${t.cantidad} uds`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info del color activo */}
                  {(colorActivo?.marca || colorActivo?.referencia) && (
                    <div className="p4-modal__section">
                      <p className="p4-modal__section-label">Detalles</p>
                      <div className="p4-modal__color-info">
                        {colorActivo.marca && (
                          <span>
                            <strong>Marca:</strong> {colorActivo.marca}
                          </span>
                        )}
                        {colorActivo.referencia && (
                          <span>
                            <strong>Referencia:</strong>{" "}
                            {colorActivo.referencia}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Nota pedido mínimo ── */}
          {estadoalpormayor ? (
            precioMayoristaBase != null && (
              <div className="p4-modal__min-note">
                <div className="p4-modal__min-note-icon" aria-hidden="true">
                  <span className="p4-icon-heart-sm" />
                </div>
                <p>
                  Pedido mínimo al por mayor:{" "}
                  <strong>{cantMinima} unidades combinadas</strong> entre
                  colores y tallas.
                  {aplicaMayorista
                    ? " Ya aplica el precio mayorista."
                    : ` Agrega ${cantMinima - cantidad} uds más para activarlo.`}
                </p>
              </div>
            )
          ) : (
            <></>
          )}

          {/* ── Cantidad + Agregar ── */}
          <div className="p4-modal__add-section">
            {/* Selector cantidad */}
            <div className="p4-modal__qty" role="group" aria-label="Cantidad">
              <button
                type="button"
                className="p4-modal__qty-btn"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                disabled={cantidad <= 1}
                aria-label="Reduc6"
              >
                −
              </button>
              <span className="p4-modal__qty-val" aria-live="polite">
                {cantidad}
              </span>
              <button
                type="button"
                className="p4-modal__qty-btn"
                onClick={() => setCantidad((c) => c + 1)}
                disabled={cantidad >= cantidadtalla}
                aria-label="Aumentar"
              >
                +
              </button>
            </div>

            {/* Total */}
            <div className="p4-modal__total">
              <span className="p4-modal__total-label">Total</span>
              <strong className="p4-modal__total-val">
                {fmtPrecio(precioUnitario * cantidad)}
              </strong>
              {aplicaMayorista && (
                <span className="p4-modal__total-tag">precio mayorista</span>
              )}
            </div>

            {/* Botón agregar */}
            <button
              type="button"
              className={`p4-modal__add-btn ${agregado ? "p4-modal__add-btn--done" : ""}`}
              onClick={handleAgregar}
              disabled={agregado}
              aria-live="polite"
            >
              {agregado ? "✓ Agregado a la bolsa" : "Agregar a la bolsa"}
            </button>
          </div>

          {/* ── Volver ── */}
          <button
            type="button"
            className="p4-modal__back-btn"
            onClick={onClose}
          >
            ← Seguir explorando el catálogo
          </button>
        </div>
      </section>
    </div>
  );
}
