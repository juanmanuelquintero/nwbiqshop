export default function MiPointsSectionP2() {
  return (
    <section className="p2-size-guide" id="guia-tallas">
      <div className="p2-size-guide__visual" aria-hidden="true">
        <span className="p2-size-guide__size p2-size-guide__size--small">S</span>
        <span className="p2-size-guide__size p2-size-guide__size--medium">M</span>
        <span className="p2-size-guide__size p2-size-guide__size--large">L</span>
        <span className="p2-size-guide__tape">⌁</span>
      </div>
      <div className="p2-size-guide__content">
        <p className="p2-size-guide__eyebrow">Compra con seguridad</p>
        <h2 className="p2-size-guide__title">¿Tienes dudas con la talla?</h2>
        <p className="p2-size-guide__description">Antes de comprar, revisa con calma tu talla. Compara tus medidas con la guía del producto para elegir la opción que te haga sentir mejor.</p>
        <ul className="p2-size-guide__tips">
          <li>Ten a mano una prenda que te quede bien.</li>
          <li>Revisa las medidas antes de confirmar tu pedido.</li>
        </ul>
        <button type="button" className="p2-size-guide__button">Buscar mi talla <span aria-hidden="true">↓</span></button>
      </div>
    </section>
  );
}
