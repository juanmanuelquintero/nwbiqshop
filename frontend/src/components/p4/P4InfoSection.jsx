export default function P4InfoSection({ cantMinima, estadoalpormayor }) {
  return (
    <section className="p4-info-section">
      {/* Tarjeta: ¿Cómo hago mi pedido? */}
      <div className="p4-info-card">
        <div className="p4-info-card__header">
          <div className="p4-info-card__icon-wrap" aria-hidden="true">
            <div className="p4-icon-chat">
              <div className="p4-icon-chat__bubble">
                <div className="p4-icon-chat__dot" />
                <div className="p4-icon-chat__dot" />
                <div className="p4-icon-chat__dot" />
              </div>
              <div className="p4-icon-chat__tail" />
            </div>
          </div>
          <h2 className="p4-info-card__title">¿Cómo hago mi pedido?</h2>
        </div>
        <p className="p4-info-card__desc">
          Es muy fácil: entra a la línea que te interesa, revisa las categorías,
          toma captura de las referencias y envíalas por WhatsApp para ayudarte
          con tu pedido más{" "}
          <span className="p4-info-card__highlight">rápido.</span>
        </p>
        <div className="p4-info-card__steps">
          <div className="p4-step">
            <div className="p4-step__num">1</div>
            <p>
              Explora por línea y categoría para ver las referencias que te
              interesan.
            </p>
          </div>
          <div className="p4-step">
            <div className="p4-step__num">2</div>
            <p>Toma pantallazo de cada referencia o diseño que te interese.</p>
          </div>
          <div className="p4-step">
            <div className="p4-step__num">3</div>
            <p>
              Envíanos las imágenes por WhatsApp y te ayudamos a finalizar tu
              pedido.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta: Así lees cada referencia */}
      <div className="p4-info-card p4-info-card--ref">
        <div className="p4-info-card__header">
          <div className="p4-info-card__icon-wrap" aria-hidden="true">
            <div className="p4-icon-tag">
              <div className="p4-icon-tag__body">
                <div className="p4-icon-tag__hole" />
              </div>
            </div>
          </div>
          <h2 className="p4-info-card__title">Así lees cada referencia</h2>
        </div>
        <p className="p4-info-card__subdesc">
          Los mismos colores se mantienen en todo el catálogo.
        </p>
        <div className="p4-ref-legend">
          <div className="p4-ref-item p4-ref-item--gray">
            <div className="p4-ref-item__icon" aria-hidden="true">
              <div className="p4-icon-ruler-sm" />
            </div>
            <div>
              <strong>Talla y disponibilidad</strong>
              <span>Revisa la talla o medida indicada en la imagen.</span>
            </div>
          </div>
          {estadoalpormayor ? (
            <div className="p4-ref-item p4-ref-item--pink">
              <div className="p4-ref-item__icon" aria-hidden="true">
                <div className="p4-icon-heart" />
              </div>
              <div>
                <strong>Precio mayorista</strong>
                <span>Aplica desde {cantMinima} unidades combinadas.</span>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="p4-ref-item p4-ref-item--green">
            <div className="p4-ref-item__icon" aria-hidden="true">
              <div className="p4-icon-check">
                <div className="p4-icon-check__mark" />
              </div>
            </div>
            <div>
              <strong>Precio por unidad</strong>
              <span>Si no te interesa comprar al por mayor.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
