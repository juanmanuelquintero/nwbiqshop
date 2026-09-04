import "../styles/componentes.css";

// Colores de acento para cada paso (independientes de la paleta de la tienda)
const PASO_COLORS = ["#25D366", "#f59e0b", "#6366f1"];

function Dudaspedido({ setModalOpen, estilos, pasarela }) {
  const bg = estilos?.color_principal ?? "#ffffff";
  const sec = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";

  const pasosPasarela = [
    {
      num: 1,
      titulo: "Elige tus productos",
      desc: "Navega por nuestro catálogo y agrega a tu bolsa todo lo que te guste.",
    },
    {
      num: 2,
      titulo: "Revisa tu bolsa",
      desc: "Haz clic en el botón Ingresar a mi carrito para ver tu selección.",
    },
    {
      num: 3,
      titulo: "Finaliza tu compra",
      desc: "Completa el pago de forma segura a través de nuestra pasarela de pagos.",
    },
  ];

  const pasosWhatsApp = [
    {
      num: 1,
      titulo: "Elige el producto que quieres",
      desc: "Navega por nuestro catálogo y encuentra lo que más te guste.",
    },
    {
      num: 2,
      titulo: "Presiona «Ver detalle»",
      desc: "Prodas seleccionar la cantidad del producto entre otras opciones, y agregarlas a tu bolsa.",
    },
    {
      num: 3,
      titulo: "Confirma con nosotros por WhatsApp",
      desc: "Entra a tu carrito y haz click en el boton 'hacer pedido' llena el formulario y automaticamente te dirigira a whatsapp para finalizar el pago.",
    },
  ];

  const pasos = pasarela ? pasosPasarela : pasosWhatsApp;

  return (
    <div
      className="con-plantilla1__modal-overlay"
      onClick={() => setModalOpen(false)}
    >
      <div
        className="con-plantilla1__modal"
        style={{ borderTop: `4px solid ${sec}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="con-plantilla1__modal-close"
          style={{ color: sec }}
          onClick={() => setModalOpen(false)}
        >
          ✕
        </button>

        <h2 className="con-plantilla1__modal-titulo" style={{ color: titl }}>
          ¿Cómo hago mi pedido?
        </h2>
        <p className="con-plantilla1__modal-subtitulo" style={{ color: txt }}>
          Es fácil y sin enredos, especialmente para ti 😊
        </p>

        <ol className="con-plantilla1__modal-pasos">
          {pasos.map((paso, i) => {
            const color = PASO_COLORS[i % PASO_COLORS.length];
            return (
              <li key={paso.num} style={{ color: txt }}>
                <span
                  className="con-plantilla1__paso-num"
                  style={{
                    background: color,
                    color: "#fff",
                    boxShadow: `0 3px 10px ${color}55`,
                  }}
                >
                  {paso.num}
                </span>
                <div>
                  <strong style={{ color: titl }}>{paso.titulo}</strong>
                  <p>{paso.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <button
          className="con-plantilla1__modal-btn p1-btn--green"
          style={{ color: "#fff" }}
          onClick={() => setModalOpen(false)}
        >
          {pasarela ? "💳 ¡Entendido, voy a comprar!" : "💬 ¡Entendido!"}
        </button>
      </div>
    </div>
  );
}

export default Dudaspedido;
