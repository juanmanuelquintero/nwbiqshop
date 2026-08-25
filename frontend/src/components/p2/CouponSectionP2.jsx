const formatearPrecio = (precio) => `$${Number(precio || 0).toLocaleString("es-CO")}`;

function obtenerPrecioFinal(producto, descuentoBase = 0) {
  if (producto.precio_final != null) return Number(producto.precio_final);
  const original = Number(producto.precio_original ?? producto.precio ?? 0);
  const descuento = Number(producto.descuento ?? descuentoBase);
  return original * (1 - descuento / 100);
}

function PromoProductCard({ producto, descuentoBase }) {
  const precioOriginal = Number(producto.precio_original ?? producto.precio ?? 0);
  const precioFinal = obtenerPrecioFinal(producto, descuentoBase);
  const descuento = Number(producto.descuento ?? descuentoBase);

  return (
    <article className="p2-promo-product">
      <div className="p2-promo-product__image-wrap">
        {producto.imagen ? <img className="p2-promo-product__image" src={producto.imagen} alt={producto.nombre} /> : <span className="p2-promo-product__image-placeholder" aria-hidden="true">♧</span>}
        <span className="p2-promo-product__badge">{descuento > 0 ? `-${descuento}%` : "Promoción"}</span>
      </div>
      <div className="p2-promo-product__content">
        <h3 className="p2-promo-product__name">{producto.nombre}</h3>
        <div className="p2-promo-product__prices">
          <span className="p2-promo-product__original">{formatearPrecio(precioOriginal)}</span>
          <strong className="p2-promo-product__final">{formatearPrecio(precioFinal)}</strong>
        </div>
        <button className="p2-promo-product__detail" type="button">Ver detalle <span aria-hidden="true">→</span></button>
      </div>
    </article>
  );
}

function ProductCarousel({ productos, descuentoBase }) {
  return <div className="p2-promo-carousel">{productos.map((producto) => <PromoProductCard key={producto.id} producto={producto} descuentoBase={descuentoBase} />)}</div>;
}

export default function CouponSectionP2({ tienda }) {
  const promocion = tienda.datospromocion;
  const productosGenerales = tienda.productos_promo_general ?? [];
  const productosUnitarios = tienda.productos_promo_unitaria ?? [];
  const tieneGeneral = promocion?.estado && productosGenerales.length > 0;

  if (!tieneGeneral && productosUnitarios.length === 0) return null;

  return <>
    {tieneGeneral && <section className="p2-promotions" id="promociones">
      <span className="p2-promotions__fire p2-promotions__fire--one" aria-hidden="true">🔥</span>
      <span className="p2-promotions__fire p2-promotions__fire--two" aria-hidden="true">🔥</span>
      <span className="p2-promotions__fire p2-promotions__fire--three" aria-hidden="true">🔥</span>
      <span className="p2-promotions__fire p2-promotions__fire--four" aria-hidden="true">🔥</span>
      <div className="p2-promotions__heading">
        <p className="p2-promotions__eyebrow">Selección especial</p>
        <h2 className="p2-promotions__title">{promocion.nombre || "Promociones"}</h2>
        <p className="p2-promotions__description">{promocion.descripcion || "Descubre productos seleccionados para esta temporada."}</p>
      </div>
      <ProductCarousel productos={productosGenerales} descuentoBase={promocion.descuento} />
    </section>}

    {productosUnitarios.length > 0 && <section className="p2-unit-promotions" id="promociones-unitarias">
      <div className="p2-unit-promotions__heading">
        <p className="p2-unit-promotions__eyebrow">Ofertas seleccionadas</p>
        <h2 className="p2-unit-promotions__title">Promociones Unitarias</h2>
        <p className="p2-unit-promotions__description">Productos con una promoción especial para ti.</p>
      </div>
      <ProductCarousel productos={productosUnitarios} descuentoBase={0} />
    </section>}
  </>;
}
