import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerColecciones,
  CrearColeccion,
  ModificarColeccion,
  TraerProductosColeccion,
  AgregarProductosColeccion,
  EliminarProductoColeccion,
  CambiarEstadoColeccion,
  TraerProductos,
  EliminarColeccion,
} from "../api/axios";
import "../styles/colecciones.css";

/* ══════════════════════════════════════════
   Helpers
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
   MODAL CREAR COLECCIÓN
══════════════════════════════════════════ */
function ModalCrear({ userId, productos, onClose, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDesc] = useState("");
  const [seleccionados, setSelec] = useState([]); // ids de productos
  const [loading, setLoading] = useState(false);

  const toggleProducto = (id) =>
    setSelec((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await CrearColeccion({
        id_usuario: userId,
        nombre,
        descripcion,
        producto_id: seleccionados.length > 0 ? seleccionados : null,
      });
      mostrarAlerta("success", "Colección creada correctamente");
      onCreado();
      onClose();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al crear la colección",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-overlay" onClick={onClose}>
      <div className="col-modal" onClick={(e) => e.stopPropagation()}>
        <div className="col-modal__header">
          <div className="col-modal__header-left">
            <div className="col-modal__icon">🗃️</div>
            <div>
              <p className="col-modal__eyebrow">Nueva colección</p>
              <h2 className="col-modal__title">Crear colección</h2>
            </div>
          </div>
          <button className="col-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="col-modal__form" onSubmit={handleSubmit}>
          <div className="col-field col-field--full">
            <label>
              Nombre <span className="col-req">*</span>
            </label>
            <input
              required
              placeholder="Ej: Colección Verano 2026"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="col-field col-field--full">
            <label>Descripción</label>
            <textarea
              rows={2}
              placeholder="Describe brevemente la colección…"
              value={descripcion}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Selector de productos */}
          <div className="col-field col-field--full">
            <label>
              Agregar productos <span className="col-opt">(opcional)</span>
            </label>
            {productos.length === 0 ? (
              <p className="col-empty-hint">
                No tienes productos aún. Puedes agregarlos después.
              </p>
            ) : (
              <div className="col-product-picker">
                {productos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`col-product-chip ${seleccionados.includes(p.id) ? "col-product-chip--on" : ""}`}
                    onClick={() => toggleProducto(p.id)}
                  >
                    <span
                      className="col-product-chip__letter"
                      style={{ "--hue": (p.id * 57) % 360 }}
                    >
                      {p.nombre[0].toUpperCase()}
                    </span>
                    <span className="col-product-chip__name">{p.nombre}</span>
                    {seleccionados.includes(p.id) && (
                      <span className="col-product-chip__check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {seleccionados.length > 0 && (
              <p className="col-sel-count">
                {seleccionados.length} producto(s) seleccionado(s)
              </p>
            )}
          </div>

          <div className="col-modal__actions">
            <button
              type="button"
              className="col-btn col-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="col-btn col-btn--primary"
              disabled={loading}
            >
              {loading ? "Creando…" : "Crear colección ✦"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL EDITAR COLECCIÓN
══════════════════════════════════════════ */
function ModalEditar({ coleccion, userId, onClose, onEditado }) {
  const [nombre, setNombre] = useState(coleccion.nombre);
  const [descripcion, setDesc] = useState(coleccion.descripcion ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ModificarColeccion({
        id_usuario: userId,
        id: coleccion.id,
        nombre,
        descripcion,
      });
      mostrarAlerta("success", "Colección actualizada");
      onEditado();
      onClose();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al actualizar",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-overlay" onClick={onClose}>
      <div
        className="col-modal col-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="col-modal__header">
          <div className="col-modal__header-left">
            <div className="col-modal__icon">✏️</div>
            <div>
              <p className="col-modal__eyebrow">Editando colección</p>
              <h2 className="col-modal__title">{coleccion.nombre}</h2>
            </div>
          </div>
          <button className="col-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="col-modal__form" onSubmit={handleSubmit}>
          <div className="col-field col-field--full">
            <label>
              Nombre <span className="col-req">*</span>
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="col-field col-field--full">
            <label>Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="col-modal__actions">
            <button
              type="button"
              className="col-btn col-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="col-btn col-btn--primary"
              disabled={loading}
            >
              {loading ? "Guardando…" : "Guardar cambios ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL DETALLE — Ver y gestionar productos
   de una colección existente
══════════════════════════════════════════ */
function ModalDetalle({
  coleccion,
  userId,
  todosProductos,
  onClose,
  onCambio,
}) {
  const [productosCol, setProductosCol] = useState([]); // { id, coleccion_id, producto_id }
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [selAdd, setSelAdd] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await TraerProductosColeccion({
        id_usuario: userId,
        coleccion_id: coleccion.id,
      });
      setProductosCol(res.data);
    } catch {
      mostrarAlerta("error", "Error al cargar los productos de la colección");
    } finally {
      setLoading(false);
    }
  };

  /* Ids ya en la colección */
  const idsEnCol = productosCol.map((r) => r.producto_id);

  /* Productos disponibles para agregar (que no están ya en la colección) */
  const disponibles = todosProductos.filter((p) => !idsEnCol.includes(p.id));

  /* Nombre de un producto por su id */
  const nombreProducto = (id) =>
    todosProductos.find((p) => p.id === id)?.nombre ?? `#${id}`;

  const toggleAdd = (id) =>
    setSelAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  /* Agregar productos seleccionados */
  const confirmarAgregar = async () => {
    if (selAdd.length === 0) return;
    setSaving(true);
    try {
      await AgregarProductosColeccion({
        id_usuario: userId,
        coleccion_id: coleccion.id,
        producto_id: selAdd,
      });
      mostrarAlerta("success", `${selAdd.length} producto(s) agregado(s)`);
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

  /* Quitar producto de la colección */
  const quitarProducto = async (productoId) => {
    try {
      await EliminarProductoColeccion({
        id_usuario: userId,
        coleccion_id: coleccion.id,
        producto_id: productoId,
      });
      mostrarAlerta("success", "Producto quitado de la colección");
      await cargar();
      onCambio();
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al quitar el producto",
      );
    }
  };

  return (
    <div className="col-overlay" onClick={onClose}>
      <div
        className="col-modal col-modal--lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="col-modal__header">
          <div className="col-modal__header-left">
            <div className="col-modal__icon col-modal__icon--big">🗃️</div>
            <div>
              <p className="col-modal__eyebrow">Colección</p>
              <h2 className="col-modal__title">{coleccion.nombre}</h2>
              {coleccion.descripcion && (
                <p className="col-modal__desc">{coleccion.descripcion}</p>
              )}
            </div>
          </div>
          <button className="col-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="col-modal__body">
          {/* Barra sección productos */}
          <div className="col-section-bar">
            <span className="col-section-bar__label">
              Productos en esta colección
              <span className="col-section-bar__count">
                {loading ? "…" : productosCol.length}
              </span>
            </span>
            {!addMode && disponibles.length > 0 && (
              <button className="col-btn-link" onClick={() => setAddMode(true)}>
                + Agregar productos
              </button>
            )}
          </div>

          {/* Panel agregar */}
          {addMode && (
            <div className="col-add-panel">
              <p className="col-add-panel__hint">
                Selecciona los productos que quieres agregar:
              </p>
              <div className="col-product-picker">
                {disponibles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`col-product-chip ${selAdd.includes(p.id) ? "col-product-chip--on" : ""}`}
                    onClick={() => toggleAdd(p.id)}
                  >
                    <span
                      className="col-product-chip__letter"
                      style={{ "--hue": (p.id * 57) % 360 }}
                    >
                      {p.nombre[0].toUpperCase()}
                    </span>
                    <span className="col-product-chip__name">{p.nombre}</span>
                    {selAdd.includes(p.id) && (
                      <span className="col-product-chip__check">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="col-add-panel__actions">
                <button
                  className="col-btn col-btn--ghost"
                  onClick={() => {
                    setAddMode(false);
                    setSelAdd([]);
                  }}
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
                    : `Agregar ${selAdd.length > 0 ? `(${selAdd.length})` : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* Lista productos actuales */}
          {loading ? (
            <div className="col-loading">
              <div className="col-loading__spinner" />
              <p>Cargando productos…</p>
            </div>
          ) : productosCol.length === 0 ? (
            <div className="col-empty-products">
              <span>📦</span>
              <p>Esta colección no tiene productos aún.</p>
            </div>
          ) : (
            <ul className="col-product-list">
              {productosCol.map((rel) => (
                <li key={rel.id} className="col-product-row">
                  <div
                    className="col-product-row__thumb"
                    style={{ "--hue": (rel.producto_id * 57) % 360 }}
                  >
                    {nombreProducto(rel.producto_id)[0]?.toUpperCase()}
                  </div>
                  <span className="col-product-row__name">
                    {nombreProducto(rel.producto_id)}
                  </span>
                  <button
                    className="col-product-row__remove"
                    title="Quitar de la colección"
                    onClick={() => quitarProducto(rel.producto_id)}
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
function ColeccionCard({ col, onVer, onEditar, cambiarestado, eliminar }) {
  const navigate = useNavigate();

  return (
    <article className="col-card" onClick={() => onVer(col)}>
      {/* Decoración de fondo */}
      <div
        className="col-card__bg-circle"
        style={{ "--hue": (col.id * 83) % 360 }}
      />

      <div className="col-card__top">
        <div
          className="col-card__icon"
          style={{ "--hue": (col.id * 83) % 360 }}
        >
          🗃️
        </div>
        <div className="col-card__badges">
          <span
            className={`col-badge ${col.estado ? "col-badge--active" : "col-badge--inactive"}`}
          >
            {col.estado ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>

      <h3 className="col-card__name">{col.nombre}</h3>

      {col.descripcion ? (
        <p className="col-card__desc">{col.descripcion}</p>
      ) : (
        <p className="col-card__desc col-card__desc--empty">Sin descripción</p>
      )}

      <div className="col-card__footer">
        <span className="col-card__date">{formatDate(col.fecha_creacion)}</span>
        <div className="col-card__actions">
          <button
            className="col-card__btn col-card__btn--edit"
            title="Editar colección"
            onClick={(e) => {
              e.stopPropagation();
              onEditar(col);
            }}
          >
            ✏️
          </button>
          <button
            className={`col-card__btn ${col.estado ? "col-card__btn--deactivate" : "col-card__btn--activate"}`}
            title={col.estado ? "Desactivar colección" : "Activar colección"}
            onClick={(e) => {
              e.stopPropagation();
              cambiarestado(col.id);
            }}
          >
            {col.estado ? "🚫 Desactivar" : "✅ Activar"}
          </button>
          <button
            className="col-card__btn col-card__btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              eliminar(col.id);
            }}
          >
            🗑️
          </button>
          <button
            className="col-card__btn col-card__btn--view"
            onClick={(e) => {
              e.stopPropagation();
              onVer(col);
            }}
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
function PaginaColecciones() {
  const navigate = useNavigate();
  const [colecciones, setColecciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | { type, data? }

  const cambiarestado = async (idcoleccion) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      mostrarAlerta("error", "token no existe");
      return navigate("/login");
    }
    const decode = jwtDecode(token);
    try {
      const res = await CambiarEstadoColeccion({
        id_usuario: decode.id,
        id: idcoleccion,
      });
      cargar(decode.id);
      mostrarAlerta("success", "coleccion cambio de estado");
    } catch (err) {
      mostrarAlerta(
        "error",
        "error al cambiar estado de la coleccion, intente mas tarde",
      );
    }
  };

  const eliminarcoleccion = async (idcoleccion) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      mostrarAlerta("error", "token no existe");
      return navigate("/login");
    }
    const decode = jwtDecode(token);
    try {
      const res = await EliminarColeccion({
        id_usuario: decode.id,
        id: idcoleccion,
      });
      cargar(decode.id);
      mostrarAlerta("success", "coleccion eliminada");
    } catch (err) {
      console.log(err.response);
      mostrarAlerta(
        "error",
        "error al eliminar la coleccion, intente mas tarde",
      );
    }
  };

  /* ── Auth + carga ── */
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
      const [colRes, prodRes] = await Promise.all([
        TraerColecciones(id),
        TraerProductos(id),
      ]);
      setColecciones(colRes.data);
      setProductos(prodRes.data);
    } catch {
      mostrarAlerta("error", "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  /* Filtrado */
  const filtered = colecciones.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  /* Stats */
  const activas = colecciones.filter((c) => c.estado).length;
  const inactivas = colecciones.filter((c) => !c.estado).length;

  /* Handlers modales */
  const closeModal = () => setModal(null);
  const reload = () => cargar(userId);

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="col-page">
        <span className="col-orb col-orb--one" aria-hidden="true" />
        <span className="col-orb col-orb--two" aria-hidden="true" />
        <span className="col-orb col-orb--three" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="col-header">
          <div>
            <p className="col-eyebrow">🗃️ Catálogo</p>
            <h1 className="col-title">
              Gestión de <span>Colecciones</span>
            </h1>
            <p className="col-subtitle">
              Agrupa tus productos en colecciones para organizarlos mejor en tu
              tienda.
            </p>
          </div>
          <button
            className="col-btn col-btn--primary col-btn--lg"
            onClick={() => setModal({ type: "crear" })}
          >
            + Nueva colección
          </button>
        </header>

        {/* ── Stats ── */}
        <div className="col-stats">
          {[
            { val: colecciones.length, label: "Total", cls: "" },
            { val: activas, label: "Activas", cls: "col-stat--green" },
            { val: inactivas, label: "Inactivas", cls: "col-stat--gray" },
            {
              val: productos.length,
              label: "Productos",
              cls: "col-stat--blue",
            },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`col-stat-pill ${cls}`}>
              <span className="col-stat-pill__val">{loading ? "—" : val}</span>
              <span className="col-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Buscador ── */}
        <div className="col-toolbar">
          <div className="col-search">
            <span className="col-search__icon">🔍</span>
            <input
              placeholder="Buscar colección…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="col-search__clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Contenido ── */}
        {loading ? (
          <div className="col-loading">
            <div className="col-loading__spinner" />
            <p>Cargando colecciones…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-empty">
            <span className="col-empty__icon">
              {colecciones.length === 0 ? "🗃️" : "🔎"}
            </span>
            <p>
              {colecciones.length === 0
                ? "Aún no tienes colecciones. ¡Crea la primera!"
                : "No se encontraron colecciones con ese nombre."}
            </p>
            {colecciones.length === 0 && (
              <button
                className="col-btn col-btn--primary"
                onClick={() => setModal({ type: "crear" })}
              >
                + Crear primera colección
              </button>
            )}
            {colecciones.length > 0 && (
              <button
                className="col-btn col-btn--ghost"
                onClick={() => setSearch("")}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="col-grid">
            {filtered.map((col) => (
              <ColeccionCard
                key={col.id}
                col={col}
                onVer={(c) => setModal({ type: "detalle", data: c })}
                onEditar={(c) => setModal({ type: "editar", data: c })}
                cambiarestado={() => cambiarestado(col.id)}
                eliminar={() => eliminarcoleccion(col.id)}
              />
            ))}

            {/* Tarjeta CTA para crear nueva */}
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
            Mostrando <strong>{filtered.length}</strong> de{" "}
            <strong>{colecciones.length}</strong> colecciones
          </p>
        )}
      </div>

      {/* ── Modales ── */}
      {modal?.type === "crear" && (
        <ModalCrear
          userId={userId}
          productos={productos}
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
          todosProductos={productos}
          onClose={closeModal}
          onCambio={reload}
        />
      )}
    </>
  );
}

export default PaginaColecciones;
