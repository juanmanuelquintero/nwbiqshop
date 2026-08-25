export default function ProductPriceP2({ product }) {
  return <>{product.discount && <div className="p2-product-discount">Te ahorras ${product.discount}</div>}<div className="p2-product-current-price">$ {product.currentPrice}</div>{product.originalPrice && <div className="p2-product-original-price">$ {product.originalPrice}</div>}{product.financing && <div className="p2-product-financing">{product.financing}</div>}</>;
}
