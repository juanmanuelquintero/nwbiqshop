export default function HeaderP2({ tienda, colecciones = [] }) {
  const inicial = tienda.nombre?.trim()?.charAt(0).toUpperCase() || "T";
  const telefono = tienda.telefono?.replace(/\D/g, "");
  const enlaces = colecciones.length
    ? colecciones.map((coleccion) => ({
        nombre: coleccion.coleccion_nombre,
        destino: `#coleccion-${coleccion.coleccion_nombre.toLowerCase().replace(/\s/g, "-")}`,
      }))
    : [
        { nombre: "Inicio", destino: "#inicio" },
        { nombre: "Productos", destino: "#recomendaciones" },
        { nombre: "Novedades", destino: "#daily-picks" },
      ];

  return (
    <header className="p2-header" id="inicio">
      <a href="#inicio" className="p2-header__brand" aria-label={`Inicio de ${tienda.nombre}`}>
        {tienda.logo ? <img src={tienda.logo} alt="" className="p2-header__logo" /> : <span className="p2-header__logo p2-header__logo--fallback">{inicial}</span>}
        <span className="p2-header__name">{tienda.nombre || "Tu tienda"}</span>
      </a>

      <nav className="p2-header__nav" aria-label="Navegación principal">
        {enlaces.map((enlace) => <a key={enlace.destino} href={enlace.destino} className="p2-header__link">{enlace.nombre}</a>)}
      </nav>

      {telefono && <a className="p2-header__contact" href={`https://wa.me/57${telefono}`} target="_blank" rel="noreferrer"><span className="p2-header__contact-label">Escríbenos</span><span aria-hidden="true">↗</span></a>}
    </header>
  );
}
