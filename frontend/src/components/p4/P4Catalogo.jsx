import { useState } from "react";
import P4ProductModal from "./P4ProductModal";

export default function P4Catalogo({
  colecciones,
  cantMinima,
  fmtPrecio,
  promocion,
  productosPromoGeneral,
  productosPromoUnitaria,
  estadoalpormayor,
}) {
  const [modalProducto, setModalProducto] = useState(null); // { producto, descuento }

  // ── Helpers de descuento ──────────────────────────
  const promoGeneralActiva = promocion?.estado === true;

  /** Devuelve el descuento % que aplica al producto (0 si no tiene) */
  const descuentoDeProducto = (producto) => {
    const idStr = String(producto.id);

    // 1. Promo general activa y el producto está en ella
    if (
      promoGeneralActiva &&
      productosPromoGeneral.some((p) => String(p.id) === idStr)
    ) {
      // Puede tener descuento propio o heredar el de la promo general
      const enPromo = productosPromoGeneral.find((p) => String(p.id) === idStr);
      return Number(enPromo?.descuento ?? promocion?.descuento ?? 0);
    }

    // 2. Promo unitaria (siempre aplica si el producto está)
    const enUnitaria = productosPromoUnitaria.find(
      (p) => String(p.id) === idStr,
    );
    if (enUnitaria) {
      return Number(enUnitaria.descuento ?? 0);
    }

    return 0;
  };

  /** Precio final del producto aplicando descuento */
  const precioConDescuento = (precio, descuento) =>
    descuento > 0 ? precio * (1 - descuento / 100) : precio;

  return (
    <>
      <main className="p4-catalog" id="p4-catalogo">
        {colecciones.length > 0 ? (
          colecciones.map((coleccion) => {
            const nombre =
              coleccion.coleccion_nombre ?? coleccion.nombre ?? "Colección";
            const productos = coleccion.productos ?? [];

            return (
              <div
                key={coleccion.id ?? nombre}
                className="p4-collection"
                id={`p4-col-${coleccion.id ?? nombre}`}
              >
                <div className="p4-collection__header">
                  <h2 className="p4-collection__title">{nombre}</h2>
                  <span className="p4-collection__count">
                    {productos.length}{" "}
                    {productos.length === 1 ? "diseño" : "diseños"}
                  </span>
                </div>

                {productos.length > 0 ? (
                  <div className="p4-products-grid">
                    {productos.map((producto) => {
                      const descuento = descuentoDeProducto(producto);
                      const tienePromo = descuento > 0;
                      const precioOriginal = Number(producto.precio ?? 0);
                      const precioFinal = precioConDescuento(
                        precioOriginal,
                        descuento,
                      );
                      const precioMayorista =
                        producto.precio_alpormayor != null
                          ? precioConDescuento(
                              Number(producto.precio_alpormayor),
                              descuento,
                            )
                          : null;
                      const ganancia =
                        precioMayorista != null
                          ? precioFinal - precioMayorista
                          : null;
                      const fmtcu = (v) => `${fmtPrecio(v)} c/u`;
                      const referencia =
                        producto.referencia ??
                        producto.codigo ??
                        `REF-${producto.id}`;

                      return (
                        <article key={producto.id} className="p4-product-card">
                          {/* ── Imagen ── */}
                          <div className="p4-product-card__img-wrap">
                            {producto.imagen ? (
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="p4-product-card__img"
                              />
                            ) : (
                              <div className="p4-product-card__img-placeholder">
                                <div className="p4-img-ph__inner" />
                              </div>
                            )}

                            {/* Badge de descuento sobre la imagen */}
                            {tienePromo && (
                              <span className="p4-product-card__promo-badge">
                                -{descuento}%
                              </span>
                            )}

                            {/* Badge de talla */}
                            {(producto.talla ?? producto.talla_unica) && (
                              <div className="p4-product-card__talla-badge">
                                <div
                                  className="p4-talla-badge__icon"
                                  aria-hidden="true"
                                >
                                  <div className="p4-icon-ruler-badge" />
                                </div>
                                <div className="p4-talla-badge__text">
                                  <strong>
                                    {producto.talla ??
                                      producto.talla_unica ??
                                      "Talla Única"}
                                  </strong>
                                  {producto.talla_nota && (
                                    <span>{producto.talla_nota}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* ── Cuerpo ── */}
                          <div className="p4-product-card__body">
                            <span className="p4-product-card__ref">
                              {referencia.toUpperCase()}
                            </span>
                            <h3 className="p4-product-card__name">
                              {producto.nombre}
                            </h3>

                            <button
                              type="button"
                              className="p4-product-card__medidas-btn"
                              onClick={() =>
                                setModalProducto({ producto, descuento })
                              }
                            >
                              <span
                                className="p4-medidas-btn__icon"
                                aria-hidden="true"
                              >
                                <span className="p4-icon-ruler-sm-btn" />
                              </span>
                              Ver producto
                              <span className="p4-medidas-btn__arrow">›</span>
                            </button>

                            <div className="p4-product-card__prices">
                              {/* Mayorista — solo si existe */}
                              {estadoalpormayor ? (
                                precioMayorista != null && (
                                  <div className="p4-price-row p4-price-row--pink">
                                    <div className="p4-price-row__label">
                                      <span
                                        className="p4-price-row__icon"
                                        aria-hidden="true"
                                      >
                                        <span className="p4-icon-heart-sm" />
                                      </span>
                                      <span>
                                        <strong>Precio mayorista</strong>
                                        {` · desde ${cantMinima} uds`}
                                      </span>
                                    </div>
                                    <strong className="p4-price-row__value">
                                      {fmtcu(precioMayorista)}
                                    </strong>
                                  </div>
                                )
                              ) : (
                                <></>
                              )}

                              {/* Precio unidad — con tachado si hay promo */}
                              <div className="p4-price-row p4-price-row--green">
                                <div className="p4-price-row__label">
                                  <span
                                    className="p4-price-row__icon"
                                    aria-hidden="true"
                                  >
                                    <span className="p4-icon-check-sm" />
                                  </span>
                                  <span>
                                    <strong>Precio unidad</strong>
                                  </span>
                                </div>
                                <div className="p4-price-row__value-wrap">
                                  {tienePromo && (
                                    <span className="p4-price-row__original">
                                      {fmtcu(precioOriginal)}
                                    </span>
                                  )}
                                  <strong className="p4-price-row__value">
                                    {fmtcu(precioFinal)}
                                  </strong>
                                </div>
                              </div>

                              {/* Ganancia — solo si hay mayorista */}
                              {estadoalpormayor ? (
                                ganancia != null && (
                                  <div className="p4-price-row p4-price-row--yellow">
                                    <div className="p4-price-row__label">
                                      <span
                                        className="p4-price-row__icon"
                                        aria-hidden="true"
                                      >
                                        <span className="p4-icon-star-sm" />
                                      </span>
                                      <span>
                                        <strong>Ganancia potencial</strong>
                                      </span>
                                    </div>
                                    <strong className="p4-price-row__value">
                                      {fmtcu(ganancia > 0 ? ganancia : 0)}
                                    </strong>
                                  </div>
                                )
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="p4-collection__empty">
                    Esta colección no tiene productos aún.
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="p4-catalog__empty">
            <p>El catálogo estará disponible muy pronto.</p>
          </div>
        )}
      </main>

      {/* ── Modal detalle producto ── */}
      {modalProducto && (
        <P4ProductModal
          producto={modalProducto.producto}
          descuento={modalProducto.descuento}
          cantMinima={cantMinima}
          fmtPrecio={fmtPrecio}
          onClose={() => setModalProducto(null)}
          estadoalpormayor={estadoalpormayor}
        />
      )}
    </>
  );
}
