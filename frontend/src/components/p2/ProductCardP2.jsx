import ProductPriceP2 from "./ProductPriceP2";

export default function ProductCardP2({ product }) {
  return (
    <article className="p2-product-card">
      <div className="p2-product-card__media">
        {product.badge && <span className="p2-product-badge">{product.badge}</span>}
        {product.image ? <img src={product.image} alt={product.name} className="p2-product-image" /> : <div className="p2-product-image-placeholder">⌁</div>}
      </div>
      <div className="p2-product-card__content">
        <h3 className="p2-product-name">{product.name}</h3>
        {product.highlight && <p className="p2-product-highlight">{product.highlight}</p>}
        {product.variants && <div className="p2-product-variants">{product.variants.map((variant, index) => <span key={index} className="p2-variant-chip">{variant}</span>)}</div>}
        <div className="p2-product-card__price"><ProductPriceP2 product={product} /></div>
        <button className="p2-buy-btn">Comprar ahora <span aria-hidden="true">→</span></button>
      </div>
    </article>
  );
}
