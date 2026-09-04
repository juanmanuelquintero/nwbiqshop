import { useState, useEffect, useRef } from "react";
import { TraerProductosDominio } from "../../api/axios";
import P4ProductModal from "./P4ProductModal";

export default function P4Antojate({
  dominio,
  colecciones,
  cantMinima,
  fmtPrecio,
  estadoalpormayor,
}) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [modalProducto, setModalProducto] = useState(null);
  const ref = useRef(null);

  // IDs ya mostrados en las colecciones para no repetirlos
  const idsEnColecciones = new Set(
    colecciones.flatMap((col) => col.productos ?? []).map((p) => String(p.id)),
  );

  // Dispara la carga cuando la sección entra en el viewport
  useEffect(() => {
    if (!dominio || cargado) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setCargando(true);
          TraerProductosDominio(dominio)
            .then((res) => {
              const todos = Array.isArray(res.data) ? res.data : [];
              setProductos(
                todos.filter((p) => !idsEnColecciones.has(String(p.id))),
              );
            })
            .catch(() => setProductos([]))
            .finally(() => {
              setCargando(false);
              setCargado(true);
            });
        }
      },
      { rootMargin: "200px" }, // empieza a cargar 200px antes de llegar
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dominio]);

  // No renderizar nada si ya cargó y no hay productos extra
  if (cargado && productos.length === 0) return null;

  return (
    <>
      <section
        className="p4-antojate"
        ref={ref}
        aria-labelledby="p4-antojate-titulo"
      >
        <div className="p4-antojate__header">
          <p className="p4-antojate__eyebrow">Una última mirada</p>
          <h2 className="p4-antojate__title" id="p4-antojate-titulo">
            Antójate de algo más
          </h2>
          <p className="p4-antojate__desc">
            Descubre estas piezas que pueden ser justo lo que te faltaba.
          </p>
        </div>

        {cargando ? (
          <div className="p4-antojate__loading">
            <div className="p4-antojate__spinner" aria-hidden="true" />
            <span>Cargando más productos…</span>
          </div>
        ) : (
          <div className="p4-products-grid">
            {productos.map((producto) => {
              const precioMayorista = Number(
                producto.precio_alpormayor ?? producto.precio ?? 0,
              );
              const precioSugerido = Number(producto.precio ?? 0);
              const ganancia = precioSugerido - precioMayorista;
              const fmtcu = (v) => `${fmtPrecio(v)} c/u`;
              const referencia =
                producto.referencia ?? producto.codigo ?? `REF-${producto.id}`;

              return (
                <article key={producto.id} className="p4-product-card">
                  {/* Imagen */}
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
                  </div>

                  {/* Cuerpo */}
                  <div className="p4-product-card__body">
                    <span className="p4-product-card__ref">
                      {referencia.toUpperCase()}
                    </span>
                    <h3 className="p4-product-card__name">{producto.nombre}</h3>

                    <button
                      type="button"
                      className="p4-product-card__medidas-btn"
                      onClick={() =>
                        setModalProducto({ producto, descuento: 0 })
                      }
                    >
                      <span className="p4-medidas-btn__icon" aria-hidden="true">
                        <span className="p4-icon-ruler-sm-btn" />
                      </span>
                      Ver producto
                      <span className="p4-medidas-btn__arrow">›</span>
                    </button>

                    <div className="p4-product-card__prices">
                      {/* Mayorista — solo si existe */}
                      {estadoalpormayor ? (
                        producto.precio_alpormayor != null && (
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

                      {/* Precio unidad */}
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
                        <strong className="p4-price-row__value">
                          {fmtcu(precioSugerido)}
                        </strong>
                      </div>

                      {/* Ganancia — solo si hay mayorista */}
                      {estadoalpormayor ? (
                        producto.precio_alpormayor != null && (
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
        )}
      </section>

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
