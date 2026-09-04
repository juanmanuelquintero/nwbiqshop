import { useState } from "react";
import Dudaspedido from "../plantilla1duda";

const CONFIANZA = [
  {
    icono: "✓",
    titulo: "Pedido seguro",
    descripcion: "Tu solicitud se registra de forma clara y protegida.",
  },
  {
    icono: "♥",
    titulo: "Atención personalizada",
    descripcion:
      "Estamos disponibles para resolver tus dudas antes de comprar.",
  },
  {
    icono: "◇",
    titulo: "Compra con tranquilidad",
    descripcion: "Conoce cada producto y confirma tu pedido con nosotros.",
  },
];

export default function BarraConfianza({ estilos, pasarela }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <section className="p2-trust-section" aria-label="Compra con confianza">
      <div className="p2-trust-section__intro">
        <p className="p2-trust-section__eyebrow">Tu compra, a tu ritmo</p>
        <h2 className="p2-trust-section__title">
          Comprar aquí es sencillo y confiable
        </h2>
      </div>

      <div className="p2-trust-section__cards">
        {CONFIANZA.map((item) => (
          <article key={item.titulo} className="p2-trust-card">
            <span className="p2-trust-card__icon" aria-hidden="true">
              {item.icono}
            </span>
            <div>
              <h3 className="p2-trust-card__title">{item.titulo}</h3>
              <p className="p2-trust-card__description">{item.descripcion}</p>
            </div>
          </article>
        ))}
      </div>

      <button
        className="p2-trust-section__help"
        onClick={() => setModalAbierto(true)}
      >
        ¿Cómo hago mi pedido?<span aria-hidden="true">→</span>
      </button>

      {modalAbierto && (
        <Dudaspedido
          setModalOpen={setModalAbierto}
          estilos={estilos}
          pasarela={pasarela}
        />
      )}
    </section>
  );
}
