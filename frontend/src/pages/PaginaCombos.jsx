import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerCombos,
  TraerAlimentos,
  CrearCombo,
  ActualizarCombo,
  AgregarAlimentosCombo,
  QuitarAlimentoCombo,
  CambiarEstadoCombo,
  EliminarCombo,
} from "../api/axios";
import "../styles/combos.css";

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatPrice(n) {
  if (!n && n !== 0) return "—";
  return `$${Number(n).toLocaleString("es-CO")}`;
}

/* ══════════════════════════════════════════
   AlimentoPicker con cantidad editable
══════════════════════════════════════════ */
function AlimentoPicker({ alimentos, seleccionados, onToggle, cantidades, onCantidad }) {
  if (alimentos.length === 0)
    return <p className="cmb-empty-hint">No tienes alimentos aún. Puedes agregarlos después.</p>;

  return (
    <div className="cmb-picker">
      {alimentos.map((a) => {
        const on = seleccionados.includes(a.id);
        return (
          <div key={a.id} className={`cmb-picker__item ${on ? "cmb-picker__item--on" : ""}`}>
            <button type="button" className="cmb-picker__chip" onClick={() => onToggle(a.id)}>
              {a.imagen ? (
                <img src={a.imagen} alt={a.nombre} className="cmb-picker__img" />
              ) : (
                <span className="cmb-picker__letter" style={{ "--hue": (a.id * 61) % 360 }}>
                  {a.nombre[0].toUpperCase()}
                </span>
              )}
              <span className="cmb-picker__name">{a.nombre}</span>
              <span className="cmb-picker__price">{formatPrice(a.precio)}</span>
              {on && <span className="cmb-picker__check">✓</span>}
            </button>
            {on && (
              <div className="cmb-picker__qty">
                <button type="button"
                  onClick={() => onCantidad(a.id, Math.max(1, (cantidades[a.id] ?? 1) - 1))}>−</button>
                <span>{cantidades[a.id] ?? 1}</span>
                <button type="button"
                  onClick={() => onCantidad(a.id, (cantidades[a.id] ?? 1) + 1)}>+</button>
              </div>
            )}
          </div>
        );
      })}
      {seleccionados.length > 0 && (
        <p className="cmb-sel-count">
          {seleccionados.length} alimento(s) seleccionado(s)
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL CREAR
══════════════════════════════════════════ */
function ModalCrear({ userId, alimentos, onClose, onCreado }) {
  const [nombre,      setNombre]      = useState("");
  const [descripcion, setDesc]        = useState("");
  const [precio,      setPrecio]      = useState("");
  const [selec,       setSelec]       = useState([]);
  const [cantidades,  setCantidades]  = useState({});
  const [loading,     setLoading]     = useState(false);

  const toggle = (id) =>
    setSelec((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const setCantidad = (id, val) =>
    setCantidades((p) => ({ ...p, [id]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())          return mostrarAlerta("warning", "El nombre es obligatorio.");
    if (!precio || Number(precio) < 0) return mostrarAlerta("warning", "Ingresa un precio válido.");

    const alimentosPayload = selec.map((id) => ({ alimento_id: id, cantidad: cantidades[id] ?? 1 }));

    setLoading(true);
    try {
      await CrearCombo({
        id_usuario:  userId,
        nombre:      nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio:      Number(precio),
        alimentos:   alimentosPayload.length > 0 ? alimentosPayload : null,
      });
      mostrarAlerta("success", "Combo creado correctamente ✦");
      onCreado();
      onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al crear el combo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmb-overlay" onClick={onClose}>
      <div className="cmb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmb-modal__header">
          <div className="cmb-modal__header-left">
            <div className="cmb-modal__icon">🎁</div>
            <div>
              <p className="cmb-modal__eyebrow">Nuevo combo</p>
              <h2 className="cmb-modal__title">Crear combo</h2>
            </div>
          </div>
          <button className="cmb-modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="cmb-modal__form" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="cmb-field">
            <label>Nombre <span className="cmb-req">*</span></label>
            <input placeholder="Ej: Combo familiar, Combo ejecutivo…"
              value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>

          {/* Descripción + Precio */}
          <div className="cmb-field-row">
            <div className="cmb-field">
              <label>Descripción <span className="cmb-opt">(opcional)</span></label>
              <textarea rows={2} placeholder="Describe el combo…"
                value={descripcion} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="cmb-field">
              <label>Precio final <span className="cmb-req">*</span> ($)</label>
              <input type="number" min={0} placeholder="0"
                value={precio} onChange={(e) => setPrecio(e.target.value)} required />
            </div>
          </div>

          {/* Alimentos */}
          <div className="cmb-field">
            <label>Alimentos del combo <span className="cmb-opt">(opcional)</span></label>
            <AlimentoPicker alimentos={alimentos} seleccionados={selec}
              onToggle={toggle} cantidades={cantidades} onCantidad={setCantidad} />
          </div>

          <div className="cmb-modal__actions">
            <button type="button" className="cmb-btn cmb-btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="cmb-btn cmb-btn--primary" disabled={loading}>
              {loading ? "Creando…" : "Crear combo ✦"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL EDITAR datos del combo
══════════════════════════════════════════ */
function ModalEditar({ combo, userId, onClose, onEditado }) {
  const [nombre,      setNombre]  = useState(combo.nombre);
  const [descripcion, setDesc]    = useState(combo.descripcion ?? "");
  const [precio,      setPrecio]  = useState(String(combo.precio));
  const [loading,     setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim())              return mostrarAlerta("warning", "El nombre no puede estar vacío.");
    if (!precio || Number(precio) < 0) return mostrarAlerta("warning", "Ingresa un precio válido.");
    setLoading(true);
    try {
      await ActualizarCombo({
        id_usuario:  userId,
        id:          combo.id,
        nombre:      nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio:      Number(precio),
      });
      mostrarAlerta("success", "Combo actualizado ✓");
      onEditado();
      onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmb-overlay" onClick={onClose}>
      <div className="cmb-modal cmb-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="cmb-modal__header">
          <div className="cmb-modal__header-left">
            <div className="cmb-modal__icon">✏️</div>
            <div>
              <p className="cmb-modal__eyebrow">Editando combo</p>
              <h2 className="cmb-modal__title">{combo.nombre}</h2>
            </div>
          </div>
          <button className="cmb-modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="cmb-modal__form" onSubmit={handleSubmit}>
          <div className="cmb-field">
            <label>Nombre <span className="cmb-req">*</span></label>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="cmb-field">
            <label>Descripción <span className="cmb-opt">(opcional)</span></label>
            <textarea rows={2} value={descripcion} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="cmb-field">
            <label>Precio final ($) <span className="cmb-req">*</span></label>
            <input type="number" min={0} required
              value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>
          <div className="cmb-modal__actions">
            <button type="button" className="cmb-btn cmb-btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="cmb-btn cmb-btn--primary" disabled={loading}>
              {loading ? "Guardando…" : "Guardar cambios ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL DETALLE — gestionar alimentos del combo
══════════════════════════════════════════ */
function ModalDetalle({ combo, userId, todosAlimentos, onClose, onCambio }) {
  const [items,      setItems]    = useState(combo.alimentos ?? []);
  const [addMode,    setAddMode]  = useState(false);
  const [selAdd,     setSelAdd]   = useState([]);
  const [cantAdd,    setCantAdd]  = useState({});
  const [saving,     setSaving]   = useState(false);

  const idsEnCombo    = items.map((i) => i.alimento_id);
  const disponibles   = todosAlimentos.filter((a) => !idsEnCombo.includes(a.id));

  const toggleAdd  = (id) => setSelAdd((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const setCant    = (id, val) => setCantAdd((p) => ({ ...p, [id]: val }));

  const confirmarAgregar = async () => {
    if (selAdd.length === 0) return;
    setSaving(true);
    try {
      await AgregarAlimentosCombo({
        id_usuario: userId,
        combo_id:   combo.id,
        alimentos:  selAdd.map((id) => ({ alimento_id: id, cantidad: cantAdd[id] ?? 1 })),
      });
      mostrarAlerta("success", `${selAdd.length} alimento(s) agregado(s) ✓`);
      // Actualizar lista local
      const nuevos = selAdd.map((id) => {
        const ali = todosAlimentos.find((a) => a.id === id);
        return { alimento_id: id, nombre: ali?.nombre, imagen: ali?.imagen,
                 precio: ali?.precio, cantidad: cantAdd[id] ?? 1 };
      });
      setItems((p) => [...p, ...nuevos]);
      setSelAdd([]); setCantAdd({}); setAddMode(false);
      onCambio();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al agregar");
    } finally {
      setSaving(false);
    }
  };

  const quitarAlimento = async (alimento_id) => {
    if (!window.confirm("¿Quitar este alimento del combo?")) return;
    try {
      await QuitarAlimentoCombo({ id_usuario: userId, combo_id: combo.id, alimento_id });
      mostrarAlerta("success", "Alimento quitado del combo ✓");
      setItems((p) => p.filter((i) => i.alimento_id !== alimento_id));
      onCambio();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al quitar");
    }
  };

  return (
    <div className="cmb-overlay" onClick={onClose}>
      <div className="cmb-modal cmb-modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="cmb-modal__header">
          <div className="cmb-modal__header-left">
            <div className="cmb-modal__icon cmb-modal__icon--big">🎁</div>
            <div>
              <p className="cmb-modal__eyebrow">Combo</p>
              <h2 className="cmb-modal__title">{combo.nombre}</h2>
              {combo.descripcion && <p className="cmb-modal__desc">{combo.descripcion}</p>}
            </div>
          </div>
          <div className="cmb-modal__header-price">{formatPrice(combo.precio)}</div>
          <button className="cmb-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="cmb-modal__body">
          {/* Barra sección */}
          <div className="cmb-section-bar">
            <span className="cmb-section-bar__label">
              Alimentos en el combo
              <span className="cmb-section-bar__count">{items.length}</span>
            </span>
            {!addMode && disponibles.length > 0 && (
              <button className="cmb-btn-link" onClick={() => setAddMode(true)}>
                + Agregar alimentos
              </button>
            )}
          </div>

          {/* Panel agregar */}
          {addMode && (
            <div className="cmb-add-panel">
              <p className="cmb-add-panel__hint">
                Selecciona los alimentos y ajusta la cantidad de cada uno:
              </p>
              <AlimentoPicker alimentos={disponibles} seleccionados={selAdd}
                onToggle={toggleAdd} cantidades={cantAdd} onCantidad={setCant} />
              <div className="cmb-add-panel__actions">
                <button className="cmb-btn cmb-btn--ghost"
                  onClick={() => { setAddMode(false); setSelAdd([]); setCantAdd({}); }}>
                  Cancelar
                </button>
                <button className="cmb-btn cmb-btn--primary"
                  disabled={selAdd.length === 0 || saving} onClick={confirmarAgregar}>
                  {saving ? "Agregando…" : `Agregar${selAdd.length > 0 ? ` (${selAdd.length})` : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* Lista de alimentos */}
          {items.length === 0 ? (
            <div className="cmb-empty-items">
              <span>🥡</span>
              <p>Este combo no tiene alimentos aún.</p>
            </div>
          ) : (
            <ul className="cmb-item-list">
              {items.map((item) => (
                <li key={item.alimento_id} className="cmb-item-row">
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} className="cmb-item-row__img" />
                  ) : (
                    <div className="cmb-item-row__thumb" style={{ "--hue": (item.alimento_id * 61) % 360 }}>
                      {(item.nombre ?? "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="cmb-item-row__info">
                    <span className="cmb-item-row__name">{item.nombre ?? `Alimento #${item.alimento_id}`}</span>
                    <span className="cmb-item-row__sub">
                      {item.precio ? formatPrice(item.precio) : ""} · x{item.cantidad}
                    </span>
                  </div>
                  <button className="cmb-item-row__remove"
                    onClick={() => quitarAlimento(item.alimento_id)} title="Quitar">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cmb-modal__footer">
          <button className="cmb-btn cmb-btn--ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TARJETA de combo
══════════════════════════════════════════ */
function ComboCard({ combo, onVer, onEditar, onEstado, onEliminar }) {
  return (
    <article className={`cmb-card ${!combo.estado ? "cmb-card--inactive" : ""}`}
      onClick={() => onVer(combo)}>
      <div className="cmb-card__bg" style={{ "--hue": (combo.id * 79) % 360 }} />

      <div className="cmb-card__top">
        <div className="cmb-card__icon" style={{ "--hue": (combo.id * 79) % 360 }}>🎁</div>
        <span className={`cmb-badge ${combo.estado ? "cmb-badge--active" : "cmb-badge--inactive"}`}>
          {combo.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <h3 className="cmb-card__name">{combo.nombre}</h3>

      {combo.descripcion ? (
        <p className="cmb-card__desc">{combo.descripcion}</p>
      ) : (
        <p className="cmb-card__desc cmb-card__desc--empty">Sin descripción</p>
      )}

      <div className="cmb-card__price-row">
        <span className="cmb-card__price">{formatPrice(combo.precio)}</span>
        <span className="cmb-card__meta">🥡 {combo.total_alimentos} item(s)</span>
      </div>

      <div className="cmb-card__footer">
        <span className="cmb-card__date">{formatDate(combo.fecha_creacion)}</span>
        <div className="cmb-card__actions">
          <button className="cmb-card__btn cmb-card__btn--edit"
            onClick={(e) => { e.stopPropagation(); onEditar(combo); }} title="Editar">✏️</button>
          <button
            className={`cmb-card__btn ${combo.estado ? "cmb-card__btn--deact" : "cmb-card__btn--act"}`}
            onClick={(e) => { e.stopPropagation(); onEstado(combo.id); }}>
            {combo.estado ? "🚫" : "✅"}
          </button>
          <button className="cmb-card__btn cmb-card__btn--del"
            onClick={(e) => { e.stopPropagation(); onEliminar(combo.id); }} title="Eliminar">🗑️</button>
          <button className="cmb-card__btn cmb-card__btn--view"
            onClick={(e) => { e.stopPropagation(); onVer(combo); }}>Ver →</button>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaCombos() {
  const navigate = useNavigate();
  const [userId,    setUserId]    = useState(null);
  const [username,  setUsername]  = useState("");
  const [combos,    setCombos]    = useState([]);
  const [alimentos, setAlimentos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);

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
      const [cRes, aRes] = await Promise.all([TraerCombos(id), TraerAlimentos(id)]);
      setCombos(cRes.data ?? []);
      setAlimentos(aRes.data ?? []);
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleEstado = async (id) => {
    try {
      await CambiarEstadoCombo({ id_usuario: userId, id });
      mostrarAlerta("success", "Estado del combo actualizado ✓");
      cargar(userId);
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al cambiar estado");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este combo? Se eliminarán también todos sus alimentos asociados.")) return;
    try {
      await EliminarCombo({ id_usuario: userId, id });
      mostrarAlerta("success", "Combo eliminado ✓");
      cargar(userId);
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al eliminar");
    }
  };

  const filtrados = combos.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const activos   = combos.filter((c) => c.estado).length;
  const inactivos = combos.filter((c) => !c.estado).length;
  const reload    = () => cargar(userId);
  const close     = () => setModal(null);

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="cmb-page">
        <span className="cmb-orb cmb-orb--one"   aria-hidden="true" />
        <span className="cmb-orb cmb-orb--two"   aria-hidden="true" />
        <span className="cmb-orb cmb-orb--three" aria-hidden="true" />

        {/* Header */}
        <header className="cmb-header">
          <div>
            <p className="cmb-eyebrow">🎁 Menú especial</p>
            <h1 className="cmb-title">Gestión de <span>Combos</span></h1>
            <p className="cmb-subtitle">
              Crea combos especiales con varios alimentos y un precio único.
            </p>
          </div>
          <button className="cmb-btn cmb-btn--primary cmb-btn--lg"
            onClick={() => setModal({ type: "crear" })}>
            + Nuevo combo
          </button>
        </header>

        {/* Stats */}
        <div className="cmb-stats">
          {[
            { val: combos.length,    label: "Total",      cls: "" },
            { val: activos,          label: "Activos",    cls: "cmb-stat--green" },
            { val: inactivos,        label: "Inactivos",  cls: "cmb-stat--gray" },
            { val: alimentos.length, label: "Alimentos",  cls: "cmb-stat--orange" },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`cmb-stat-pill ${cls}`}>
              <span className="cmb-stat-pill__val">{loading ? "—" : val}</span>
              <span className="cmb-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="cmb-toolbar">
          <div className="cmb-search">
            <span className="cmb-search__icon">🔍</span>
            <input placeholder="Buscar combo…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
            {search && <button className="cmb-search__clear" onClick={() => setSearch("")}>✕</button>}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="cmb-loading">
            <div className="cmb-loading__spinner" />
            <p>Cargando combos…</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="cmb-empty">
            <span className="cmb-empty__icon">{combos.length === 0 ? "🎁" : "🔎"}</span>
            <p>{combos.length === 0
              ? "Aún no tienes combos. ¡Crea el primero!"
              : `Sin resultados para "${search}".`}</p>
            {combos.length === 0 ? (
              <button className="cmb-btn cmb-btn--primary"
                onClick={() => setModal({ type: "crear" })}>+ Crear el primero</button>
            ) : (
              <button className="cmb-btn cmb-btn--ghost" onClick={() => setSearch("")}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="cmb-grid">
            {filtrados.map((combo) => (
              <ComboCard key={combo.id} combo={combo}
                onVer={(c)      => setModal({ type: "detalle", data: c })}
                onEditar={(c)   => setModal({ type: "editar",  data: c })}
                onEstado={handleEstado}
                onEliminar={handleEliminar}
              />
            ))}
            <button className="cmb-card cmb-card--new" onClick={() => setModal({ type: "crear" })}>
              <span className="cmb-card--new__icon">+</span>
              <span className="cmb-card--new__label">Nuevo combo</span>
            </button>
          </div>
        )}

        {!loading && (
          <p className="cmb-count">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{combos.length}</strong> combos
          </p>
        )}
      </div>

      {/* Modales */}
      {modal?.type === "crear" && (
        <ModalCrear userId={userId} alimentos={alimentos} onClose={close} onCreado={reload} />
      )}
      {modal?.type === "editar" && (
        <ModalEditar combo={modal.data} userId={userId} onClose={close} onEditado={reload} />
      )}
      {modal?.type === "detalle" && (
        <ModalDetalle combo={modal.data} userId={userId}
          todosAlimentos={alimentos} onClose={close} onCambio={reload} />
      )}
    </>
  );
}

export default PaginaCombos;
