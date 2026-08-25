export default function BenefitsBarP2({ tienda }) {
  const promocion = tienda.datospromocion;
  const hayPromocionActiva = Boolean(promocion?.estado);
  const mensaje = hayPromocionActiva
    ? promocion.nombre || "Promoción activa"
    : tienda.nombre || "Tu tienda";
  const etiqueta = hayPromocionActiva ? "Promoción activa" : "Nuestra tienda";
  // Dos bloques idénticos y suficientemente largos hacen que el reinicio
  // de la animación ocurra fuera del área visible.
  const elementos = Array.from({ length: 24 }, (_, index) => index);

  return (
    <section className="p2-benefits-bar" aria-label={etiqueta}>
      <p className="p2-benefits-bar__sr-only">{etiqueta}: {mensaje}</p>
      <div className="p2-benefits-bar__track" aria-hidden="true">
        {elementos.map((index) => (
          <span key={index} className="p2-benefits-bar__item">
            <span className="p2-benefits-bar__spark">✦</span>
            {mensaje}
          </span>
        ))}
      </div>
    </section>
  );
}
