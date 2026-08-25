import ProductPriceP2 from "./ProductPriceP2";

export default function RecommendationsSectionP2({ recommendations }) {
  return <section className="p2-section" id="recomendaciones"><h2 className="p2-section-title">MÃ¡s recomendaciones</h2><div className="p2-product-grid">{recommendations.map((item, index) => <div key={index} className="p2-product-card"><div className="p2-product-image-placeholder">ðŸŽ§</div><div className="p2-product-name">{item.name}</div><ProductPriceP2 product={item} /><button className="p2-buy-btn">Comprar ahora</button></div>)}</div></section>;
}
