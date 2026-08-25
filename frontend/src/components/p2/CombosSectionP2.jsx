import ProductPriceP2 from "./ProductPriceP2";

export default function CombosSectionP2({ combos }) {
  return <section className="p2-section" id="combos"><h2 className="p2-section-title">Elige tu combo ideal</h2><div className="p2-combo-grid">{combos.map((combo, index) => <div key={index} className="p2-combo-card"><div className="p2-combo-name">{combo.name}</div><ProductPriceP2 product={combo} /><button className="p2-buy-btn p2-buy-btn--combo">Comprar ahora</button></div>)}</div></section>;
}
