import { IconEye, IconCompare, IconHeart, IconPlus } from "./P3Icons";

/* ════════════════════════════════════════
   P3TarjetaProducto — tarjeta de producto
   Props:
     producto        — objeto producto / alimento
     formatearPrecio — función de formato de precio
     onVerDetalle    — callback al hacer click o en "Agregar"
════════════════════════════════════════ */
export default function P3TarjetaProducto({ producto, formatearPrecio, onVerDetalle }) {
  const precio      = Number(producto.precio_original ?? producto.precio ?? 0);
  const descuento   = Number(producto.descuento ?? 0);
  const precioFinal = descuento > 0 ? precio * (1 - descuento / 100) : precio;
  const marca       = producto.marca ?? producto.referencia ?? null;

  return (
    <article className="p3-card" onClick={() => onVerDetalle?.(producto)}>

      {/* Imagen */}
      <div className="p3-card__img-wrap">
        {descuento > 0 && (
          <span className="p3-card__badge">-{descuento}%</span>
        )}
        {producto.imagen
          ? <img src={producto.imagen} alt={producto.nombre} className="p3-card__img" />
          : <span className="p3-card__img-placeholder">Sin imagen</span>
        }

        {/* Acciones flotantes */}
        <div className="p3-card__actions" role="group" aria-label="Acciones rápidas">
          <button
            type="button"
            className="p3-card__action-btn"
            aria-label="Ver detalle"
            onClick={(e) => { e.stopPropagation(); onVerDetalle?.(producto); }}
          >
            <IconEye />
          </button>
          <button
            type="button"
            className="p3-card__action-btn"
            aria-label="Comparar"
            onClick={(e) => e.stopPropagation()}
          >
            <IconCompare />
          </button>
          <button
            type="button"
            className="p3-card__action-btn"
            aria-label="Agregar a favoritos"
            onClick={(e) => e.stopPropagation()}
          >
            <IconHeart />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p3-card__body">
        {marca && (
          <span className="p3-card__marca">{marca.toUpperCase()}</span>
        )}
        <h4 className="p3-card__nombre">{producto.nombre}</h4>

        <div className="p3-card__precios">
          {descuento > 0 && (
            <del className="p3-card__precio-original">
              {formatearPrecio(precio)}
            </del>
          )}
          <strong className="p3-card__precio-final">
            {formatearPrecio(precioFinal)}
          </strong>
        </div>

        <button
          type="button"
          className="p3-card__agregar"
          aria-label={`Agregar ${producto.nombre} al carrito`}
          onClick={(e) => { e.stopPropagation(); onVerDetalle?.(producto); }}
        >
          <IconPlus />
          Agregar
        </button>
      </div>
    </article>
  );
}
