import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { jwtDecode } from "jwt-decode";
import { TraerTienda } from "../api/axios";
import { mostrarAlerta } from "../utils/alerts";
import { useNavigate } from "react-router-dom";

/* ── Secciones del panel ── */

const SECTIONS = [
  {
    id: "productos",
    icon: "📦",
    color: "#2259d7",
    bg: "#eef3ff",
    title: "Gestión de Productos",
    description:
      "Agrega, edita y elimina los productos de tu catálogo. Controla precios, tallas, colores y fotos.",
    tag: "Catálogo",
    stat: "24 productos",
    nav: "/dashboard/productos",
  },
  {
    id: "inventario",
    icon: "🗂️",
    color: "#0f7c5b",
    bg: "#e8faf4",
    title: "Gestión de Inventario",
    description:
      "Consulta el stock disponible, recibe alertas de agotamiento y actualiza cantidades fácilmente.",
    tag: "Stock",
    stat: "3 alertas",
    nav: "/dashboard/inventario",
  },
  {
    id: "colecciones",
    icon: "🗃️",
    color: "#7c3aed",
    bg: "#f3eeff",
    title: "Colecciones",
    description:
      "Agrupa tus productos en colecciones temáticas para que tus clientes encuentren lo que buscan.",
    tag: "Organización",
    stat: "5 colecciones",
    nav: "/dashboard/colecciones",
  },
  {
    id: "estilos",
    icon: "🎨",
    color: "#c0392b",
    bg: "#fff0ef",
    title: "Estilos de la Tienda",
    description:
      "Personaliza colores, tipografía, banner y el aspecto general de tu vitrina online.",
    tag: "Diseño",
    stat: "1 tema activo",
    nav: "/dashboard/estilos",
  },
  {
    id: "opciones",
    icon: "⚙️",
    color: "#475569",
    bg: "#f1f5f9",
    title: "Opciones",
    description:
      "Configura los datos de tu tienda, métodos de contacto, redes sociales y más ajustes generales.",
    tag: "Config",
    stat: "",
    nav: "/dashboard/opciones",
  },
  {
    id: "promociones",
    icon: "🔥",
    color: "#bd0065",
    bg: "#ffe6f3",
    title: "Promociones",
    description: "Gestiona las promociones y descuentos de tu tienda.",
    tag: "prom",
    stat: "",
    nav: "/dashboard/promociones",
  },
  {
    id: "pedidos",
    icon: "🚚",
    color: "#9700bd",
    bg: "#fde6ff",
    title: "Pedidos",
    description: "Mira los pedidos que te hicieron en tu tienda.",
    tag: "ped",
    stat: "3 pedidos",
    nav: "/dashboard/pedidos",
  },
];

/* ── Actividad reciente (placeholder) ── */
const ACTIVITY = [
  {
    icon: "✦",
    text: 'Producto "Camiseta azul" actualizado',
    time: "Hace 5 min",
  },
  { icon: "✦", text: "Nuevo pedido recibido #0042", time: "Hace 22 min" },
  { icon: "✦", text: 'Colección "Verano 2026" creada', time: "Hace 1 h" },
  { icon: "✦", text: 'Stock de "Pantalón negro" en 0', time: "Hace 3 h" },
];

function StatCard({ label, value, accent }) {
  return (
    <div className="db-stat-card" style={{ "--accent": accent }}>
      <span className="db-stat-card__value">{value}</span>
      <span className="db-stat-card__label">{label}</span>
    </div>
  );
}

