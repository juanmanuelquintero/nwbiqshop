import P3TarjetaProducto from "./P3TarjetaProducto";

/* ════════════════════════════════════════
   P3ColeccionSlider — sección de una colección
   Props:
     coleccion       — objeto colección con .productos / .alimentos
     formatearPrecio — función de formato de precio
     onVerDetalle    — callback al seleccionar un producto
════════════════════════════════════════ */
export default function P3ColeccionSlider({ coleccion, formatearPrecio, onVerDetalle }) {
  const nombre      = coleccion.titulo ?? coleccion.coleccion_nombre ?? coleccion.nombre ?? "Colección";
  const descripcion = coleccion.descripcion ?? coleccion.coleccion_descripcion ?? "";
  const productos   = coleccion.alimentos ?? coleccion.productos ?? [];
  const anclaId     = coleccion.id ?? coleccion.titulo ?? coleccion.coleccion_nombre ?? coleccion.nombre;

  if (productos.length === 0) return null;

  return (
    <section
      className="p3-coleccion"
      id={`p3-coleccion-${anclaId}`}
      aria-labelledby={`col-titulo-${coleccion.id}`}
    >
      {/* Cabecera */}
      <div className="p3-coleccion__header">
        <div>
          <h3 className="p3-coleccion__titulo" id={`col-titulo-${coleccion.id}`}>
            {nombre}
          </h3>
          {descripcion && <p className="p3-coleccion__desc">{descripcion}</p>}
        </div>
        <span className="p3-coleccion__conteo">
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      {/* Grid */}
      <div className="p3-coleccion__grid p3-coleccion__grid--list">
        {productos.map((producto) => (
          <P3TarjetaProducto
            key={producto.alimento_id ?? producto.id}
            producto={producto}
            formatearPrecio={formatearPrecio}
            onVerDetalle={onVerDetalle}
          />
        ))}
      </div>
    </section>
  );
}
