import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerPedidosAlimentos,
  VerDetallePedidoAlimento,
  CambiarEstadoPedidoAlimento,
} from "../api/axios";
import "../styles/pedidos.css";

/* ══════════════════════════════════════════
   Constantes
══════════════════════════════════════════ */
const ESTADOS = [
  "en espera",
  "en preparación",
  "listo",
  "en camino",
  "entregado",
  "cancelado",
];

const ESTADO_META = {
  "en espera":     { cls: "ped-badge--proceso",    icon: "🕐" },
  "en preparación":{ cls: "ped-badge--proceso",    icon: "👨‍🍳" },
  "listo":         { cls: "ped-badge--confirmado", icon: "✅" },
  "en camino":     { cls: "ped-badge--enviado",    icon: "🛵" },
  "entregado":     { cls: "ped-badge--entregado",  icon: "🏠" },
  "cancelado":     { cls: "ped-badge--cancelado",  icon: "❌" },
};

// Estados que tienen barra de progreso (excluye cancelado)
const ESTADOS_PROGRESO = ESTADOS.filter((e) => e !== "cancelado");

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
function EstadoBadge({ estado }) {
  const meta = ESTADO_META[estado] ?? { cls: "ped-badge--proceso", icon: "🕐" };
  return (
    <span className={`ped-badge ${meta.cls}`}>
      {meta.icon} {estado}
    </span>
  );
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPrice(n) {
  if (!n && n !== 0) return "—";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

/** Limpia el número de teléfono para la URL de WhatsApp */
function limpiarTelefono(tel) {
  if (!tel) return "";
  // Quita todo menos dígitos, agrega 57 si no empieza por código de país
  const digitos = tel.replace(/\D/g, "");
  if (digitos.startsWith("57") && digitos.length >= 12) return digitos;
  return `57${digitos}`;
}

/**
 * Genera el mensaje de WhatsApp según el estado actual y el detalle del pedido.
 * Retorna null si no hay mensaje predeterminado para ese estado.
 */
function generarMensajeWA(estado, pedido, detalle) {
  const nombre = `${pedido.nombre} ${pedido.apellidos}`;
  const uid    = `#${pedido.id}`;
  const total  = formatPrice(pedido.total);

  if (estado === "en preparación") {
    const lineas = detalle
      .map((it) => `  • ${it.nombre ?? `Alimento #${it.alimento_id}`} x${it.cantidad}`)
      .join("\n");
    return (
      `¡Hola ${nombre}! 🎉\n` +
      `Tu pedido ${uid} ha sido *aceptado* y está en preparación.\n\n` +
      `📋 *Alimentos:*\n${lineas || "  (sin detalle)"}\n\n` +
      `💰 *Total:* ${total}\n\n` +
      `Te avisaremos cuando esté listo. ¡Gracias por tu pedido! 🍽️`
    );
  }

  if (estado === "listo") {
    return (
      `¡Hola ${nombre}! ✅\n` +
      `Tu pedido ${uid} ya está *listo*.\n\n` +
      (pedido.domicilio
        ? `🛵 En breve saldrá a domicilio a: ${pedido.direccion ?? "tu dirección"}.\n`
        : `🏪 Puedes pasar a recogerlo.\n`) +
      `\n¡Gracias por elegirnos! 😊`
    );
  }

  if (estado === "en camino") {
    return (
      `¡Hola ${nombre}! 🛵\n` +
      `Tu pedido ${uid} está *en camino*.\n` +
      `📍 Lo llevamos a: ${pedido.direccion ?? "tu dirección"}.\n\n` +
      `¡Ya casi llega! 🎉`
    );
  }

  if (estado === "entregado") {
    return (
      `¡Hola ${nombre}! 🏠\n` +
      `Tu pedido ${uid} fue *entregado*. ¡Esperamos que lo disfrutes!\n\n` +
      `Si tienes alguna duda, escríbenos. 😊`
    );
  }

  if (estado === "cancelado") {
    return (
      `¡Hola ${nombre}! ℹ️\n` +
      `Lamentablemente tu pedido ${uid} fue *cancelado*.\n` +
      `Si tienes preguntas, no dudes en contactarnos.`
    );
  }

  return null; // "en espera" no tiene mensaje predeterminado
}

/* ══════════════════════════════════════════
   Botón WhatsApp
══════════════════════════════════════════ */
function BtnWhatsApp({ telefono, mensaje, disabled }) {
  const tel = limpiarTelefono(telefono);

  const abrir = () => {
    if (!tel) {
      mostrarAlerta("warning", "Este pedido no tiene número de teléfono registrado.");
      return;
    }
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(mensaje ?? "")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      className="ped-btn-wa"
      onClick={abrir}
      disabled={disabled}
      title={disabled ? "No hay mensaje predeterminado para este estado" : "Notificar por WhatsApp"}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.58A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zm-8.52 18.4a9.9 9.9 0 0 1-5.03-1.37l-.36-.21-3.67.94.98-3.58-.23-.37A9.93 9.93 0 0 1 2.07 12C2.07 6.51 6.51 2.07 12 2.07c2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.92 7.03c0 5.49-4.44 9.88-9.93 9.88zm5.45-7.4c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a8.14 8.14 0 0 1-2.39-1.47 9 9 0 0 1-1.65-2.06c-.17-.3 0-.46.13-.6s.3-.35.44-.52.2-.3.3-.5.05-.37-.02-.52-.67-1.62-.92-2.22c-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42s.25-1.3.17-1.42-.27-.2-.57-.35z"/>
      </svg>
      Notificar
    </button>
  );
}

/* ══════════════════════════════════════════
   Modal detalle del pedido
══════════════════════════════════════════ */
function ModalDetalle({ pedido, userId, onClose, onEstadoCambiado }) {
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado,  setEstado]  = useState(pedido.estado);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { cargarDetalle(); }, []);

  const cargarDetalle = async () => {
    setLoading(true);
    try {
      const res = await VerDetallePedidoAlimento({ id_usuario: userId, pedido_id: pedido.id });
      setDetalle(res.data?.items ?? []);
    } catch {
      mostrarAlerta("error", "Error al cargar el detalle del pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEstado = async () => {
    if (estado === pedido.estado) return;
    setSaving(true);
    try {
      await CambiarEstadoPedidoAlimento({ id_usuario: userId, pedido_id: pedido.id, estado });
      mostrarAlerta("success", `Pedido marcado como "${estado}" ✓`);
      onEstadoCambiado();
      onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al cambiar el estado");
    } finally {
      setSaving(false);
    }
  };

  const pasoActual = ESTADOS_PROGRESO.indexOf(estado);
  const mensajeWA  = generarMensajeWA(estado, pedido, detalle);

  return (
    <div className="ped-overlay" onClick={onClose}>
      <div className="ped-modal" onClick={(e) => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="ped-modal__header">
          <div className="ped-modal__header-left">
            <div className="ped-modal__icon">🍽️</div>
            <div>
              <p className="ped-modal__eyebrow">Detalle del pedido</p>
              <h2 className="ped-modal__title">Pedido #{pedido.id}</h2>
              <div className="ped-modal__meta">
                <EstadoBadge estado={pedido.estado} />
                <span className="ped-modal__email">
                  📞 {pedido.telefono}
                </span>
                <span className="ped-modal__date">{formatDate(pedido.fecha_creacion)}</span>
              </div>
            </div>
          </div>
          <button className="ped-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="ped-modal__body">

          {/* Info del cliente */}
          <div className="peda-cliente-card">
            <div className="peda-cliente-card__row">
              <span>👤</span>
              <strong>{pedido.nombre} {pedido.apellidos}</strong>
            </div>
            <div className="peda-cliente-card__row">
              <span>📞</span>
              <span>{pedido.telefono}</span>
            </div>
            {pedido.domicilio && (
              <div className="peda-cliente-card__row">
                <span>📍</span>
                <span>{pedido.direccion ?? "Sin dirección registrada"}</span>
              </div>
            )}
            <div className="peda-cliente-card__row">
              <span>{pedido.domicilio ? "🛵 Domicilio" : "🏪 Recoge en tienda"}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="ped-progress">
            {ESTADOS_PROGRESO.map((e, i) => {
              const isDone   = pasoActual > i;
              const isActive = estado === e;
              return (
                <div
                  key={e}
                  className={`ped-progress__step ${isActive ? "ped-progress__step--active" : isDone ? "ped-progress__step--done" : ""}`}
                >
                  <div className="ped-progress__dot">{ESTADO_META[e]?.icon}</div>
                  <span>{e}</span>
                </div>
              );
            })}
          </div>

          {/* Productos del pedido */}
          <div className="ped-section-label">Alimentos en este pedido</div>

          {loading ? (
            <div className="ped-loading-sm">
              <div className="ped-loading__spinner" />
              <span>Cargando…</span>
            </div>
          ) : detalle.length === 0 ? (
            <p className="ped-empty-hint">Este pedido no tiene alimentos registrados.</p>
          ) : (
            <ul className="ped-product-list">
              {detalle.map((item) => (
                <li key={item.id} className="ped-product-row">
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="peda-item-img"
                    />
                  ) : (
                    <div
                      className="ped-product-row__thumb"
                      style={{ "--hue": (item.alimento_id * 61) % 360 }}
                    >
                      {(item.nombre ?? "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="peda-item-info">
                    <span className="ped-product-row__name">{item.nombre ?? `Alimento #${item.alimento_id}`}</span>
                    <span className="peda-item-qty">x{item.cantidad}</span>
                  </div>
                  <div className="peda-item-prices">
                    <span className="peda-item-unit">{formatPrice(item.precio_unitario)} c/u</span>
                    <span className="ped-product-row__price">{formatPrice(item.subtotal)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Total */}
          <div className="ped-total">
            <span>Total del pedido</span>
            <strong>{formatPrice(pedido.total)}</strong>
          </div>

          {/* Cambiar estado */}
          <div className="ped-estado-section">
            <p className="ped-section-label">Cambiar estado</p>
            <div className="ped-estado-grid">
              {ESTADOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`ped-estado-chip ${estado === e ? "ped-estado-chip--on" : ""}`}
                  onClick={() => setEstado(e)}
                >
                  {ESTADO_META[e]?.icon} {e}
                </button>
              ))}
            </div>

            {/* Mensaje predeterminado preview */}
            {mensajeWA && estado !== pedido.estado && (
              <div className="peda-wa-preview">
                <p className="peda-wa-preview__label">📋 Mensaje que se enviará:</p>
                <pre className="peda-wa-preview__text">{mensajeWA}</pre>
              </div>
            )}

            <div className="ped-modal__actions">
              {/* Botón WhatsApp — habilitado si hay mensaje predeterminado */}
              <BtnWhatsApp
                telefono={pedido.telefono}
                mensaje={mensajeWA ?? `Hola ${pedido.nombre}, tu pedido #${pedido.id} está: ${estado}.`}
                disabled={false}
              />
              <button className="ped-btn ped-btn--ghost" onClick={onClose}>
                Cerrar
              </button>
              <button
                className="ped-btn ped-btn--primary"
                disabled={saving || estado === pedido.estado}
                onClick={handleGuardarEstado}
              >
                {saving ? "Guardando…" : "Guardar estado ✓"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaPedidosAlimentos() {
  const navigate = useNavigate();
  const [username,  setUsername]  = useState("");
  const [userId,    setUserId]    = useState(null);
  const [pedidos,   setPedidos]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterEst, setFilterEst] = useState("Todos");
  const [modal,     setModal]     = useState(null);

  /* ── Auth + carga ── */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const decode = jwtDecode(token);
    setUsername(decode.usuario?.split(" ")[0] ?? "Usuario");
    setUserId(decode.id);
    cargar(decode.id);
  }, []);

  const cargar = async (id) => {
    setLoading(true);
    try {
      const res = await TraerPedidosAlimentos(id);
      setPedidos(res.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.detail;
      mostrarAlerta("error", msg ?? "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const reload = () => cargar(userId);

  /* Filtrado */
  const filtered = pedidos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      String(p.id).includes(q) ||
      `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q) ||
      (p.telefono ?? "").includes(q);
    const matchEst = filterEst === "Todos" || p.estado === filterEst;
    return matchSearch && matchEst;
  });

  /* Stats */
  const enEspera    = pedidos.filter((p) => p.estado === "en espera").length;
  const enPrep      = pedidos.filter((p) => p.estado === "en preparación").length;
  const listos      = pedidos.filter((p) => p.estado === "listo").length;
  const entregados  = pedidos.filter((p) => p.estado === "entregado").length;
  const cancelados  = pedidos.filter((p) => p.estado === "cancelado").length;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="ped-page">
        <span className="ped-orb ped-orb--one" aria-hidden="true" />
        <span className="ped-orb ped-orb--two" aria-hidden="true" />

        {/* Encabezado */}
        <header className="ped-header">
          <div>
            <p className="ped-eyebrow">🍽️ Restaurante</p>
            <h1 className="ped-title">Pedidos de <span>Alimentos</span></h1>
            <p className="ped-subtitle">
              Gestiona y actualiza el estado de los pedidos de tu menú.
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className="ped-stats">
          {[
            { val: pedidos.length, label: "Total",        cls: "" },
            { val: enEspera,       label: "En espera",    cls: "ped-stat--yellow" },
            { val: enPrep,         label: "Preparando",   cls: "ped-stat--blue" },
            { val: listos,         label: "Listos",       cls: "ped-stat--green" },
            { val: entregados,     label: "Entregados",   cls: "ped-stat--green" },
            { val: cancelados,     label: "Cancelados",   cls: "ped-stat--red" },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`ped-stat-pill ${cls}`}>
              <span className="ped-stat-pill__val">{loading ? "—" : val}</span>
              <span className="ped-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="ped-toolbar">
          <div className="ped-search">
            <span className="ped-search__icon">🔍</span>
            <input
              placeholder="Buscar por # pedido, nombre o teléfono…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ped-search__clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="ped-filters">
            <select value={filterEst} onChange={(e) => setFilterEst(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="ped-loading">
            <div className="ped-loading__spinner" />
            <p>Cargando pedidos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ped-empty">
            <span className="ped-empty__icon">{pedidos.length === 0 ? "🍽️" : "🔎"}</span>
            <p>
              {pedidos.length === 0
                ? "Aún no tienes pedidos de alimentos."
                : "No se encontraron pedidos con esos filtros."}
            </p>
            {pedidos.length > 0 && (
              <button
                className="ped-btn ped-btn--ghost"
                onClick={() => { setSearch(""); setFilterEst("Todos"); }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="ped-table-wrap">
            <table className="ped-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Domicilio</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ped, i) => (
                  <tr
                    key={ped.id}
                    className="ped-table__row ped-table__row--clickable"
                    onClick={() => setModal(ped)}
                    title="Clic para ver detalle"
                  >
                    <td className="ped-table__num">{i + 1}</td>
                    <td><span className="ped-table__id">#{ped.id}</span></td>
                    <td className="ped-table__email">
                      {ped.nombre} {ped.apellidos}
                    </td>
                    <td className="ped-table__email">📞 {ped.telefono}</td>
                    <td>
                      <span className={`ped-badge ${ped.domicilio ? "ped-badge--enviado" : "ped-badge--proceso"}`}>
                        {ped.domicilio ? "🛵 Sí" : "🏪 No"}
                      </span>
                    </td>
                    <td><EstadoBadge estado={ped.estado} /></td>
                    <td className="ped-table__total">{formatPrice(ped.total)}</td>
                    <td className="ped-table__date">{formatDate(ped.fecha_creacion)}</td>
                    <td>
                      <button
                        className="ped-icon-btn"
                        title="Ver detalle"
                        onClick={(e) => { e.stopPropagation(); setModal(ped); }}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <p className="ped-count">
            Mostrando <strong>{filtered.length}</strong> de{" "}
            <strong>{pedidos.length}</strong> pedidos
          </p>
        )}
      </div>

      {/* Modal detalle */}
      {modal && (
        <ModalDetalle
          pedido={modal}
          userId={userId}
          onClose={() => setModal(null)}
          onEstadoCambiado={reload}
        />
      )}
    </>
  );
}

export default PaginaPedidosAlimentos;
