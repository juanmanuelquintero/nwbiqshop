import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerColeccionesAlimentos,
  CrearColeccionAlimentos,
  ActualizarColeccionAlimentos,
  CambiarEstadoColeccionAlimentos,
  EliminarColeccionAlimentos,
  TraerItemsColeccionAlimentos,
  AgregarAlimentosColeccion,
  QuitarAlimentoColeccion,
  TraerAlimentos,
} from "../api/axios";
import "../styles/colecciones.css";

/* ══════════════════════════════════════════
   Helper — formato de fecha
══════════════════════════════════════════ */
function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ══════════════════════════════════════════
   Selector de alimentos (chips reutilizable)
══════════════════════════════════════════ */
function AlimentoPicker({ alimentos, seleccionados, onToggle }) {
  if (alimentos.length === 0)
    return (
      <p className="col-empty-hint">
        No tienes alimentos aún. Puedes agregarlos después.
      </p>
    );

  return (
    <>
      <div className="col-product-picker">
        {alimentos.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`col-product-chip ${seleccionados.includes(a.id) ? "col-product-chip--on" : ""}`}
            onClick={() => onToggle(a.id)}
          >
            <span
              className="col-product-chip__letter"
              style={{ "--hue": (a.id * 61) % 360 }}
            >
              {a.nombre[0].toUpperCase()}
            </span>
            <span className="col-product-chip__name">{a.nombre}</span>
            {seleccionados.includes(a.id) && (
              <span className="col-product-chip__check">✓</span>
            )}
          </button>
        ))}
      </div>
      {seleccionados.length > 0 && (
        <p className="col-sel-count">
          {seleccionados.length} alimento(s) seleccionado(s)
        </p>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   MODAL CREAR
══════════════════════════════════════════ */
function ModalCrear({ userId, alimentos, onClose, onCreado }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDesc] = useState("");
  const [seleccionados, setSelec] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id) =>
    setSelec((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      mostrarAlerta("warning", "El título es obligatorio.");
      return;
    }
    setLoading(true);
    try {
      await CrearColeccionAlimentos({
        id_usuario: userId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        alimento_ids: seleccionados.length > 0 ? seleccionados : null,
      });
      mostrarAlerta("success", "Colección creada correctamente ✓");
      onCreado();
      onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al crear la colección");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-overlay" onClick={onClose}>
      <div className="col-modal" onClick={(e) => e.stopPropagation()}>
        <div className="col-modal__header">
          <div className="col-modal__header-left">
            <div className="col-modal__icon">🍽️</div>
            <div>
              <p className="col-modal__eyebrow">Nueva colección</p>
              <h2 className="col-modal__title">Crear colección de alimentos</h2>
            </div>
          </div>
          <button className="col-modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="col-modal__form" onSubmit={handleSubmit}>
          <div className="col-field col-field--full">
            <label>Título <span className="col-req">*</span></label>
            <input
              placeholder="Ej: Entradas, Platos fuertes…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="col-field col-field--full">
            <label>Descripción <span className="col-opt">(opcional)</span></label>
            <textarea
              rows={2}
              placeholder="Describe brevemente esta colección…"
              value={descripcion}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="col-field col-field--full">
            <label>Agregar alimentos <span className="col-opt">(opcional)</span></label>
            <AlimentoPicker
              alimentos={alimentos}
              seleccionados={seleccionados}
              onToggle={toggle}
            />
          </div>

          <div className="col-modal__actions">
            <button type="button" className="col-btn col-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="col-btn col-btn--primary" disabled={loading}>
              {loading ? "Creando…" : "Crear colección ✦"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL EDITAR
══════════════════════════════════════════ */
function ModalEditar({ coleccion, userId, onClose, onEditado }) {
  const [titulo, setTitulo] = useState(coleccion.titulo);
  const [descripcion, setDesc] = useState(coleccion.descripcion ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      mostrarAlerta("warning", "El título no puede estar vacío.");
      return;
    }
    setLoading(true);
    try {
      await ActualizarColeccionAlimentos({
        id_usuario: userId,
        id: coleccion.id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
      });
      mostrarAlerta("success", "Colección actualizada ✓");
      onEditado();
      onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-overlay" onClick={onClose}>
      <div className="col-modal col-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="col-modal__header">
          <div className="col-modal__header-left">
            <div className="col-modal__icon">✏️</div>
            <div>
              <p className="col-modal__eyebrow">Editando</p>
              <h2 className="col-modal__title">{coleccion.titulo}</h2>
            </div>
          </div>
          <button className="col-modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="col-modal__form" onSubmit={handleSubmit}>
          <div className="col-field col-field--full">
            <label>Título <span className="col-req">*</span></label>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="col-field col-field--full">
            <label>Descripción <span className="col-opt">(opcional)</span></label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="col-modal__actions">
            <button type="button" className="col-btn col-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="col-btn col-btn--primary" disabled={loading}>
              {loading ? "Guardando…" : "Guardar cambios ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL DETALLE — ver y gestionar alimentos
══════════════════════════════════════════ */
function ModalDetalle({ coleccion, userId, todosAlimentos, onClose, onCambio }) {
  const [items, setItems] = useState([]);         // alimentos actuales
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [selAdd, setSelAdd] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await TraerItemsColeccionAlimentos({
        id_usuario: userId,
        coleccion_id: coleccion.id,
      });
      setItems(res.data?.alimentos ?? []);
    } catch {
      mostrarAlerta("error", "Error al cargar los alimentos de la colección");
    } finally {
      setLoading(false);
    }
  };

  const idsEnCol = items.map((a) => a.id);
  const disponibles = todosAlimentos.filter((a) => !idsEnCol.includes(a.id));

  const toggleAdd = (id) =>
    setSelAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const confirmarAgregar = async () => {
    if (selAdd.length === 0) return;
    setSaving(true);
    try {
      await AgregarAlimentosColeccion({
        id_usuario: userId,
        coleccion_id: coleccion.id,
        alimento_ids: selAdd,
      });
      mostrarAlerta("success", `${selAdd.length} alimento(s) agregado(s) ✓`);
      setSelAdd([]);
      setAddMode(false);
      await cargar();
      onCambio();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al agregar");
    } finally {
      setSaving(false);
    }
  };

  const quitarAlimento = async (alimento_id) => {
    const confirmar = window.confirm("¿Quitar este alimento de la colección?");
    if (!confirmar) return;
    try {
      await QuitarAlimentoColeccion({
        id_usuario: userId,
        coleccion_id: coleccion.id,
        alimento_id,
      });
      mostrarAlerta("success", "Alimento quitado de la colección ✓");
      await cargar();
      onCambio();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al quitar el alimento");
    }
  };

  return (
    <div className="col-overlay" onClick={onClose}>
      <div className="col-modal col-modal--lg" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="col-modal__header">
          <div className="col-modal__header-left">
            <div className="col-modal__icon col-modal__icon--big">🍽️</div>
            <div>
              <p className="col-modal__eyebrow">Colección de alimentos</p>
              <h2 className="col-modal__title">{coleccion.titulo}</h2>
              {coleccion.descripcion && (
                <p className="col-modal__desc">{coleccion.descripcion}</p>
              )}
            </div>
          </div>
          <button className="col-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="col-modal__body">
          {/* Barra sección */}
          <div className="col-section-bar">
            <span className="col-section-bar__label">
              Alimentos en esta colección
              <span className="col-section-bar__count">
                {loading ? "…" : items.length}
              </span>
            </span>
            {!addMode && disponibles.length > 0 && (
              <button className="col-btn-link" onClick={() => setAddMode(true)}>
                + Agregar alimentos
              </button>
            )}
          </div>

          {/* Panel agregar */}
          {addMode && (
            <div className="col-add-panel">
              <p className="col-add-panel__hint">
                Selecciona los alimentos que deseas agregar:
              </p>
              <AlimentoPicker
                alimentos={disponibles}
                seleccionados={selAdd}
                onToggle={toggleAdd}
              />
              <div className="col-add-panel__actions">
                <button
                  className="col-btn col-btn--ghost"
                  onClick={() => { setAddMode(false); setSelAdd([]); }}
                >
                  Cancelar
                </button>
                <button
                  className="col-btn col-btn--primary"
                  disabled={selAdd.length === 0 || saving}
                  onClick={confirmarAgregar}
                >
                  {saving
                    ? "Agregando…"
                    : `Agregar${selAdd.length > 0 ? ` (${selAdd.length})` : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* Lista alimentos actuales */}
          {loading ? (
            <div className="col-loading">
              <div className="col-loading__spinner" />
              <p>Cargando alimentos…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="col-empty-products">
              <span>🍽️</span>
              <p>Esta colección no tiene alimentos aún.</p>
            </div>
          ) : (
            <ul className="col-product-list">
              {items.map((alimento) => (
                <li key={alimento.id} className="col-product-row">
                  {alimento.imagen ? (
                    <img
                      src={alimento.imagen}
                      alt={alimento.nombre}
                      className="cali-row-img"
                    />
                  ) : (
                    <div
                      className="col-product-row__thumb"
                      style={{ "--hue": (alimento.id * 61) % 360 }}
                    >
                      {alimento.nombre[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="cali-row-info">
                    <span className="col-product-row__name">{alimento.nombre}</span>
                    <span className="cali-row-price">
                      ${Number(alimento.precio ?? 0).toLocaleString("es-CO")}
                    </span>
                  </div>
                  <span className={`col-badge ${alimento.disponible ? "col-badge--active" : "col-badge--inactive"}`}>
                    {alimento.disponible ? "Disponible" : "No disponible"}
                  </span>
                  <button
                    className="col-product-row__remove"
                    title="Quitar de la colección"
                    onClick={() => quitarAlimento(alimento.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-modal__footer">
          <button className="col-btn col-btn--ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TARJETA de colección
══════════════════════════════════════════ */
function ColeccionCard({ col, onVer, onEditar, onEstado, onEliminar }) {
  return (
    <article className="col-card" onClick={() => onVer(col)}>
      <div className="col-card__bg-circle" style={{ "--hue": (col.id * 83) % 360 }} />

      <div className="col-card__top">
        <div className="col-card__icon" style={{ "--hue": (col.id * 83) % 360 }}>
          🍽️
        </div>
        <div className="col-card__badges">
          <span className={`col-badge ${col.estado ? "col-badge--active" : "col-badge--inactive"}`}>
            {col.estado ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>

      <h3 className="col-card__name">{col.titulo}</h3>

      {col.descripcion ? (
        <p className="col-card__desc">{col.descripcion}</p>
      ) : (
        <p className="col-card__desc col-card__desc--empty">Sin descripción</p>
      )}

      <div className="cali-card-meta">
        <span>🍽️ {col.total_alimentos} alimento(s)</span>
        <span>{formatDate(col.fecha_creacion)}</span>
      </div>

      <div className="col-card__footer">
        <span className="col-card__date">{formatDate(col.fecha_creacion)}</span>
        <div className="col-card__actions">
          <button
            className="col-card__btn col-card__btn--edit"
            title="Editar"
            onClick={(e) => { e.stopPropagation(); onEditar(col); }}
          >
            ✏️
          </button>
          <button
            className={`col-card__btn ${col.estado ? "col-card__btn--deactivate" : "col-card__btn--activate"}`}
            title={col.estado ? "Desactivar" : "Activar"}
            onClick={(e) => { e.stopPropagation(); onEstado(col.id); }}
          >
            {col.estado ? "🚫 Desactivar" : "✅ Activar"}
          </button>
          <button
            className="col-card__btn col-card__btn--delete"
            title="Eliminar"
            onClick={(e) => { e.stopPropagation(); onEliminar(col.id); }}
          >
            🗑️
          </button>
          <button
            className="col-card__btn col-card__btn--view"
            onClick={(e) => { e.stopPropagation(); onVer(col); }}
          >
            Ver →
          </button>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaColeccionAlimentos() {
  const navigate = useNavigate();
  const [userId, setUserId]         = useState(null);
  const [username, setUsername]     = useState("");
  const [colecciones, setColecciones] = useState([]);
  const [alimentos, setAlimentos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);

  /* ── Auth + carga inicial ── */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      mostrarAlerta("error", "No cuenta con un token válido");
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
      const [colRes, aliRes] = await Promise.all([
        TraerColeccionesAlimentos(id),
        TraerAlimentos(id),
      ]);
      setColecciones(colRes.data ?? []);
      setAlimentos(aliRes.data ?? []);
    } catch (err) {
      // Si la tienda no es de alimentos el backend devuelve 400
      const msg = err?.response?.data?.detail;
      if (msg) mostrarAlerta("error", msg);
      else mostrarAlerta("error", "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  /* ── Cambiar estado ── */
  const handleEstado = async (id) => {
    try {
      await CambiarEstadoColeccionAlimentos({ id_usuario: userId, id });
      mostrarAlerta("success", "Estado de la colección actualizado ✓");
      cargar(userId);
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al cambiar estado");
    }
  };

  /* ── Eliminar ── */
  const handleEliminar = async (id) => {
    const ok = window.confirm(
      "¿Eliminar esta colección?\nSe eliminarán también todas sus relaciones con alimentos."
    );
    if (!ok) return;
    try {
      await EliminarColeccionAlimentos({ id_usuario: userId, id });
      mostrarAlerta("success", "Colección eliminada ✓");
      cargar(userId);
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al eliminar");
    }
  };

  /* ── Filtrado ── */
  const filtradas = colecciones.filter((c) =>
    c.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const activas   = colecciones.filter((c) => c.estado).length;
  const inactivas = colecciones.filter((c) => !c.estado).length;

  const reload    = () => cargar(userId);
  const closeModal = () => setModal(null);

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="col-page">
        <span className="col-orb col-orb--one" aria-hidden="true" />
        <span className="col-orb col-orb--two" aria-hidden="true" />
        <span className="col-orb col-orb--three" aria-hidden="true" />

        {/* Encabezado */}
        <header className="col-header">
          <div>
            <p className="col-eyebrow">🍽️ Menú / Catálogo</p>
            <h1 className="col-title">
              Colecciones de <span>Alimentos</span>
            </h1>
            <p className="col-subtitle">
              Organiza tu menú agrupando los alimentos en colecciones
              como Entradas, Platos fuertes, Postres, etc.
            </p>
          </div>
          <button
            className="col-btn col-btn--primary col-btn--lg"
            onClick={() => setModal({ type: "crear" })}
          >
            + Nueva colección
          </button>
        </header>

        {/* Stats */}
        <div className="col-stats">
          {[
            { val: colecciones.length, label: "Total",      cls: "" },
            { val: activas,            label: "Activas",    cls: "col-stat--green" },
            { val: inactivas,          label: "Inactivas",  cls: "col-stat--gray" },
            { val: alimentos.length,   label: "Alimentos",  cls: "col-stat--blue" },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`col-stat-pill ${cls}`}>
              <span className="col-stat-pill__val">{loading ? "—" : val}</span>
              <span className="col-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="col-toolbar">
          <div className="col-search">
            <span className="col-search__icon">🔍</span>
            <input
              placeholder="Buscar colección…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="col-search__clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="col-loading">
            <div className="col-loading__spinner" />
            <p>Cargando colecciones…</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="col-empty">
            <span className="col-empty__icon">
              {colecciones.length === 0 ? "🍽️" : "🔎"}
            </span>
            <p>
              {colecciones.length === 0
                ? "Aún no tienes colecciones. ¡Crea la primera!"
                : `Sin resultados para "${search}".`}
            </p>
            {colecciones.length === 0 ? (
              <button
                className="col-btn col-btn--primary"
                onClick={() => setModal({ type: "crear" })}
              >
                + Crear primera colección
              </button>
            ) : (
              <button className="col-btn col-btn--ghost" onClick={() => setSearch("")}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="col-grid">
            {filtradas.map((col) => (
              <ColeccionCard
                key={col.id}
                col={col}
                onVer={(c)     => setModal({ type: "detalle", data: c })}
                onEditar={(c)  => setModal({ type: "editar",  data: c })}
                onEstado={handleEstado}
                onEliminar={handleEliminar}
              />
            ))}
            <button
              className="col-card col-card--new"
              onClick={() => setModal({ type: "crear" })}
            >
              <span className="col-card--new__icon">+</span>
              <span className="col-card--new__label">Nueva colección</span>
            </button>
          </div>
        )}

        {!loading && (
          <p className="col-count">
            Mostrando <strong>{filtradas.length}</strong> de{" "}
            <strong>{colecciones.length}</strong> colecciones
          </p>
        )}
      </div>

      {/* Modales */}
      {modal?.type === "crear" && (
        <ModalCrear
          userId={userId}
          alimentos={alimentos}
          onClose={closeModal}
          onCreado={reload}
        />
      )}
      {modal?.type === "editar" && (
        <ModalEditar
          coleccion={modal.data}
          userId={userId}
          onClose={closeModal}
          onEditado={reload}
        />
      )}
      {modal?.type === "detalle" && (
        <ModalDetalle
          coleccion={modal.data}
          userId={userId}
          todosAlimentos={alimentos}
          onClose={closeModal}
          onCambio={reload}
        />
      )}
    </>
  );
}

export default PaginaColeccionAlimentos;
