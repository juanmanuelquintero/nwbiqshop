export default function FooterP2({ tienda }) {
  const name = tienda.nombre || "Tu tienda";
  const phone = tienda.telefono?.replace(/\D/g, "");
  const year = new Date().getFullYear();

  return (
    <footer className="p2-footer">
      <div className="p2-footer__main">
        <div className="p2-footer__brand">
          {tienda.logo ? (
            <img src={tienda.logo} alt={name} className="p2-footer__logo" />
          ) : (
            <span className="p2-footer__logo p2-footer__logo--fallback">
              {name.trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="p2-footer__eyebrow">
              {tienda.actividad || "Tu tienda en línea"}
            </p>
            <h2>{name}</h2>
          </div>
          {tienda.descripcion && (
            <p className="p2-footer__description">{tienda.descripcion}</p>
          )}
        </div>

        <div className="p2-footer__contact">
          <p className="p2-footer__label">Estamos para ayudarte</p>
          {phone && (
            <a
              href={`https://wa.me/57${phone}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: {tienda.telefono}
            </a>
          )}
          {tienda.direccion && <span>{tienda.direccion}</span>}
          {!phone && !tienda.direccion && (
            <span>Compra fácil, segura y con estilo.</span>
          )}
        </div>
      </div>

      <div className="p2-footer__bottom">
        <span>© {year} NWBIQShop. Todos los derechos reservados.</span>
        <span className="p2-footer__made-by">
          Desarrollado <span aria-hidden="true">✦</span> por{" "}
          <strong>NWBIQ</strong>
        </span>
      </div>
    </footer>
  );
}
