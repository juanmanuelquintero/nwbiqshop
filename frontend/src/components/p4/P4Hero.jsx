export default function P4Hero({
  tienda,
  totalProductos,
  colecciones,
  cantMinima,
  telefonoWhatsApp,
  estdoalpormayor,
}) {
  const nombreTienda = tienda?.nombre || "Mi Tienda";
  const logoTienda = tienda?.logo ?? null;

  return (
    <section className="p4-hero">
      <div className="p4-hero__inner">
        {/* Marca */}
        <div className="p4-hero__brand">
          <div className="p4-hero__brand-icon" aria-hidden="true">
            {logoTienda ? (
              <img
                src={logoTienda}
                alt={nombreTienda}
                className="p4-hero__brand-logo"
              />
            ) : (
              <div className="p4-hero__brand-avatar">
                <div className="p4-icon-dog">
                  <div className="p4-icon-dog__head">
                    <div className="p4-icon-dog__ear p4-icon-dog__ear--left" />
                    <div className="p4-icon-dog__ear p4-icon-dog__ear--right" />
                    <div className="p4-icon-dog__face">
                      <div className="p4-icon-dog__eye p4-icon-dog__eye--left" />
                      <div className="p4-icon-dog__eye p4-icon-dog__eye--right" />
                      <div className="p4-icon-dog__nose" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <span className="p4-hero__brand-name">{nombreTienda}</span>
        </div>

        {/* Título */}
        <h1 className="p4-hero__title">
          {`Catálogo de ${tienda?.actividad || "productos"} por mayor`}
        </h1>

        {/* Descripción */}
        {tienda?.descripcion && (
          <p className="p4-hero__desc">{tienda.descripcion}</p>
        )}

        {/* Caja WhatsApp */}
        {telefonoWhatsApp && (
          <div className="p4-hero__whatsapp-box">
            <div className="p4-hero__ws-icon" aria-hidden="true">
              <div className="p4-icon-phone">
                <div className="p4-icon-phone__body">
                  <div className="p4-icon-phone__screen" />
                </div>
              </div>
            </div>
            <span>
              Para hacer tu pedido: toma pantallazo de las referencias que te
              gusten y envíalas por{" "}
              <a
                href={`https://wa.me/${telefonoWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                className="p4-hero__ws-link"
              >
                WhatsApp
              </a>
            </span>
          </div>
        )}

        {/* Estadísticas */}
        <div className="p4-hero__stats">
          <div className="p4-hero__stat">
            <span className="p4-hero__stat-value">{totalProductos}</span>
            <span className="p4-hero__stat-label">REFERENCIAS</span>
          </div>
          <div className="p4-hero__stat-divider" aria-hidden="true" />
          <div className="p4-hero__stat">
            <span className="p4-hero__stat-value">{colecciones.length}</span>
            <span className="p4-hero__stat-label">CATEGORÍAS</span>
          </div>
          <div className="p4-hero__stat-divider" aria-hidden="true" />
          {estdoalpormayor ? (
            <div className="p4-hero__stat">
              <span className="p4-hero__stat-value">
                Desde {cantMinima} uds
              </span>
              <span className="p4-hero__stat-label">PEDIDO MÍNIMO</span>
            </div>
          ) : (
            <></>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          className="p4-hero__cta"
          onClick={() =>
            document
              .getElementById("p4-catalogo")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Bienvenid@ — baja para ver nuestro catálogo completo ↓
        </button>
      </div>
    </section>
  );
}