function SectionCard({ icon, color, bg, title, description, tag, stat, nav }) {
  const navigate = useNavigate();
  return (
    <article
      className="db-section-card"
      style={{ "--card-color": color, "--card-bg": bg }}
      onClick={() => navigate(nav)}
    >
      <div className="db-section-card__icon-wrap">
        <span className="db-section-card__icon">{icon}</span>
      </div>
      <div className="db-section-card__body">
        <div className="db-section-card__meta">
          <span className="db-section-card__tag">{tag}</span>
          {stat && <span className="db-section-card__stat">{stat}</span>}
        </div>
        <h3 className="db-section-card__title">{title}</h3>
        <p className="db-section-card__desc">{description}</p>
      </div>
      <button className="db-section-card__btn" onClick={() => navigate(nav)}>
        Abrir <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

function PaginaDashboard() {
  const [nameuser, setnameuser] = useState("User");
  const [firstnameuser, setfirstnameuser] = useState("User");
  const [dominio, setdominio] = useState("tu-tienda");
  const [nametienda, setnametienda] = useState("tu tienda");
  const [estado, setestado] = useState(false);
  const navigate = useNavigate();
  const STORE_URL = `http://localhost:8000/tienda/${dominio}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(STORE_URL);
    mostrarAlerta("success", "URL de tu tienda copiada");
  };

  const traerdatostienda = async (user) => {
    try {
      const res = await TraerTienda(user);
      setdominio(res.data?.dominio || "tu-tienda");
      setestado(res.data?.estado || false);
      setnametienda(res.data?.nombre || "tu tienda");
    } catch (err) {
      mostrarAlerta(
        "error",
        "error trayendo los datos de tu tienda inicia sesion nuevamente",
      );
    }
  };
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const decode = jwtDecode(token);
    setnameuser(decode.usuario || "User");
    const primernombre = decode.usuario.split(" ")[0] || "User";
    setfirstnameuser(primernombre);
    traerdatostienda(decode.id);
  }, []);
  return (
    <>
      <Navbar id={3} userName={firstnameuser} />

      <div className="db-page">
        {/* Orbes decorativos de fondo */}
        <span className="db-orb db-orb--one" aria-hidden="true" />
        <span className="db-orb db-orb--two" aria-hidden="true" />
        <span className="db-orb db-orb--three" aria-hidden="true" />

        {/* ── Hero del dashboard ── */}
        <header className="db-hero">
          <div className="db-hero__content">
            <p className="db-hero__eyebrow">Panel de control</p>
            <h1 className="db-hero__title">
              Hola, <span>{nameuser}</span> 👋
            </h1>
            <p className="db-hero__sub">
              Todo lo que necesitas para gestionar tu tienda en un solo lugar.
            </p>
          </div>

          {/* Estadísticas rápidas */}
          <div className="db-stats-row">
            <StatCard label="Productos" value="24" accent="#2259d7" />
            <StatCard label="Pedidos hoy" value="3" accent="#0f7c5b" />
            <StatCard label="Visitas" value="128" accent="#7c3aed" />
            <StatCard label="Stock bajo" value="3" accent="#c0392b" />
          </div>
        </header>

        {/* ── URL de la tienda ── */}
        <section className="db-url-banner" aria-label="URL de tu tienda">
          <div className="db-url-banner__left">
            {estado ? (
              <>
                <span className="db-url-banner__dot" />
                <div>
                  <p className="db-url-banner__label">Tu tienda está activa</p>
                  <span className="db-url-banner__url">{STORE_URL}</span>
                </div>
              </>
            ) : (
              <>
                <span className="db-url-banner__dot-inactivo" />
                <div>
                  <p className="db-url-banner__label-inactivo">
                    Tu tienda está inactiva
                  </p>
                  <span className="db-url-banner__url-inactivo">
                    {STORE_URL}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="db-url-banner__actions">
            <button
              className="db-url-copy"
              onClick={copyUrl}
              title="Copiar URL"
              disabled={!estado}
            >
              <span>⧉</span> Copiar
            </button>
            <button
              className="db-url-visit"
              disabled={!estado}
              onClick={() => navigate(`/tienda/${dominio}`)}
            >
              Visitar <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>

        {/* ── Nombre de la tienda ── */}
        <section className="db-store-header">
          <div className="db-store-header__icon">🏪</div>
          <div>
            <p className="db-store-header__label">Tu tienda</p>
            <h2 className="db-store-header__name">{nametienda}</h2>
          </div>
          {estado ? (
            <div className="db-store-header__badge">Activa</div>
          ) : (
            <div className="db-store-header__badge-inactiva">Inactiva</div>
          )}
        </section>

        {/* ── Tarjetas de secciones ── */}
        <section className="db-sections" aria-label="Secciones del panel">
          <div className="db-sections__grid">
            {SECTIONS.map((s) => (
              <SectionCard key={s.id} {...s} />
            ))}
          </div>
        </section>

        {/* ── Actividad reciente ── */}
        <section className="db-activity" aria-label="Actividad reciente">
          <h2 className="db-activity__title">Actividad reciente</h2>
          <ul className="db-activity__list">
            {ACTIVITY.map((item, i) => (
              <li key={i} className="db-activity__item">
                <span className="db-activity__bullet">{item.icon}</span>
                <span className="db-activity__text">{item.text}</span>
                <span className="db-activity__time">{item.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default PaginaDashboard;
