import ProductCardP2 from "./ProductCardP2";

const formatPrice = (price) => {
  const value = Number(price);

  return Number.isFinite(value)
    ? new Intl.NumberFormat("es-CO").format(value)
    : price;
};

const productForCard = (product) => {
  const price = Number(product.precio);
  const discount = Number(product.descuento);
  const ahorro =
    Number.isFinite(price) && Number.isFinite(discount) && discount > 0
      ? formatPrice(price * (discount / 100))
      : null;

  return {
    ...product,
    name: product.nombre ?? product.name,
    image: product.imagen ?? product.image,
    highlight: product.descripcion ?? product.highlight,
    currentPrice: product.currentPrice ?? formatPrice(product.precio),
    originalPrice: product.originalPrice,
    discount: product.discount ?? ahorro,
    badge: product.badge ?? (discount > 0 ? `-${discount}%` : null),
  };
};

export default function ProductSectionP2({ collection }) {
  const name = collection.coleccion_nombre ?? collection.nombre;
  const description = collection.coleccion_descripcion ?? collection.descripcion;
  const products = collection.productos ?? [];
  const id = `coleccion-${name.toLowerCase().replace(/\s/g, "-")}`;

  return (
    <section className="p2-section" id={id}>
      <div className="p2-section-heading">
        <h2 className="p2-section-title">{name}</h2>
        {description && <p className="p2-section-description">{description}</p>}
      </div>
      <div className="p2-product-grid">
        {products.map((product) => (
          <ProductCardP2 key={product.id ?? product.nombre} product={productForCard(product)} />
        ))}
      </div>
    </section>
  );
}
