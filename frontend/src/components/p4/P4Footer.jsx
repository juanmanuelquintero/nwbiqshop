export default function P4Footer({ tienda, telefonoWhatsApp }) {
  const nombreTienda = tienda?.nombre || "Mi Tienda";
  const logoTienda   = tienda?.logo   ?? null;
  const inicial      = nombreTienda.trim().charAt(0).toUpperCase();

  return (
    <footer className="p4-footer">
      <div className="p4-footer__inner">
        <div className="p4-footer__brand">
          {logoTienda ? (
            <img src={logoTienda} alt={nombreTienda} className="p4-footer__logo" />
          ) : (
            <div className="p4-footer__avatar">{inicial}</div>
          )}
          <strong>{nombreTienda}</strong>
        </div>
        {telefonoWhatsApp && (
          <a
            href={`https://wa.me/${telefonoWhatsApp}`}
            target="_blank"
            rel="noreferrer"
            className="p4-footer__ws"
          >
            Escríbenos por WhatsApp
          </a>
        )}
      </div>
      <p className="p4-footer__copy">
        © {new Date().getFullYear()} NWBIQShop. Todos los derechos reservados.
      </p>
    </footer>
  );
}
