import ProductPriceP2 from "./ProductPriceP2";

export default function DailyPicksSectionP2({ picks }) {
  return <section className="p2-section"><h2 className="p2-section-title">Daily Picks</h2><div className="p2-daily-picks-grid">{picks.map((item, index) => <div key={index} className="p2-daily-pick-card">{item.image ? <img src={item.image} alt={item.name} className="p2-product-image" /> : <div className="p2-product-image-placeholder">ðŸ“¦</div>}<div className="p2-product-name">{item.name}</div>{item.specs && <div className="p2-product-highlight">{item.specs}</div>}<ProductPriceP2 product={item} /><button className="p2-buy-btn">Comprar ahora</button></div>)}</div></section>;
}
