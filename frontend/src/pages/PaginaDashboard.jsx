import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { jwtDecode } from "jwt-decode";
import {
  CantidadPedidos,
  CantidadProductos,
  TraerInformacion,
  TraerNotificaciones,
  TraerTienda,
  VerificarPago,
} from "../api/axios";
import { mostrarAlerta } from "../utils/alerts";
import { useNavigate } from "react-router-dom";
import ModalSuscripcion from "../components/ModalSuscripcion";

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
    stat: "",
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
    stat: "",
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
    stat: "",
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
    stat: "",
    nav: "/dashboard/pedidos",
  },
  {
    id: "inf",
    icon: "📖",
    color: "#00a4bd",
    bg: "#e6fbff",
    title: "Tu informacion",
    description:
      "¿Quieres compartir informacion de lo que haces con los demas? añade aqui esa informacion y compartela con quien tu quieras.",
    tag: "inf",
    stat: "",
    nav: "/dashboard/informacion",
  },
];

const SECTIONSFOOT = [
  {
    id: "alimentos",
    icon: "🍽️",
    color: "#e85d04",
    bg: "#fff1e6",
    title: "Menú y Alimentos",
    description:
      "Crea y administra los alimentos de tu menú. Define precios, fotografías y toda la información que tus clientes necesitan para elegir.",
    tag: "Menú",
    stat: "",
    nav: "/dashboard/alimentos",
  },

  {
    id: "colecciones",
    icon: "🍱",
    color: "#c2410c",
    bg: "#fff3e8",
    title: "Categorías y Colecciones",
    description:
      "Organiza tu menú en categorías para que tus clientes encuentren fácilmente entradas, platos fuertes, bebidas, postres y más.",
    tag: "Organización",
    stat: "",
    nav: "/dashboard/colecciones-alimentos",
  },

  {
    id: "estilos",
    icon: "🎨",
    color: "#d97706",
    bg: "#fff8e7",
    title: "Estilo de tu Menú",
    description:
      "Personaliza los colores, tipografías, banners y apariencia de tu tienda para crear una experiencia que represente tu negocio.",
    tag: "Diseño",
    stat: "1 tema activo",
    nav: "/dashboard/estilos",
  },

  {
    id: "pedidos",
    icon: "🛵",
    color: "#dc2626",
    bg: "#fff0f0",
    title: "Pedidos",
    description:
      "Consulta y administra los pedidos de tus clientes. Mantente al tanto de cada solicitud y conoce su estado en todo momento.",
    tag: "Pedidos",
    stat: "",
    nav: "/dashboard/pedidos-alimentos",
  },

  {
    id: "combos",
    icon: "🍔",
    color: "#7c3aed",
    bg: "#f3edff",
    title: "Combos y Promociones",
    description:
      "Crea combinaciones especiales de alimentos y ofrece opciones atractivas para aumentar el valor de cada pedido.",
    tag: "Combos",
    stat: "",
    nav: "/dashboard/combos",
  },

  {
    id: "opciones",
    icon: "⚙️",
    color: "#475569",
    bg: "#f1f5f9",
    title: "Opciones",
    description:
      "Configura la información de tu negocio, métodos de contacto, redes sociales y otros aspectos de tu tienda.",
    tag: "Configuración",
    stat: "",
    nav: "/dashboard/opciones",
  },
];

