export default function ProductPriceP2({
  product,
  estadoAlPorMayor = false,
  cantidadMinimaMayorista = 6,
}) {
  const precioMayorista =
    estadoAlPorMayor && product.precio_alpormayor != null
      ? Number(product.precio_alpormayor)
      : null;
  const precioUnidad = Number(product.precio_final ?? product.precio ?? 0);
  return (
    <>
      {product.discount && (
        <div className="p2-product-discount">
          Te ahorras ${product.discount}
        </div>
      )}
      <div className="p2-product-current-price">$ {product.currentPrice}</div>
      {product.originalPrice && (
        <div className="p2-product-original-price">
          $ {product.originalPrice}
        </div>
      )}
      {product.financing && (
        <div className="p2-product-financing">{product.financing}</div>
      )}
      {precioMayorista != null && (
        <div className="p2-wholesale-info">
          <div className="p2-wholesale-info__header">
            <span className="p2-wholesale-info__title">Precio mayorista</span>

            <span className="p2-wholesale-info__badge">
              Desde {cantidadMinimaMayorista} uds
            </span>
          </div>

          <div className="p2-wholesale-info__price">{precioMayorista}</div>

          <div className="p2-wholesale-info__profit">
            <span>Ganancia potencial</span>

            <strong>{Math.max(0, precioUnidad - precioMayorista)}</strong>
          </div>
        </div>
      )}
    </>
  );
}
