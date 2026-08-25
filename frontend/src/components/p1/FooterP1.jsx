function FooterP1({ tienda, estilos }) {
  const bg   = estilos?.color_principal  ?? "#ffffff";
  const sec  = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color      ?? "#042d78";
  const btn  = estilos?.color_botones    ?? "#35a4ec";

  const year = new Date().getFullYear();

  return (
    <footer
      className="p1-footer"
      style={{
        background: `linear-gradient(160deg, ${sec}ee 0%, ${titl} 100%)`,
        boxShadow: `0 -4px 32px ${sec}40`,
      }}
    >
      <div className="p1-footer__orb p1-footer__orb--1" style={{ background: `${bg}10` }} />
      <div className="p1-footer__orb p1-footer__orb--2" style={{ background: `${btn}10` }} />

      <div className="p1-footer__inner">
        {/* Col 1 — Brand */}
        <div className="p1-footer__brand">
          {tienda.logo ? (
            <img src={tienda.logo} alt={tienda.nombre} className="p1-footer__logo" />
          ) : (
            <div className="p1-footer__logo-alt" style={{ background: `${bg}20`, color: bg }}>
              {tienda.nombre[0].toUpperCase()}
            </div>
          )}
          <h3 className="p1-footer__nombre" style={{ color: bg }}>{tienda.nombre}</h3>
          <p className="p1-footer__actividad" style={{ color: `${bg}90` }}>{tienda.actividad}</p>
          {tienda.descripcion && (
            <p className="p1-footer__desc" style={{ color: `${bg}70` }}>{tienda.descripcion}</p>
          )}
        </div>

        {/* Col 2 — Contacto */}
        <div className="p1-footer__col">
          <h4 className="p1-footer__col-titulo" style={{ color: titl }}>Contacto</h4>
          <ul className="p1-footer__lista">
            {tienda.telefono && (
              <li>
                <span className="p1-footer__icon">📞</span>
                <a href={`tel:${tienda.telefono}`} style={{ color: `${bg}85` }}>{tienda.telefono}</a>
              </li>
            )}
            {tienda.direccion && (
              <li>
                <span className="p1-footer__icon">📍</span>
                <span style={{ color: `${bg}85` }}>{tienda.direccion}</span>
              </li>
            )}
            {!tienda.telefono && !tienda.direccion && (
              <li style={{ color: `${bg}60`, fontStyle: "italic", fontSize: "0.85rem" }}>
                Sin datos de contacto aún
              </li>
            )}
          </ul>
        </div>

        {/* Col 3 — Compra segura */}
        <div className="p1-footer__col">
          <h4 className="p1-footer__col-titulo" style={{ color: titl }}>Compra segura</h4>
          <ul className="p1-footer__lista">
            <li><span className="p1-footer__icon">🔒</span><span style={{ color: `${bg}85` }}>Pagos seguros</span></li>
            <li><span className="p1-footer__icon">🚚</span><span style={{ color: `${bg}85` }}>Envíos a todo el país</span></li>
            <li><span className="p1-footer__icon">↩️</span><span style={{ color: `${bg}85` }}>Cambios y devoluciones</span></li>
            <li><span className="p1-footer__icon">💬</span><span style={{ color: `${bg}85` }}>Soporte por WhatsApp</span></li>
          </ul>
        </div>

        {/* Col 4 — Atención */}
        <div className="p1-footer__col">
          <h4 className="p1-footer__col-titulo" style={{ color: titl }}>Nos encanta atenderte</h4>
          <ul className="p1-footer__lista">
            <li><span className="p1-footer__icon">🕐</span><span style={{ color: `${bg}85` }}>Lun – Sab: 8am – 8pm</span></li>
            <li><span className="p1-footer__icon">🛍️</span><span style={{ color: `${bg}85` }}>Miles de clientes felices</span></li>
            <li><span className="p1-footer__icon">⭐</span><span style={{ color: `${bg}85` }}>Calidad garantizada</span></li>
            <li><span className="p1-footer__icon">🎁</span><span style={{ color: `${bg}85` }}>Ofertas especiales siempre</span></li>
          </ul>
        </div>
      </div>

      <div className="p1-footer__bottom" style={{ borderColor: `${bg}20` }}>
        <span style={{ color: `${bg}60` }}>© {year} {tienda.nombre}. Todos los derechos reservados.</span>
        <span className="p1-footer__powered" style={{ color: `${bg}55` }}>
          Desarrollado con ❤️ por <strong style={{ color: titl }}>NWBIQ</strong>
        </span>
      </div>
    </footer>
  );
}

export default FooterP1;