function formatNotificationDate(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  const [actividadtienda, setactividadtienda] = useState("");
  const [cantidad1, setcantidad1] = useState(0);
  const [cantidad2, setcantidad2] = useState(0);
  const PUBLIC_URL = "https://nwbiqshop.nwbiq.com";
  const STORE_URL = `${PUBLIC_URL}/tienda/${dominio}`;
  const INF_URL = `${PUBLIC_URL}/informacion/${dominio}`;
  const [tuinfo, settuinfo] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(true);
  const [pago, setpago] = useState(true);
  const [modalSuscripcion, setModalSuscripcion] = useState(false);

  const CantidadPro = async (id_usuario) => {
    try {
      const res = await CantidadProductos(id_usuario);
      const res2 = await CantidadPedidos(id_usuario);
      const res3 = await VerificarPago(id_usuario);
      setpago(res3.data);
      setModalSuscripcion(!res3.data);
      setcantidad1(res.data);
      setcantidad2(res2.data);
    } catch {
      mostrarAlerta("error no se pudo traer el filtro 1");
    }
  };

  const copyUrl = (id) => {
    if (id == 1) {
      navigator.clipboard.writeText(STORE_URL);
      mostrarAlerta("success", "URL de tu tienda copiada");
    } else {
      navigator.clipboard.writeText(INF_URL);
      mostrarAlerta("success", "URL de tu informacion copiada");
    }
  };

  const traerdatostienda = async (user) => {
    try {
      const res = await TraerTienda(user);
      setdominio(res.data?.dominio || "tu-tienda");
      setestado(res.data?.estado || false);
      setnametienda(res.data?.nombre || "tu tienda");
      setactividadtienda(res.data?.actividad || "");
    } catch (err) {
      mostrarAlerta(
        "error",
        "error trayendo los datos de tu tienda inicia sesion nuevamente",
      );
    }
  };

  const Traertuinfo = async (user) => {
    try {
      const res = await TraerInformacion(user);
      settuinfo(res.data?.tu_informacion);
    } catch {
      mostrarAlerta("error", "no se pudo traer la informacion");
    }
  };

  const TraerActividad = async (user) => {
    try {
      const res = await TraerNotificaciones(user);
      setNotificaciones(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNotificaciones([]);
      mostrarAlerta("error", "no se pudo traer la actividad reciente");
    } finally {
      setCargandoNotificaciones(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const decode = jwtDecode(token);
    setnameuser(decode.usuario || "User");
    const primernombre = decode.usuario.split(" ")[0] || "User";
    setfirstnameuser(primernombre);
    traerdatostienda(decode.id);
    CantidadPro(decode.id);
    Traertuinfo(decode.id);
    TraerActividad(decode.id);
  }, []);

  return (
    <>
      <Navbar id={3} userName={firstnameuser} />

      {!pago && modalSuscripcion && (
        <ModalSuscripcion setmodal={setModalSuscripcion} />
      )}

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
            <StatCard label="Productos" value={cantidad1} accent="#2259d7" />
            <StatCard label="Pedidos hoy" value={cantidad2} accent="#0f7c5b" />
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
              onClick={() => copyUrl(1)}
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

        <section className="db-url-banner" aria-label="URL de tu tienda">
          <div className="db-url-banner__left">
            {tuinfo.estado ? (
              <>
                <span className="db-url-banner__dot" />
                <div>
                  <p className="db-url-banner__label">
                    Tu infomacion está activa
                  </p>
                  <span className="db-url-banner__url">{INF_URL}</span>
                </div>
              </>
            ) : (
              <>
                <span className="db-url-banner__dot-inactivo" />
                <div>
                  <p className="db-url-banner__label-inactivo">
                    Tu informacion está inactiva
                  </p>
                  <span className="db-url-banner__url-inactivo">{INF_URL}</span>
                </div>
              </>
            )}
          </div>
          <div className="db-url-banner__actions">
            <button
              className="db-url-copy"
              onClick={() => copyUrl(2)}
              title="Copiar URL"
              disabled={!estado}
            >
              <span>⧉</span> Copiar
            </button>
            <button
              className="db-url-visit"
              disabled={!estado}
              onClick={() => navigate(`/informacion/${dominio}`)}
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

        {actividadtienda == "Venta de alimentos" ? (
          <section className="db-sections" aria-label="Secciones del panel">
            <div className="db-sections__grid">
              {SECTIONSFOOT.map((s) => (
                <SectionCard key={s.id} {...s} />
              ))}
            </div>
          </section>
        ) : (
          <section className="db-sections" aria-label="Secciones del panel">
            <div className="db-sections__grid">
              {SECTIONS.map((s) => (
                <SectionCard key={s.id} {...s} />
              ))}
            </div>
          </section>
        )}

        {/* ── Actividad reciente ── */}
        <section className="db-activity" aria-label="Actividad reciente">
          <h2 className="db-activity__title">Actividad reciente</h2>
          {cargandoNotificaciones ? (
            <p className="db-activity__empty">Cargando actividad...</p>
          ) : notificaciones.length === 0 ? (
            <p className="db-activity__empty">Aún no hay actividad reciente.</p>
          ) : (
            <div className="db-activity__table-wrap">
              <table className="db-activity__table">
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Sección</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {notificaciones.map((notificacion) => (
                    <tr key={notificacion.id}>
                      <td>{notificacion.accion}</td>
                      <td>
                        <span className="db-activity__place">
                          {notificacion.lugar}
                        </span>
                      </td>
                      <td className="db-activity__time">
                        {formatNotificationDate(notificacion.fecha)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default PaginaDashboard;
