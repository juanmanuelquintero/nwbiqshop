import { useEffect, useRef, useState } from "react";
import { TraerProductosDominio } from "../../api/axios";
import ProductModalP2 from "./ProductModalP2";

export default function DailyPicksSectionP2({
  dominio,
  estadoAlPorMayor = false,
  cantidadMinimaMayorista = 6,
}) {
  const triggerRef = useRef(null);
  const [cargando, setCargando] = useState(false);
  const [productosCargados, setProductosCargados] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    if (!dominio || productosCargados || !triggerRef.current) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;

        observer.disconnect();
        setCargando(true);

        TraerProductosDominio(dominio)
          .then((res) => {
            console.log(res.data);
            setProductos(res.data ?? []);
          })
          .catch((error) => {
            console.error(
              "No fue posible cargar los productos de la tienda",
              error,
            );
          })
          .finally(() => {
            setCargando(false);
            setProductosCargados(true);
          });
      },
      { rootMargin: "450px 0px" },
    );

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [dominio, productosCargados]);

  return (
    <section className="p2-catalog-preview" id="productos">
      <div className="p2-catalog-preview__heading">
        <p className="p2-catalog-preview__eyebrow">Todo lo que buscas, aquí</p>
        <h2 className="p2-catalog-preview__title">
          Mira todos nuestros productos
        </h2>
        <p className="p2-catalog-preview__description">
          No te quedes con las ganas: encuentra eso que te encanta y llévatelo
          contigo.
        </p>
      </div>

      <div
        ref={triggerRef}
        className="p2-catalog-preview__trigger"
        aria-live="polite"
      >
        {cargando && (
          <span className="p2-catalog-preview__loading">
            Cargando productos<span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        )}
      </div>

      {productos.length > 0 && (
        <div className="p2-catalog-preview__grid">
          {productos.map((producto) => (
            <article key={producto.id} className="p2-catalog-product">
              <div className="p2-catalog-product__image-wrap">
                {producto.imagen ? (
                  <img
                    className="p2-catalog-product__image"
                    src={producto.imagen}
                    alt={producto.nombre}
                  />
                ) : (
                  <span
                    className="p2-catalog-product__image-placeholder"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                )}
                {producto.tipo && (
                  <span className="p2-catalog-product__type">
                    {producto.tipo === "variantes"
                      ? "Varias opciones"
                      : "Disponible"}
                  </span>
                )}
              </div>
              <div className="p2-catalog-product__content">
                <h3 className="p2-catalog-product__name">{producto.nombre}</h3>
                {producto.descripcion && (
                  <p className="p2-catalog-product__description">
                    {producto.descripcion}
                  </p>
                )}
                <strong className="p2-catalog-product__price">
                  ${Number(producto.precio ?? 0).toLocaleString("es-CO")}
                </strong>
                {estadoAlPorMayor && producto.precio_alpormayor != null && (
                  <div className="p2-wholesale-info">
                    <div className="p2-wholesale-info__header">
                      <span className="p2-wholesale-info__title">
                        Precio mayorista
                      </span>

                      <span className="p2-wholesale-info__badge">
                        Desde {cantidadMinimaMayorista} uds
                      </span>
                    </div>

                    <div className="p2-wholesale-info__price">
                      {Number(producto.precio_alpormayor).toLocaleString(
                        "es-CO",
                      )}
                    </div>

                    <div className="p2-wholesale-info__profit">
                      <span>Ganancia potencial</span>

                      <strong>
                        {Math.max(
                          0,
                          Number(producto.precio ?? 0) -
                            Number(producto.precio_alpormayor),
                        ).toLocaleString("es-CO")}
                      </strong>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className="p2-catalog-product__detail"
                  onClick={() => setProductoSeleccionado(producto)}
                >
                  Ver detalle <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {productoSeleccionado && (
        <ProductModalP2
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          estadoAlPorMayor={estadoAlPorMayor}
          cantidadMinimaMayorista={cantidadMinimaMayorista}
        />
      )}
    </section>
  );
}
