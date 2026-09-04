import { useEffect, useState } from "react";
import { MirarVariantes } from "../../api/axios";
import { mostrarAlerta } from "../../utils/alerts";
import { consolidarBolsa } from "../../utils/bolsa";

const formatearPrecio = (precio) =>
  `$${Number(precio ?? 0).toLocaleString("es-CO")}`;

const obtenerPrecios = (producto) => {
  const precioOriginal = Number(
    producto.precio_original ?? producto.precio ?? 0,
  );
  const descuento = Number(producto.descuento ?? 0);
  const precioFinal = Number(
    producto.precio_final ??
      (descuento > 0 ? precioOriginal * (1 - descuento / 100) : precioOriginal),
  );

  return {
    precioOriginal,
    precioFinal,
    tieneDescuento: precioFinal < precioOriginal,
  };
};

export default function ProductModalP2({
  producto,
  onClose,
  estadoAlPorMayor = false,
  cantidadMinimaMayorista = 6,
}) {
  const [variantes, setVariantes] = useState([]);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cargandoVariantes, setCargandoVariantes] = useState(true);
  const [errorVariantes, setErrorVariantes] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    let activo = true;
    MirarVariantes(producto.id)
      .then((res) => {
        if (!activo) return;
        console.log(res.data);
        const opciones = Array.isArray(res.data) ? res.data : [];
        setVariantes(opciones);
        setVarianteSeleccionada(opciones[0] ?? null);
      })
      .catch((error) => {
        if (!activo) return;
        console.error(
          "No fue posible cargar las variantes del producto",
          error,
        );
        setErrorVariantes(true);
      })
      .finally(() => {
        if (activo) setCargandoVariantes(false);
      });
    const cerrarConEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      activo = false;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [producto.id, onClose]);

  const tieneVariantes = producto.tipo === "variantes" && variantes.length > 0;
  const imagen = varianteSeleccionada?.imagen ?? producto.imagen;
  const tallas = varianteSeleccionada?.tallas ?? [];
  const varianteSimple = variantes[0] ?? null;
  const { precioOriginal, precioFinal, tieneDescuento } =
    obtenerPrecios(producto);
  const precioMayorista =
    estadoAlPorMayor && producto.precio_alpormayor != null
      ? Number(producto.precio_alpormayor)
      : null;
  const cantidadDisponible = tieneVariantes
    ? (tallaSeleccionada?.cantidad ?? 0)
    : Number(varianteSimple?.cantidad ?? producto.cantidad ?? 0);
  const aplicaMayorista =
    estadoAlPorMayor &&
    precioMayorista != null &&
    cantidad >= cantidadMinimaMayorista;
  const precioUnitario = aplicaMayorista ? precioMayorista : precioFinal;
  const total = precioUnitario * cantidad;
  const puedeAgregar = tieneVariantes
    ? Boolean(tallaSeleccionada) && cantidad <= cantidadDisponible
    : Boolean(varianteSimple) && cantidad <= cantidadDisponible;

  const agregarABolsa = () => {
    if (!puedeAgregar) return;

    const bolsaActual = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
    const esVariante = tieneVariantes;
    const item = {
      producto_id: producto.id,
      variante_id: esVariante ? tallaSeleccionada.id : varianteSimple.id,
      color_id: esVariante ? varianteSeleccionada.id : null,
      talla_id: esVariante ? tallaSeleccionada.id : null,
      tipo: producto.tipo,
      cantidad,
      nombre: producto.nombre,
      imagen,
      color: esVariante ? varianteSeleccionada.color : null,
      talla: esVariante ? tallaSeleccionada.talla : null,
      marca: esVariante ? varianteSeleccionada.marca : varianteSimple.marca,
      referencia: esVariante
        ? varianteSeleccionada.referencia
        : varianteSimple.referencia,
      precio_unitario: precioUnitario,
      precio_final: total,
      precio_original: precioOriginal,
      precio_alpormayor: precioMayorista,
      descuento: Number(producto.descuento ?? 0),
    };

    const bolsaConsolidada = consolidarBolsa([...bolsaActual, item]);
    localStorage.setItem("bolsa", JSON.stringify(bolsaConsolidada));
    setAgregado(true);
    onClose();
    mostrarAlerta("success", "Producto agregado a tu bolsa");
  };

  return (
    <div
      className="p2-product-modal__overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="p2-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="p2-product-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="p2-product-modal__close"
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
        >
          ×
        </button>
        <div className="p2-product-modal__image-wrap">
          {imagen ? (
            <img
              className="p2-product-modal__image"
              src={imagen}
              alt={producto.nombre}
            />
          ) : (
            <span
              className="p2-product-modal__image-placeholder"
              aria-hidden="true"
            >
              ✦
            </span>
          )}
        </div>
        <div className="p2-product-modal__content">
          <p className="p2-product-modal__eyebrow">
            {producto.tipo === "variantes"
              ? "Producto con opciones"
              : "Producto disponible"}
          </p>
          <h2 id="p2-product-modal-title" className="p2-product-modal__name">
            {producto.nombre}
          </h2>
          {producto.descripcion && (
            <p className="p2-product-modal__description">
              {producto.descripcion}
            </p>
          )}
          <div className="p2-product-modal__prices">
            {tieneDescuento && (
              <span className="p2-product-modal__original-price">
                {formatearPrecio(precioOriginal)}
              </span>
            )}
            <strong className="p2-product-modal__price">
              {formatearPrecio(precioUnitario)}
            </strong>
            {aplicaMayorista && <span>Precio mayorista aplicado</span>}
            {tieneDescuento && (
              <span className="p2-product-modal__discount">
                -{Number(producto.descuento ?? 0)}% OFF
              </span>
            )}
          </div>
          {precioMayorista != null && (
            <div className="p2-product-modal__wholesale">
              <span>Mayorista desde {cantidadMinimaMayorista} uds</span>
              <strong>{formatearPrecio(precioMayorista)} c/u</strong>
              <span>
                Ganancia potencial:{" "}
                {formatearPrecio(Math.max(0, precioFinal - precioMayorista))}{" "}
                c/u
              </span>
            </div>
          )}
          {puedeAgregar && (
            <div className="p2-product-modal__quantity">
              <span className="p2-product-modal__quantity-label">Cantidad</span>

              <div className="p2-product-modal__quantity-controls">
                <button
                  type="button"
                  onClick={() =>
                    setCantidad((actual) => Math.max(1, actual - 1))
                  }
                  disabled={cantidad <= 1}
                  aria-label="Reducir cantidad"
                >
                  −
                </button>

                <strong aria-live="polite">{cantidad}</strong>

                <button
                  type="button"
                  onClick={() =>
                    setCantidad((actual) =>
                      Math.min(cantidadDisponible, actual + 1),
                    )
                  }
                  disabled={cantidad >= cantidadDisponible}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <div className="p2-product-modal__quantity-total">
                <span>Total</span>
                <strong>{formatearPrecio(total)}</strong>
              </div>
            </div>
          )}
          <div className="p2-product-modal__variants" aria-live="polite">
            {cargandoVariantes && (
              <div className="p2-product-modal__loading">
                <span /> Cargando opciones disponibles…
              </div>
            )}
            {!cargandoVariantes && errorVariantes && (
              <p className="p2-product-modal__error">
                No pudimos cargar las opciones. Inténtalo nuevamente.
              </p>
            )}
            {!cargandoVariantes && tieneVariantes && (
              <>
                <p className="p2-product-modal__variants-label">
                  Elige un color
                </p>
                <div className="p2-product-modal__colors">
                  {variantes.map((variante) => (
                    <button
                      key={variante.id}
                      type="button"
                      className={`p2-product-modal__color ${varianteSeleccionada?.id === variante.id ? "p2-product-modal__color--selected" : ""}`}
                      onClick={() => {
                        setVarianteSeleccionada(variante);
                        setTallaSeleccionada(null);
                      }}
                    >
                      {variante.color}
                    </button>
                  ))}
                </div>
                {(varianteSeleccionada?.marca ||
                  varianteSeleccionada?.referencia) && (
                  <p className="p2-product-modal__meta">
                    {varianteSeleccionada.marca && (
                      <span>Marca: {varianteSeleccionada.marca}</span>
                    )}
                    {varianteSeleccionada.referencia && (
                      <span>Ref. {varianteSeleccionada.referencia}</span>
                    )}
                  </p>
                )}
                <p className="p2-product-modal__variants-label p2-product-modal__variants-label--size">
                  Elige una talla
                </p>
                <div className="p2-product-modal__sizes">
                  {tallas.map((talla) => (
                    <button
                      key={talla.id}
                      type="button"
                      disabled={talla.cantidad <= 0}
                      className={`p2-product-modal__size ${tallaSeleccionada?.id === talla.id ? "p2-product-modal__size--selected" : ""}`}
                      onClick={() => {
                        setTallaSeleccionada(talla);
                        setCantidad(1);
                      }}
                    >
                      {talla.talla}
                      <small>
                        {talla.cantidad > 0
                          ? `${talla.cantidad} disponibles`
                          : "Agotada"}
                      </small>
                    </button>
                  ))}
                </div>
              </>
            )}
            {!cargandoVariantes && !errorVariantes && !tieneVariantes && (
              <p className="p2-product-modal__ready">
                Este producto no tiene opciones adicionales.
              </p>
            )}
          </div>
          <button
            type="button"
            className="p2-product-modal__action"
            disabled={cargandoVariantes || !puedeAgregar}
            onClick={agregarABolsa}
          >
            {agregado
              ? "Agregado a tu bolsa"
              : tieneVariantes && !tallaSeleccionada
                ? "Selecciona una talla"
                : "Agregar a mi bolsa"}
          </button>
        </div>
      </section>
    </div>
  );
}
