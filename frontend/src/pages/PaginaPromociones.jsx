import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerPromocion,
  TraerProductosPromocion,
  TraerPromocionUnitaria,
  TraerProductos,
  ModificarPromocion,
  ModificarPromocionUnitaria,
  AsignarProductosPromocion,
  EliminarProductoPromocion,
  CambiarEstadoPromocion,
  CambiarEstadoPromocionUnitaria,
  CrearPromocionUnitaria,
} from "../api/axios";
import ModalInformacionInputs from "../components/InformacionInputs";
import "../styles/promociones.css";

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
function DescuentoBadge({ descuento }) {
  if (!descuento)
    return <span className="promo-badge promo-badge--off">Sin descuento</span>;
  return (
    <span className="promo-badge promo-badge--discount">-{descuento}%</span>
  );
}

function EstadoBadge({ estado }) {
  return (
    <span
      className={`promo-badge ${estado ? "promo-badge--active" : "promo-badge--inactive"}`}
    >
      {estado ? "Activa" : "Inactiva"}
    </span>
  );
}

function InfoTrigger({ onClick }) {
  return (
    <button
      type="button"
      className="promo-info-trigger"
      onClick={onClick}
      aria-label="Ver información"
    >
      !
    </button>
  );
}

/* ══════════════════════════════════════════
   MODAL — Editar promoción general
══════════════════════════════════════════ */
function ModalEditarPromocion({ promo, userId, onClose, onGuardado }) {
  const [nombre, setNombre] = useState(promo.nombre ?? "");
  const [descripcion, setDesc] = useState(promo.descripcion ?? "");
  const [descuento, setDescuento] = useState(promo.descuento ?? 0);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ModificarPromocion({
        id_usuario: userId,
        nombre,
        descripcion,
        descuento: Number(descuento),
      });
      mostrarAlerta("success", "Promoción actualizada");
      onGuardado();
      onClose();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al actualizar",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promo-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promo-modal__header">
          <div className="promo-modal__icon">🏷️</div>
          <div>
            <p className="promo-modal__eyebrow">Promoción general</p>
            <h2 className="promo-modal__title">Editar promoción</h2>
          </div>
          <button className="promo-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="promo-modal__form" onSubmit={handleSubmit}>
          <div className="promo-field">
            <label>
              Nombre <span className="promo-req">*</span>
              <InfoTrigger
                onClick={() =>
                  setInfo(
                    "Usa un nombre claro para identificar esta campaña de descuento.",
                  )
                }
              />
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Rebajas de verano"
            />
          </div>
          <div className="promo-field">
            <label>
              Descripción
              <InfoTrigger
                onClick={() =>
                  setInfo(
                    "Describe brevemente la promoción para recordar su objetivo o comunicarlo a tus clientes.",
                  )
                }
              />
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe la promoción…"
            />
          </div>
          <div className="promo-field">
            <label>
              Descuento (%) <span className="promo-req">*</span>
              <InfoTrigger
                onClick={() =>
                  setInfo(
                    "Define el porcentaje que se descontará del precio de los productos seleccionados. El valor debe estar entre 0 y 100.",
                  )
                }
              />
            </label>
            <div className="promo-input-suffix">
              <input
                type="number"
                min="0"
                max="100"
                required
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
              <span>%</span>
            </div>
            <div
              className="promo-discount-preview"
              style={{ "--pct": `${descuento}%` }}
            >
              <div className="promo-discount-preview__bar" />
              <span>{descuento}% de descuento</span>
            </div>
          </div>
          <div className="promo-modal__actions">
            <button
              type="button"
              className="promo-btn promo-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="promo-btn promo-btn--primary"
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar cambios ✓"}
            </button>
          </div>
        </form>
      </div>
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL — Agregar productos a promo general
══════════════════════════════════════════ */
function ModalAgregarProductos({
  userId,
  todosProductos,
  productosEnPromo,
  onClose,
  onGuardado,
}) {
  const idsEnPromo = productosEnPromo.map((p) => p.producto_id);
  const disponibles = todosProductos.filter((p) => !idsEnPromo.includes(p.id));
  const [sel, setSel] = useState([]);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null);

  const toggle = (id) =>
    setSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const confirmar = async () => {
    if (!sel.length) return;
    setSaving(true);
    try {
      await AsignarProductosPromocion({ id_usuario: userId, producto_id: sel });
      mostrarAlerta(
        "success",
        `${sel.length} producto(s) agregado(s) a la promoción`,
      );
      onGuardado();
      onClose();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al agregar productos",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promo-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promo-modal__header">
          <div className="promo-modal__icon">➕</div>
          <div>
            <p className="promo-modal__eyebrow">Promoción general</p>
            <h2 className="promo-modal__title">Agregar productos</h2>
          </div>
          <button className="promo-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="promo-modal__form">
          {disponibles.length === 0 ? (
            <p className="promo-empty-hint">
              Todos los productos ya están en esta promoción o tienen promoción
              unitaria.
            </p>
          ) : (
            <>
              <p className="promo-empty-hint">
                Selecciona los productos que quieres incluir
                <InfoTrigger
                  onClick={() =>
                    setInfo(
                      "Los productos seleccionados recibirán el descuento de la promoción general. Puedes agregar varios a la vez.",
                    )
                  }
                />
              </p>
              <div className="promo-product-picker">
                {disponibles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`promo-product-chip ${sel.includes(p.id) ? "promo-product-chip--on" : ""}`}
                    onClick={() => toggle(p.id)}
                  >
                    <span
                      className="promo-product-chip__letter"
                      style={{ "--hue": (p.id * 57) % 360 }}
                    >
                      {p.nombre[0].toUpperCase()}
                    </span>
                    <span>{p.nombre}</span>
                    {sel.includes(p.id) && (
                      <span className="promo-product-chip__check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          {sel.length > 0 && (
            <p className="promo-sel-count">{sel.length} seleccionado(s)</p>
          )}
          <div className="promo-modal__actions">
            <button className="promo-btn promo-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="promo-btn promo-btn--primary"
              disabled={!sel.length || saving}
              onClick={confirmar}
            >
              {saving ? "Agregando…" : `Agregar (${sel.length})`}
            </button>
          </div>
        </div>
      </div>
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL — Crear promoción unitaria
══════════════════════════════════════════ */
function ModalCrearUnitaria({
  userId,
  todosProductos,
  promoUnitarias,
  onClose,
  onCreado,
}) {
  const idsConPromo = promoUnitarias.map((p) => p.id_producto);
  const disponibles = todosProductos.filter((p) => !idsConPromo.includes(p.id));
  const [productoId, setProductoId] = useState(disponibles[0]?.id ?? "");
  const [descuento, setDescuento] = useState(10);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await CrearPromocionUnitaria({
        id_usuario: userId,
        producto_id: Number(productoId),
        descuento: Number(descuento),
      });
      mostrarAlerta("success", "Promoción unitaria creada");
      onCreado();
      onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promo-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promo-modal__header">
          <div className="promo-modal__icon">🎯</div>
          <div>
            <p className="promo-modal__eyebrow">Promoción unitaria</p>
            <h2 className="promo-modal__title">Crear descuento por producto</h2>
          </div>
          <button className="promo-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="promo-modal__form" onSubmit={handleSubmit}>
          {disponibles.length === 0 ? (
            <p className="promo-empty-hint">
              Todos los productos ya tienen una promoción asignada.
            </p>
          ) : (
            <>
              <div className="promo-field">
                <label>
                  Producto <span className="promo-req">*</span>
                  <InfoTrigger
                    onClick={() =>
                      setInfo(
                        "Selecciona el producto al que quieres aplicar una promoción individual. Los productos con otra promoción unitaria no aparecen disponibles.",
                      )
                    }
                  />
                </label>
                <select
                  required
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                >
                  {disponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="promo-field">
                <label>
                  Descuento (%) <span className="promo-req">*</span>
                  <InfoTrigger
                    onClick={() =>
                      setInfo(
                        "Este porcentaje se aplicará únicamente al producto seleccionado. Usa un valor entre 1 y 100.",
                      )
                    }
                  />
                </label>
                <div className="promo-input-suffix">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                  />
                  <span>%</span>
                </div>
                <div
                  className="promo-discount-preview"
                  style={{ "--pct": `${descuento}%` }}
                >
                  <div className="promo-discount-preview__bar" />
                  <span>{descuento}% de descuento</span>
                </div>
              </div>
            </>
          )}
          <div className="promo-modal__actions">
            <button
              type="button"
              className="promo-btn promo-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="promo-btn promo-btn--primary"
              disabled={saving}
            >
              {saving ? "Creando…" : "Crear promoción ✦"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL — Editar promoción unitaria
══════════════════════════════════════════ */
function ModalEditarUnitaria({
  promo,
  userId,
  nombreProducto,
  onClose,
  onGuardado,
}) {
  const [descuento, setDescuento] = useState(promo.descuento ?? 0);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ModificarPromocionUnitaria({
        id_usuario: userId,
        id: promo.id_producto,
        descuento: Number(descuento),
      });
      mostrarAlerta("success", "Promoción actualizada");
      onGuardado();
      onClose();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al actualizar",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promo-overlay" onClick={onClose}>
      <div
        className="promo-modal promo-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="promo-modal__header">
          <div className="promo-modal__icon">✏️</div>
          <div>
            <p className="promo-modal__eyebrow">Editar descuento</p>
            <h2 className="promo-modal__title">{nombreProducto}</h2>
          </div>
          <button className="promo-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="promo-modal__form" onSubmit={handleSubmit}>
          <div className="promo-field">
            <label>
              Descuento (%) <span className="promo-req">*</span>
              <InfoTrigger
                onClick={() =>
                  setInfo(
                    "Este porcentaje se aplicará únicamente al producto seleccionado. Usa un valor entre 1 y 100.",
                  )
                }
              />
            </label>
            <div className="promo-input-suffix">
              <input
                type="number"
                min="1"
                max="100"
                required
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
              <span>%</span>
            </div>
            <div
              className="promo-discount-preview"
              style={{ "--pct": `${descuento}%` }}
            >
              <div className="promo-discount-preview__bar" />
              <span>{descuento}% de descuento</span>
            </div>
          </div>
          <div className="promo-modal__actions">
            <button
              type="button"
              className="promo-btn promo-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="promo-btn promo-btn--primary"
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar ✓"}
            </button>
          </div>
        </form>
      </div>
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaPromociones() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState(null); // promoción general
  const [prodPromo, setProdPromo] = useState([]); // productos en promo general
  const [unitarias, setUnitarias] = useState([]); // promociones unitarias
  const [productos, setProductos] = useState([]); // todos los productos
  const [modal, setModal] = useState(null);

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
      const [promoRes, prodPromoRes, unitariasRes, todosRes] =
        await Promise.allSettled([
          TraerPromocion(id),
          TraerProductosPromocion(id),
          TraerPromocionUnitaria(id),
          TraerProductos(id),
        ]);
      if (promoRes.status === "fulfilled") setPromo(promoRes.value.data);
      if (prodPromoRes.status === "fulfilled")
        setProdPromo(prodPromoRes.value.data);
      if (unitariasRes.status === "fulfilled")
        setUnitarias(unitariasRes.value.data);
      if (todosRes.status === "fulfilled") setProductos(todosRes.value.data);
    } catch {
      mostrarAlerta("error", "Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  };

  const reload = () => cargar(userId);
  const nombreProducto = (id) =>
    productos.find((p) => p.id === id)?.nombre ?? `#${id}`;

  /* Cambiar estado promo general */
  const togglePromoGeneral = async () => {
    try {
      await CambiarEstadoPromocion(userId);
      reload();
      mostrarAlerta(
        "success",
        `Promoción ${promo?.estado ? "desactivada" : "activada"}`,
      );
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error");
    }
  };

  /* Quitar producto de promo general */
  const quitarProductoPromo = async (productoId) => {
    try {
      await EliminarProductoPromocion({
        id_usuario: userId,
        producto_id: productoId,
      });
      reload();
      {
        info && <ModalInformacionInputs text={info} setmodal={setInfo} />;
      }
      mostrarAlerta("success", "Producto quitado de la promoción");
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error");
    }
  };

  /* Cambiar estado promo unitaria */
  const toggleUnitaria = async (idProducto) => {
    try {
      await CambiarEstadoPromocionUnitaria({
        id_usuario: userId,
        id: idProducto,
      });
      reload();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error");
    }
  };

  /* Stats */
  const unitActivas = unitarias.filter((u) => u.estado).length;

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="promo-page">
        <span className="promo-orb promo-orb--one" aria-hidden="true" />
        <span className="promo-orb promo-orb--two" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="promo-header">
          <div>
            <p className="promo-eyebrow">🏷️ Ofertas</p>
            <h1 className="promo-title">
              Gestión de <span>Promociones</span>
            </h1>
            <p className="promo-subtitle">
              Administra descuentos generales para toda la tienda y promociones
              individuales por producto.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="promo-loading">
            <div className="promo-loading__spinner" />
            <p>Cargando promociones…</p>
          </div>
        ) : (
          <>
            {/* ── Stats rápidas ── */}
            <div className="promo-stats">
              {[
                {
                  val: promo ? 1 : 0,
                  label: "Promo general",
                  cls: promo?.estado ? "promo-stat--green" : "",
                },
                {
                  val: prodPromo.length,
                  label: "Productos en promo",
                  cls: "promo-stat--blue",
                },
                { val: unitarias.length, label: "Promos unitarias", cls: "" },
                {
                  val: unitActivas,
                  label: "Unitarias activas",
                  cls: "promo-stat--green",
                },
              ].map(({ val, label, cls }) => (
                <div key={label} className={`promo-stat-pill ${cls}`}>
                  <span className="promo-stat-pill__val">{val}</span>
                  <span className="promo-stat-pill__label">{label}</span>
                </div>
              ))}
            </div>

            {/* ══════════════════════════════════════════
                SECCIÓN 1 — PROMOCIÓN GENERAL
            ══════════════════════════════════════════ */}
            <section className="promo-section">
              <div className="promo-section__header">
                <div className="promo-section__title-wrap">
                  <span className="promo-section__icon">🏷️</span>
                  <h2 className="promo-section__title">
                    Promoción general de la tienda
                  </h2>
                </div>
                {promo && (
                  <div className="promo-section__actions">
                    <button
                      className={`promo-btn ${promo.estado ? "promo-btn--deactivate" : "promo-btn--activate"}`}
                      onClick={togglePromoGeneral}
                    >
                      {promo.estado ? "🚫 Desactivar" : "✅ Activar"}
                    </button>
                    <button
                      className="promo-btn promo-btn--edit"
                      onClick={() => setModal({ type: "editarPromo" })}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                )}
              </div>

              {!promo ? (
                <div className="promo-empty-box">
                  <span>🏷️</span>
                  <p>
                    Tu tienda aún no tiene una promoción general configurada.
                  </p>
                  <p className="promo-empty-hint">
                    La promoción general se crea automáticamente al registrar la
                    tienda.
                  </p>
                </div>
              ) : (
                <div className="promo-general-card">
                  {/* Info de la promoción */}
                  <div className="promo-general-card__info">
                    <div className="promo-general-card__name-row">
                      <strong>{promo.nombre}</strong>
                      <EstadoBadge estado={promo.estado} />
                      <DescuentoBadge descuento={promo.descuento} />
                    </div>
                    {promo.descripcion && (
                      <p className="promo-general-card__desc">
                        {promo.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Barra de descuento visual */}
                  <div className="promo-bar-wrap">
                    <div className="promo-bar">
                      <div
                        className="promo-bar__fill"
                        style={{ width: `${promo.descuento}%` }}
                      />
                    </div>
                    <span className="promo-bar__label">
                      {promo.descuento}% aplicado a todos los productos
                      seleccionados
                    </span>
                  </div>

                  {/* Productos en la promo */}
                  <div className="promo-prod-section">
                    <div className="promo-prod-section__bar">
                      <span className="promo-prod-section__label">
                        Productos incluidos
                        <span className="promo-prod-count">
                          {prodPromo.length}
                        </span>
                      </span>
                      <button
                        className="promo-btn-link"
                        onClick={() => setModal({ type: "agregarProductos" })}
                      >
                        + Agregar productos
                      </button>
                    </div>

                    {prodPromo.length === 0 ? (
                      <p className="promo-empty-hint">
                        No hay productos asignados a esta promoción.
                      </p>
                    ) : (
                      <div className="promo-prod-list">
                        {prodPromo.map((rel) => (
                          <div key={rel.id} className="promo-prod-chip">
                            <span
                              className="promo-prod-chip__letter"
                              style={{ "--hue": (rel.producto_id * 57) % 360 }}
                            >
                              {nombreProducto(
                                rel.producto_id,
                              )[0]?.toUpperCase()}
                            </span>
                            <span className="promo-prod-chip__name">
                              {nombreProducto(rel.producto_id)}
                            </span>
                            <button
                              className="promo-prod-chip__remove"
                              title="Quitar de la promoción"
                              onClick={() =>
                                quitarProductoPromo(rel.producto_id)
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════
                SECCIÓN 2 — PROMOCIONES UNITARIAS
            ══════════════════════════════════════════ */}
            <section className="promo-section">
              <div className="promo-section__header">
                <div className="promo-section__title-wrap">
                  <span className="promo-section__icon">🎯</span>
                  <h2 className="promo-section__title">
                    Promociones por producto
                  </h2>
                </div>
                <button
                  className="promo-btn promo-btn--primary"
                  onClick={() => setModal({ type: "crearUnitaria" })}
                >
                  + Nuevo descuento
                </button>
              </div>

              {unitarias.length === 0 ? (
                <div className="promo-empty-box">
                  <span>🎯</span>
                  <p>No tienes promociones individuales aún.</p>
                  <button
                    className="promo-btn promo-btn--primary"
                    onClick={() => setModal({ type: "crearUnitaria" })}
                  >
                    + Crear primera promoción unitaria
                  </button>
                </div>
              ) : (
                <div className="promo-unitarias-grid">
                  {unitarias.map((u) => (
                    <div
                      key={u.id}
                      className={`promo-unitaria-card ${u.estado ? "promo-unitaria-card--active" : "promo-unitaria-card--inactive"}`}
                    >
                      <div className="promo-unitaria-card__top">
                        <div
                          className="promo-unitaria-card__thumb"
                          style={{ "--hue": (u.id_producto * 57) % 360 }}
                        >
                          {nombreProducto(u.id_producto)[0]?.toUpperCase()}
                        </div>
                        <div className="promo-unitaria-card__info">
                          <strong>{nombreProducto(u.id_producto)}</strong>
                          <EstadoBadge estado={u.estado} />
                        </div>
                        <div className="promo-unitaria-card__discount">
                          -{u.descuento}%
                        </div>
                      </div>

                      {/* Mini barra */}
                      <div className="promo-bar promo-bar--sm">
                        <div
                          className="promo-bar__fill"
                          style={{ width: `${u.descuento}%` }}
                        />
                      </div>

                      <div className="promo-unitaria-card__actions">
                        <button
                          className="promo-icon-btn promo-icon-btn--edit"
                          title="Editar descuento"
                          onClick={() =>
                            setModal({ type: "editarUnitaria", data: u })
                          }
                        >
                          ✏️
                        </button>
                        <button
                          className={`promo-icon-btn ${u.estado ? "promo-icon-btn--deactivate" : "promo-icon-btn--activate"}`}
                          title={u.estado ? "Desactivar" : "Activar"}
                          onClick={() => toggleUnitaria(u.id_producto)}
                        >
                          {u.estado ? "🚫" : "✅"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ── Modales ── */}
      {modal?.type === "editarPromo" && (
        <ModalEditarPromocion
          promo={promo}
          userId={userId}
          onClose={() => setModal(null)}
          onGuardado={reload}
        />
      )}
      {modal?.type === "agregarProductos" && (
        <ModalAgregarProductos
          userId={userId}
          todosProductos={productos}
          productosEnPromo={prodPromo}
          onClose={() => setModal(null)}
          onGuardado={reload}
        />
      )}
      {modal?.type === "crearUnitaria" && (
        <ModalCrearUnitaria
          userId={userId}
          todosProductos={productos}
          promoUnitarias={unitarias}
          onClose={() => setModal(null)}
          onCreado={reload}
        />
      )}
      {modal?.type === "editarUnitaria" && (
        <ModalEditarUnitaria
          promo={modal.data}
          userId={userId}
          nombreProducto={nombreProducto(modal.data.id_producto)}
          onClose={() => setModal(null)}
          onGuardado={reload}
        />
      )}
    </>
  );
}

export default PaginaPromociones;
