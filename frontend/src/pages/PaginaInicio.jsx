import { Link } from "react-router-dom";
import "../styles/inicio.css";
import Navbar from "../components/Navbar";

const benefits = [
  [
    "Catalogo que enamora",
    "Muestra tus productos en una tienda virtual personalizada, ordenada y lista para compartir.",
  ],
  [
    "Todo bajo control",
    "Gestiona productos, precios, tallas, colores, colecciones e inventario desde un solo lugar.",
  ],
  [
    "Compra sin esperar",
    "Tus clientes ven la informacion, agregan al carrito y hacen su pedido sin depender de mensajes.",
  ],
];

function PaginaInicio() {
  return (
    <>
      <Navbar id={1} />
      <section className="hero">
        <span className="hero-orb hero-orb--one" aria-hidden="true" />
        <span className="hero-orb hero-orb--two" aria-hidden="true" />
        <span className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">{"E-commerce para pequeñas tiendas"}</p>
          <h1>
            {"Vende mas facil."}
            <br />
            <span>Haz crecer tu tienda.</span>
          </h1>
          <p className="hero-description">
            {
              "NWBIQShop convierte tu negocio en una experiencia de compra moderna: un catalogo virtual personalizable, organizado y disponible para tus clientes cuando lo necesiten."
            }
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/registro">
              Comenzar ahora
            </Link>
            <a className="button button--outline" href="#como-funciona">
              {"Conocer mas"}
            </a>
          </div>
          <p className="hero-note">
            Sin suscripciones. Crea tu cuenta totalmente gratis.
          </p>
        </div>
        <div className="hero-visual">
          <div className="floating-tag floating-tag--sales">
            <span>&uarr;</span>
            <div>
              <strong>+34%</strong>
              <small>Ventas este mes</small>
            </div>
          </div>
          <div className="hero-card" aria-label={"Vista previa de catalogo"}>
            <div className="catalog-top">
              <span>
                <i /> Mi Tienda
              </span>
              <span>Carrito &middot; 2</span>
            </div>
            <div className="catalog-image">
              <span className="image-shape image-shape--one" />
              <span className="image-shape image-shape--two" />
              NUEVA
              <br />
              {"COLECCIÓN"}
            </div>
            <div className="catalog-info">
              <strong>Tu producto favorito</strong>
              <span>$ 89.900</span>
              <button>Agregar al carrito</button>
            </div>
          </div>
          <div className="floating-tag floating-tag--order">
            <span className="check">&#10003;</span>
            <div>
              <strong>Pedido recibido</strong>
              <small>Hace un momento</small>
            </div>
          </div>
        </div>
      </section>
      <section
        className="proof-strip"
        aria-label={"Características principales"}
      >
        <p>
          <span className="proof-icon">&#9672;</span>{" "}
          {"Catálogo personalizable"}
        </p>
        <p>
          <span className="proof-icon">&#9673;</span> {"Gestión de inventario"}
        </p>
        <p>
          <span className="proof-icon">&#10003;</span> Sin suscripciones
        </p>
      </section>
      <section className="section intro" id="beneficios">
        <p className="eyebrow">{"Más que una tienda en línea"}</p>
        <h2>{"Sabemos lo difícil que es vender por mensajes."}</h2>
        <p>
          {
            "Responder precios, confirmar tallas, enviar fotos y esperar cada respuesta puede hacer que una venta se enfr\u00ede. Creamos NWBIQShop para que tu negocio siga vendiendo, incluso cuando t\u00fa est\u00e1s ocupada."
          }
        </p>
        <div className="benefit-grid">
          {benefits.map(([title, description], index) => (
            <article className="benefit-card" key={title}>
              <span
                className={`benefit-icon benefit-icon--${index + 1}`}
                aria-hidden="true"
              />
              <span className="benefit-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section steps" id="como-funciona">
        <div>
          <p className="eyebrow">{"Simple desde el primer d\u00eda"}</p>
          <h2>Tu tienda lista en pocos pasos.</h2>
        </div>
        <ol>
          <li>
            <strong>Crea tu cuenta gratis.</strong>
            <span>No hay suscripciones ni costos para empezar.</span>
          </li>
          <li>
            <strong>Sube y organiza tus productos.</strong>
            <span>Agrega fotos, tallas, colores, precios y colecciones.</span>
          </li>
          <li>
            <strong>Personaliza y comparte.</strong>
            <span>
              {
                "Dale tu estilo a la tienda y env\u00eda tu cat\u00e1logo a tus clientes."
              }
            </span>
          </li>
          <li>
            <strong>Recibe pedidos sin complicaciones.</strong>
            <span>
              {
                "Tus compradores llenan su carrito con toda la informaci\u00f3n clara."
              }
            </span>
          </li>
        </ol>
      </section>
      <section className="cta-section">
        <span className="cta-orb cta-orb--one" />
        <span className="cta-orb cta-orb--two" />
        <p className="eyebrow">Es el momento de vender diferente</p>
        <h2>Tu negocio merece una vitrina que nunca cierre.</h2>
        <p>
          Crea productos, arma colecciones, organiza tu tienda a tu gusto y
          vende virtualmente sin complicaciones.
        </p>
        <Link className="button button--cta" to="/registro">
          Crear mi cuenta gratis
        </Link>
      </section>
    </>
  );
}

export default PaginaInicio;
