import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import Swal from "sweetalert2";
import {
  TraerPedidos,
  VerDetallePedido,
  CambiarEstadoPedido,
  AsignarNumeroGuia,
  TraerProductos,
} from "../api/axios";
import ModalInformacionInputs from "../components/InformacionInputs";
import "../styles/pedidos.css";

/* ══════════════════════════════════════════
   Constantes
══════════════════════════════════════════ */
const ESTADOS = [
  "pendiente",
  "confirmado",
  "enviado",
  "entregado",
  "cancelado",
];

const ESTADO_META = {
  pendiente: { cls: "ped-badge--proceso", icon: "🕐" },
  confirmado: { cls: "ped-badge--confirmado", icon: "✅" },
  enviado: { cls: "ped-badge--enviado", icon: "📦" },
  entregado: { cls: "ped-badge--entregado", icon: "🏠" },
  cancelado: { cls: "ped-badge--cancelado", icon: "❌" },
};

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
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(n) {
  if (!n && n !== 0) return "—";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

function InfoTrigger({ onClick }) {
  return (
    <button
      type="button"
      className="ped-info-trigger"
      onClick={onClick}
      aria-label="Ver información"
    >
      !
    </button>
  );
}

/* ══════════════════════════════════════════
   MODAL DETALLE DEL PEDIDO
══════════════════════════════════════════ */
function ModalDetalle({
  pedido,
  userId,
  productos,
  onClose,
  onEstadoCambiado,
}) {
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState(pedido.estado);
  const [numeroGuia, setNumeroGuia] = useState(pedido.numeroguia ?? "");
  const [guiaGuardada, setGuiaGuardada] = useState(pedido.numeroguia ?? "");
  const [saving, setSaving] = useState(false);
  const [savingGuia, setSavingGuia] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    cargarDetalle();
  }, []);

  const cargarDetalle = async () => {
    setLoading(true);
    try {
      const res = await VerDetallePedido({
        id_usuario: userId,
        id_pedido: pedido.id,
      });
      const rawDetalle = res?.data ?? [];
      const items = Array.isArray(rawDetalle)
        ? rawDetalle
        : Array.isArray(rawDetalle.productos)
          ? rawDetalle.productos
          : Array.isArray(rawDetalle.items)
            ? rawDetalle.items
            : [];
      setDetalle(items);
    } catch {
      mostrarAlerta("error", "Error al cargar el detalle del pedido");
    } finally {
      setLoading(false);
    }
  };

  const nombreProducto = (id) =>
    productos.find((p) => p.id === id)?.nombre ?? `Producto #${id}`;
  const precioProducto = (id) =>
    productos.find((p) => p.id === id)?.precio ?? null;

  const handleGuardarEstado = async () => {
    if (estado === pedido.estado) return;

    if (estado === "cancelado") {
      const resultado = await Swal.fire({
        title: "¿Cancelar pedido?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      });

      if (!resultado.isConfirmed) {
        return;
      }
    }

    setSaving(true);

    try {
      await CambiarEstadoPedido({
        id_usuario: userId,
        id_pedido: pedido.id,
        estado,
      });

      mostrarAlerta("success", `Pedido marcado como "${estado}"`);
      onEstadoCambiado();
      onClose();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al cambiar estado",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarGuia = async () => {
    const guia = numeroGuia.trim();
    if (!guia) {
      mostrarAlerta("warning", "Ingresa un número de guía");
      return;
    }

    setSavingGuia(true);
    try {
      await AsignarNumeroGuia({
        id_usuario: userId,
        id_pedido: pedido.id,
        numeroguia: guia,
      });
      mostrarAlerta("success", "Número de guía guardado correctamente");
      setNumeroGuia(guia);
      setGuiaGuardada(guia);
      onEstadoCambiado();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al guardar el número de guía",
      );
    } finally {
      setSavingGuia(false);
    }
  };

  const pasoActual = ESTADOS.indexOf(estado);

  return (
    <div className="ped-overlay" onClick={onClose}>
      <div className="ped-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="ped-modal__header">
          <div className="ped-modal__header-left">
            <div className="ped-modal__icon">🚚</div>
            <div>
              <p className="ped-modal__eyebrow">Detalle del pedido</p>
              <h2 className="ped-modal__title">Pedido #{pedido.id}</h2>
              <div className="ped-modal__meta">
                <EstadoBadge estado={pedido.estado} />
                {pedido.correocliente && (
                  <span className="ped-modal__email">
                    ✉️ {pedido.correocliente}
                  </span>
                )}
                <span className="ped-modal__date">
                  {formatDate(pedido.fecha_creacion)}
                </span>
              </div>
            </div>
          </div>
          <button className="ped-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ped-modal__body">
          {/* Progreso visual */}
          <div className="ped-progress">
            {ESTADOS.filter((e) => e !== "cancelado").map((e, i) => {
              const idx = ESTADOS.filter((x) => x !== "cancelado").indexOf(e);
              const done = pasoActual > i || estado === e;
              return (
                <div
                  key={e}
                  className={`ped-progress__step ${estado === e ? "ped-progress__step--active" : done ? "ped-progress__step--done" : ""}`}
                >
                  <div className="ped-progress__dot">
                    {ESTADO_META[e]?.icon}
                  </div>
                  <span>{e}</span>
                </div>
              );
            })}
          </div>

          {/* Productos del pedido */}
          <div className="ped-section-label">
            Productos en este pedido
            <InfoTrigger
              onClick={() =>
                setInfo(
                  "Aquí puedes revisar los productos, cantidades y precios registrados en el pedido antes de actualizar su estado.",
                )
              }
            />
          </div>
          {loading ? (
            <div className="ped-loading-sm">
              <div className="ped-loading__spinner" />
              <span>Cargando…</span>
            </div>
          ) : detalle.length === 0 ? (
            <p className="ped-empty-hint">
              Este pedido no tiene productos registrados.
            </p>
          ) : (
            <ul className="ped-product-list">
              {detalle.map((rel) => (
                <li key={rel.linea_id ?? rel.id} className="ped-product-row">
                  <div
                    className="ped-product-row__thumb"
                    style={{ "--hue": (rel.producto_id * 57) % 360 }}
                  >
                    {nombreProducto(rel.producto_id)[0]?.toUpperCase()}
                  </div>
                  <span className="ped-product-row__name">
                    {nombreProducto(rel.producto_id)} · {rel.cantidad} uds.
                  </span>
                  <span className="ped-product-row__price">
                    {formatPrice(precioProducto(rel.producto_id))}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Total */}
          {pedido.totalcompra > 0 && (
            <div className="ped-total">
              <span>
                Total del pedido
                <InfoTrigger
                  onClick={() =>
                    setInfo(
                      "Este es el valor total registrado para el pedido, según los productos y cantidades solicitados por el cliente.",
                    )
                  }
                />
              </span>
              <strong>{formatPrice(pedido.totalcompra)}</strong>
            </div>
          )}

          <div className="ped-guia-section">
            <label className="ped-section-label" htmlFor={`guia-${pedido.id}`}>
              Número de guía
              <InfoTrigger
                onClick={() =>
                  setInfo(
                    "Escribe el número de seguimiento entregado por la transportadora. El cliente podrá verlo al consultar su pedido.",
                  )
                }
              />
            </label>
            <div className="ped-guia-form">
              <input
                id={`guia-${pedido.id}`}
                type="text"
                value={numeroGuia}
                onChange={(e) => setNumeroGuia(e.target.value)}
                placeholder="Ej. 123456789"
                maxLength={300}
              />
              <button
                type="button"
                className="ped-btn ped-btn--primary"
                disabled={savingGuia || numeroGuia.trim() === guiaGuardada}
                onClick={handleGuardarGuia}
              >
                {savingGuia
                  ? "Guardando…"
                  : guiaGuardada
                    ? "Actualizar guía"
                    : "Asignar guía"}
              </button>
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="ped-estado-section">
            <p className="ped-section-label">
              Cambiar estado del pedido
              <InfoTrigger
                onClick={() =>
                  setInfo(
                    "Actualiza el estado conforme avance el pedido. Al marcarlo como cancelado se solicitará una confirmación adicional.",
                  )
                }
              />
            </p>
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
            <div className="ped-modal__actions">
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
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaPedidos() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEst, setFilterEst] = useState("Todos");
  const [modal, setModal] = useState(null); // pedido seleccionado

  /* ── Auth + carga ── */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const decode = jwtDecode(token);
    setUsername(decode.usuario?.split(" ")[0] ?? "Usuario");
    setUserId(decode.id);
    cargar(decode.id);
  }, []);

  const cargar = async (id) => {
    setLoading(true);
    try {
      const [pedRes, prodRes] = await Promise.all([
        TraerPedidos(id),
        TraerProductos(id),
      ]);
      /* Ordenar por fecha desc (más recientes primero) */
      const sorted = [...pedRes.data].sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion),
      );
      setPedidos(sorted);
      setProductos(prodRes.data);
    } catch {
      mostrarAlerta("error", "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const reload = () => cargar(userId);

  /* Filtrado */
  const filtered = pedidos.filter((p) => {
    const matchSearch =
      String(p.id).includes(search) ||
      (p.correocliente ?? "").toLowerCase().includes(search.toLowerCase());
    const matchEst = filterEst === "Todos" || p.estado === filterEst;
    return matchSearch && matchEst;
  });

  /* Stats */
  const enProceso = pedidos.filter((p) => p.estado === "pendiente").length;
  const enviados = pedidos.filter((p) => p.estado === "enviado").length;
  const entregados = pedidos.filter((p) => p.estado === "entregado").length;
  const cancelados = pedidos.filter((p) => p.estado === "cancelado").length;

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="ped-page">
        <span className="ped-orb ped-orb--one" aria-hidden="true" />
        <span className="ped-orb ped-orb--two" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="ped-header">
          <div>
            <p className="ped-eyebrow">🚚 Logística</p>
            <h1 className="ped-title">
              Gestión de <span>Pedidos</span>
            </h1>
            <p className="ped-subtitle">
              Visualiza y actualiza el estado de los pedidos de tu tienda.
            </p>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="ped-stats">
          {[
            { val: pedidos.length, label: "Total", cls: "" },
            { val: enProceso, label: "Pendientes", cls: "ped-stat--yellow" },
            { val: enviados, label: "Enviados", cls: "ped-stat--blue" },
            { val: entregados, label: "Entregados", cls: "ped-stat--green" },
            { val: cancelados, label: "Cancelados", cls: "ped-stat--red" },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`ped-stat-pill ${cls}`}>
              <span className="ped-stat-pill__val">{loading ? "—" : val}</span>
              <span className="ped-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="ped-toolbar">
          <div className="ped-search">
            <span className="ped-search__icon">🔍</span>
            <input
              placeholder="Buscar por # pedido o correo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="ped-search__clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
          <div className="ped-filters">
            <select
              value={filterEst}
              onChange={(e) => setFilterEst(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Contenido ── */}
        {loading ? (
          <div className="ped-loading">
            <div className="ped-loading__spinner" />
            <p>Cargando pedidos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ped-empty">
            <span className="ped-empty__icon">
              {pedidos.length === 0 ? "🚚" : "🔎"}
            </span>
            <p>
              {pedidos.length === 0
                ? "Aún no tienes pedidos. Cuando tus clientes compren, aparecerán aquí."
                : "No se encontraron pedidos con esos filtros."}
            </p>
            {pedidos.length > 0 && (
              <button
                className="ped-btn ped-btn--ghost"
                onClick={() => {
                  setSearch("");
                  setFilterEst("Todos");
                }}
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
                  <th>ID Pedido</th>
                  <th>Cliente</th>
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
                    <td>
                      <span className="ped-table__id">#{ped.id}</span>
                    </td>
                    <td className="ped-table__email">
                      {ped.correocliente ? (
                        <span>✉️ {ped.correocliente}</span>
                      ) : (
                        <span className="ped-table__no-email">Sin correo</span>
                      )}
                    </td>
                    <td>
                      <EstadoBadge estado={ped.estado} />
                    </td>
                    <td className="ped-table__total">
                      {formatPrice(ped.totalcompra)}
                    </td>
                    <td className="ped-table__date">
                      {formatDate(ped.fecha_creacion)}
                    </td>
                    <td>
                      <button
                        className="ped-icon-btn"
                        title="Ver detalle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal(ped);
                        }}
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

      {/* Modal */}
      {modal && (
        <ModalDetalle
          pedido={modal}
          userId={userId}
          productos={productos}
          onClose={() => setModal(null)}
          onEstadoCambiado={reload}
        />
      )}
    </>
  );
}

export default PaginaPedidos;
