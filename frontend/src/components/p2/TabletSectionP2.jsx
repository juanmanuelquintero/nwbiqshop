import ProductCardP2 from "./ProductCardP2";

export default function TabletSectionP2({ tablets }) {
  return <section className="p2-section" id="tabletas"><h2 className="p2-section-title">POCO Tabletas</h2><div className="p2-product-grid">{tablets.map((product, index) => <ProductCardP2 key={index} product={product} />)}</div></section>;
}
