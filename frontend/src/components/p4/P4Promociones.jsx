import { useState } from "react";
import P4ProductModal from "./P4ProductModal";

export default function P4Promociones({
  promocion,
  productosPromoGeneral,
  productosPromoUnitaria,
  cantMinima,
  fmtPrecio,
  calcPrecioPromo,
  estadoalpormayor,
}) {
  const [modalProducto, setModalProducto] = useState(null);
  // modalProducto: { producto, descuento }
  // producto aquí tiene precio = precio_original y precio_alpormayor ya tal cual vienen del backend
  // el descuento se calcula aquí y se pasa al modal para que aplique los mismos cálculos

  const abrirModal = (producto, descuento) => {
    // Normalizamos el objeto para que el modal encuentre precio y precio_alpormayor
    // tal como lo esperan los cálculos internos del modal (precio = precio base sin descuento)
    const productoParaModal = {
      ...producto,
      precio: Number(producto.precio_original ?? producto.precio ?? 0),
    };
    setModalProducto({ producto: productoParaModal, descuento });
  };

  return (
    <>
      {/* ── PROMOCIÓN GENERAL (protagonista) ── */}
      {promocion?.estado && productosPromoGeneral.length > 0 && (
        <section className="p4-promos" aria-labelledby="p4-promos-titulo">
          <span
            className="p4-promos__fire p4-promos__fire--1"
            aria-hidden="true"
          >
            🔥
          </span>
          <span
            className="p4-promos__fire p4-promos__fire--2"
            aria-hidden="true"
          >
            🔥
          </span>
          <span
            className="p4-promos__fire p4-promos__fire--3"
            aria-hidden="true"
          >
            🔥
          </span>

          <div className="p4-promos__inner">
            <div className="p4-promos__header">
              <span className="p4-promos__badge-label">
                ✦ Selección especial ✦
              </span>
              <h2 className="p4-promos__title" id="p4-promos-titulo">
                {promocion.nombre || "Promociones"}
              </h2>
              {promocion.descripcion && (
                <p className="p4-promos__desc">{promocion.descripcion}</p>
              )}
              {Number(promocion.descuento) > 0 && (
                <div className="p4-promos__descuento-pill">
                  <span>Hasta</span>
                  <strong>{promocion.descuento}% OFF</strong>
                  <span>en productos seleccionados</span>
                </div>
              )}
            </div>

            <div className="p4-promos__grid">
              {productosPromoGeneral.map((producto) => {
                const original = Number(
                  producto.precio_original ?? producto.precio ?? 0,
                );
                const descuento = Number(
                  producto.descuento ?? promocion.descuento ?? 0,
                );
                const final = calcPrecioPromo(producto, descuento);
                // precio mayorista también con descuento aplicado
                const mayoristaBruto =
                  producto.precio_alpormayor != null
                    ? Number(producto.precio_alpormayor)
                    : null;
                const mayorista =
                  mayoristaBruto != null
                    ? descuento > 0
                      ? mayoristaBruto * (1 - descuento / 100)
                      : mayoristaBruto
                    : null;
                const ganancia = mayorista != null ? final - mayorista : null;

                return (
                  <article key={producto.id} className="p4-promo-card">
                    <div className="p4-promo-card__img-wrap">
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="p4-promo-card__img"
                        />
                      ) : (
                        <div className="p4-promo-card__img-ph">
                          <div className="p4-img-ph__inner" />
                        </div>
                      )}
                      {descuento > 0 && (
                        <span className="p4-promo-card__badge">
                          -{descuento}%
                        </span>
                      )}
                    </div>

                    <div className="p4-promo-card__body">
                      <span className="p4-promo-card__ref">
                        {(
                          producto.referencia ??
                          producto.codigo ??
                          `REF-${producto.id}`
                        ).toUpperCase()}
                      </span>
                      <h3 className="p4-promo-card__name">{producto.nombre}</h3>

                      <div className="p4-promo-card__prices">
                        {descuento > 0 && (
                          <span className="p4-promo-card__original">
                            {fmtPrecio(original)}
                          </span>
                        )}
                        <strong className="p4-promo-card__price">
                          {fmtPrecio(final)}
                        </strong>
                      </div>

                      {/* Botón Ver producto → abre modal */}
                      <button
                        type="button"
                        className="p4-product-card__medidas-btn"
                        onClick={() => abrirModal(producto, descuento)}
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

                      {/* Precio unidad */}
                      <div className="p4-promo-card__p4-price-row--green">
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
                        <strong className="p4-price-row__value">
                          {fmtPrecio(final)} c/u
                        </strong>
                      </div>

                      {estadoalpormayor ? (
                        mayorista != null && (
                          <div className="p4-promo-card__price-row p4-promo-card__price-row--pink">
                            <span
                              className="p4-promo-card__price-row-icon"
                              aria-hidden="true"
                            >
                              <span className="p4-icon-heart-sm" />
                            </span>
                            <span>
                              <strong>Precio mayorista</strong>
                              {` · desde ${cantMinima} uds`}
                            </span>
                            <strong className="p4-promo-card__price-row-val">
                              {fmtPrecio(mayorista)} c/u
                            </strong>
                          </div>
                        )
                      ) : (
                        <></>
                      )}

                      {/* Ganancia — solo si hay mayorista */}
                      {estadoalpormayor ? (
                        ganancia != null && (
                          <div className="p4-promo-card__price-row p4-promo-card__price-row--yellow">
                            <span
                              className="p4-promo-card__price-row-icon"
                              aria-hidden="true"
                            >
                              <span className="p4-icon-star-sm" />
                            </span>
                            <span>
                              <strong>Ganancia potencial</strong>
                            </span>
                            <strong className="p4-promo-card__price-row-val">
                              {fmtPrecio(ganancia > 0 ? ganancia : 0)} c/u
                            </strong>
                          </div>
                        )
                      ) : (
                        <></>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PROMOCIONES UNITARIAS (discreta) ── */}
      {productosPromoUnitaria.length > 0 && (
        <section
          className="p4-promos-unit"
          aria-labelledby="p4-promos-unit-titulo"
        >
          <div className="p4-promos-unit__header">
            <p className="p4-promos-unit__eyebrow">Ofertas puntuales</p>
            <h2 className="p4-promos-unit__title" id="p4-promos-unit-titulo">
              Precios especiales
            </h2>
          </div>

          <div className="p4-promos-unit__grid">
            {productosPromoUnitaria.map((producto) => {
              const original = Number(
                producto.precio_original ?? producto.precio ?? 0,
              );
              const descuento = Number(producto.descuento ?? 0);
              const final = calcPrecioPromo(producto);
              const mayoristaBruto =
                producto.precio_alpormayor != null
                  ? Number(producto.precio_alpormayor)
                  : null;
              const mayorista =
                mayoristaBruto != null
                  ? descuento > 0
                    ? mayoristaBruto * (1 - descuento / 100)
                    : mayoristaBruto
                  : null;

              return (
                <article key={producto.id} className="p4-unit-card">
                  <div className="p4-unit-card__img-wrap">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="p4-unit-card__img"
                      />
                    ) : (
                      <div className="p4-unit-card__img-ph">
                        <div className="p4-img-ph__inner" />
                      </div>
                    )}
                    {descuento > 0 && (
                      <span className="p4-unit-card__badge">-{descuento}%</span>
                    )}
                  </div>

                  <div className="p4-unit-card__body">
                    <h3 className="p4-unit-card__name">{producto.nombre}</h3>
                    <div className="p4-unit-card__prices">
                      {descuento > 0 && (
                        <span className="p4-unit-card__original">
                          {fmtPrecio(original)}
                        </span>
                      )}
                      <strong className="p4-unit-card__price">
                        {fmtPrecio(final)}
                      </strong>
                    </div>
                    {mayorista != null && (
                      <span className="p4-unit-card__mayorista">
                        Mayorista: {fmtPrecio(mayorista)} c/u
                      </span>
                    )}

                    {/* Botón Ver producto → abre modal */}
                    <button
                      type="button"
                      className="p4-product-card__medidas-btn"
                      style={{ marginTop: "8px" }}
                      onClick={() => abrirModal(producto, descuento)}
                    >
                      <span className="p4-medidas-btn__icon" aria-hidden="true">
                        <span className="p4-icon-ruler-sm-btn" />
                      </span>
                      Ver producto
                      <span className="p4-medidas-btn__arrow">›</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Modal ── */}
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
