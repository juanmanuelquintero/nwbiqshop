import { useState } from "react";
import "../styles/modalsuscripcion.css";
import { useNavigate } from "react-router-dom";

function ModalSuscripcion({ setmodal }) {
  const [mostrarTodo, setMostrarTodo] = useState(false);
  const navigate = useNavigate();

  // Tasa aproximada configurable
  const convertirDolaresACOP = (dolares) => {
    const tasaCambio = 4000;

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(dolares * tasaCambio);
  };

  const beneficios = [
    "Acceso completo a todas las funcionalidades",
    "Gestiona todos los productos que necesites",
    "Control y gestión de inventario",
    "Personaliza completamente el estilo de tu tienda",
    "Crea y administra promociones",
    "Organiza tus productos en colecciones",
    "Gestión completa de pedidos",
    "Tu tienda pública disponible desde el momento de crear tu cuenta",
    "2 plantillas para elegir el diseño de tu tienda",
    "Automatización de la información de compra mediante WhatsApp",
    "Notificaciones dentro de la aplicación",
    "Actualizaciones sobre productos y cambios en tu tienda",
    "Estadísticas para conocer el rendimiento de tu negocio",
    "Información de tu tienda prácticamente en tiempo real",
    "Seguimiento del estado de los pedidos para tus clientes",
    "Una experiencia que genera mayor confianza en tus compradores",
  ];

  const beneficiosVisibles = mostrarTodo ? beneficios : beneficios.slice(0, 7);

  return (
    <div className="contenedor-modal-suscripcion">
      {/* Objetos decorativos */}
      <div className="decoracion decoracion-1"></div>
      <div className="decoracion decoracion-2"></div>
      <div className="decoracion decoracion-3"></div>

      <div className="modal-suscripcion" onClick={(e) => e.stopPropagation()}>
        <button
          className="cerrar-modal-suscripcion"
          onClick={() => navigate("/")}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="suscripcion-contenido">
          {/* Encabezado */}
          <div className="suscripcion-header">
            <div className="badge-plan">⚠️ SUSCRIPCIÓN VENCIDA</div>

            <h2>Tu suscripción se ha vencido</h2>

            <p>
              Renueva tu suscripción para recuperar el acceso a todas las
              herramientas de tu tienda.
            </p>
          </div>

          {/* Precio */}
          <div className="precio-suscripcion">
            <span className="precio-moneda">$</span>

            <span className="precio-valor">10</span>

            <div className="precio-info">
              <span>USD</span>
              <small>por mes</small>
            </div>
          </div>

          <div className="conversion-pesos">
            Aproximadamente <strong>{convertirDolaresACOP(10)} COP</strong> al
            mes
          </div>

          {/* Beneficios */}
          <div className="beneficios-suscripcion">
            <h3>Beneficios de renovar tu suscripción</h3>

            <div className="lista-beneficios">
              {beneficiosVisibles.map((beneficio, index) => (
                <div className="beneficio" key={index}>
                  <div className="check-beneficio">✓</div>

                  <span>{beneficio}</span>
                </div>
              ))}
            </div>

            {beneficios.length > 7 && (
              <button
                className="btn-ver-beneficios"
                onClick={() => setMostrarTodo(!mostrarTodo)}
              >
                {mostrarTodo
                  ? "Ver menos"
                  : `Ver los ${beneficios.length - 7} beneficios restantes`}
              </button>
            )}
          </div>

          {/* Mensaje de confianza */}
          <div className="mensaje-confianza">
            <div className="icono-confianza">🚀</div>

            <div>
              <strong>Tu tienda lista en menos de 5 minutos</strong>

              <p>
                No necesitas conocimientos técnicos ni crear una página web
                desde cero. Nosotros ponemos la tecnología, tú te concentras en
                hacer crecer tu negocio.
              </p>
            </div>
          </div>

          {/* Botón */}
          <button className="btn-suscribirse">
            Renovar suscripción
            <span>→</span>
          </button>

          <p className="texto-final-suscripcion">
            Renueva hoy y sigue gestionando tu tienda sin interrupciones.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModalSuscripcion;
