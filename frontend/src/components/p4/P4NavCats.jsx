export default function P4NavCats({ colecciones }) {
  return (
    <section className="p4-nav-cats">
      <p className="p4-nav-cats__hint">
        Elige una línea y luego la categoría que deseas ver
      </p>

      {/* Botones de línea */}
      <div className="p4-nav-cats__main">
        {colecciones.length > 0 ? (
          colecciones.map((coleccion) => {
            const nombre = coleccion.coleccion_nombre ?? coleccion.nombre ?? "Colección";
            return (
              <button
                key={coleccion.id ?? nombre}
                type="button"
                className="p4-cat-btn"
                onClick={() =>
                  document
                    .getElementById(`p4-col-${coleccion.id ?? nombre}`)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <span className="p4-cat-btn__dot" aria-hidden="true" />
                {nombre} ▾
              </button>
            );
          })
        ) : (
          <>
            <button type="button" className="p4-cat-btn p4-cat-btn--teal">
              <span className="p4-cat-btn__icon p4-cat-btn__icon--bed" aria-hidden="true">
                <span className="p4-icon-bed__base" />
                <span className="p4-icon-bed__pillow" />
              </span>
              Cobijas ▾
            </button>
            <button type="button" className="p4-cat-btn p4-cat-btn--wine">
              <span className="p4-cat-btn__icon p4-cat-btn__icon--moon" aria-hidden="true">
                <span className="p4-icon-moon" />
              </span>
              Pijamas ▾
            </button>
            <button type="button" className="p4-cat-btn p4-cat-btn--orange">
              <span className="p4-cat-btn__icon p4-cat-btn__icon--shirt" aria-hidden="true">
                <span className="p4-icon-shirt__body" />
                <span className="p4-icon-shirt__sleeve p4-icon-shirt__sleeve--left" />
                <span className="p4-icon-shirt__sleeve p4-icon-shirt__sleeve--right" />
              </span>
              Camisetas
            </button>
            <button type="button" className="p4-cat-btn p4-cat-btn--coral">
              <span className="p4-cat-btn__icon p4-cat-btn__icon--bolt" aria-hidden="true">
                <span className="p4-icon-bolt" />
              </span>
              Liquidaciones
            </button>
          </>
        )}
      </div>

      {/* Pills secundarias */}
      <div className="p4-nav-cats__pills">
        <button
          type="button"
          className="p4-pill"
          onClick={() =>
            document.getElementById("guia-tallas")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <span className="p4-pill__icon" aria-hidden="true">
            <span className="p4-icon-ruler" />
          </span>
          Guía de tallas
        </button>
        <button type="button" className="p4-pill">
          <span className="p4-pill__icon" aria-hidden="true">
            <span className="p4-icon-fire" />
          </span>
          Lista de precios
        </button>
      </div>
    </section>
  );
}
