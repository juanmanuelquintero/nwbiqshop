export default function HeroBannerP2({ tienda }) {
  const inicial = tienda.nombre?.trim()?.charAt(0).toUpperCase() || "T";
  const telefono = tienda.telefono?.replace(/\D/g, "");

  return (
    <section className="p2-hero">
      <div className="p2-hero__shape p2-hero__shape--one" />
      <div className="p2-hero__shape p2-hero__shape--two" />
      <div className="p2-hero__content">
        <div className="p2-hero__brand">
          {tienda.logo ? <img className="p2-hero__logo" src={tienda.logo} alt={tienda.nombre} /> : <span className="p2-hero__logo p2-hero__logo--fallback">{inicial}</span>}
          <span className="p2-hero__activity">{tienda.actividad || "Tienda online"}</span>
        </div>
        <p className="p2-hero__eyebrow">Bienvenido a nuestra tienda</p>
        <h1 className="p2-hero__title">{tienda.nombre || "Tu tienda"}</h1>
        <p className="p2-hero__description">{tienda.descripcion || "Encuentra productos seleccionados para ti."}</p>
        <div className="p2-hero__actions">
          <a className="p2-hero__primary-action" href="#recomendaciones">Ver productos</a>
          {telefono && <a className="p2-hero__secondary-action" href={`https://wa.me/57${telefono}`} target="_blank" rel="noreferrer">Contactar por WhatsApp</a>}
        </div>
        <div className="p2-hero__details">
          {tienda.direccion && <span>Ubicación: {tienda.direccion}</span>}
          {tienda.telefono && <span>Tel: {tienda.telefono}</span>}
        </div>
      </div>
    </section>
  );
}
