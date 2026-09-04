import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerAlimentos,
  CrearAlimento,
  ModificarAlimento,
  CambiarEstadoAlimento,
  ModificarIngrediente,
} from "../api/axios";
import "../styles/alimentos.css";

/* ══════════════════════════════════════════
   Constantes
══════════════════════════════════════════ */
const FORM_VACIO = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagenFile: null,      // File subido por el usuario
  imagenPreview: null,   // URL para previsualizar
  imagenActual: null,    // URL guardada en BD (solo en edición)
  imagenBorrada: false,  // usuario quitó la imagen actual
  tiempo_preparacion: "",
  disponible: true,
  ingredientes: [],
};
const INGREDIENTE_VACIO = {
  nombre: "",
  descripcion: "",
  cantidad: "",
  unidad: "",
};

/* ══════════════════════════════════════════
   Validación
══════════════════════════════════════════ */
function validarForm(form) {
  const e = {};
  if (!form.nombre?.trim()) e.nombre = "El nombre es obligatorio.";
  if (!form.precio && form.precio !== 0) e.precio = "El precio es obligatorio.";
  else if (Number(form.precio) < 0)
    e.precio = "El precio no puede ser negativo.";
  if (
    form.tiempo_preparacion !== "" &&
    form.tiempo_preparacion !== null &&
    Number(form.tiempo_preparacion) < 0
  )
    e.tiempo_preparacion = "El tiempo no puede ser negativo.";
  return e;
}

/* ══════════════════════════════════════════
   FilaIngrediente — edición inline
══════════════════════════════════════════ */
function FilaIngrediente({ ing, userId, onGuardado }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: ing.nombre ?? "",
    cantidad: ing.cantidad ?? "",
    unidad: ing.unidad ?? "",
    descripcion: ing.descripcion ?? "",
  });
  const [errores, setErrores] = useState({});

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errores[name]) setErrores((p) => ({ ...p, [name]: undefined }));
  };

  const cancelar = () => {
    setForm({
      nombre: ing.nombre ?? "",
      cantidad: ing.cantidad ?? "",
      unidad: ing.unidad ?? "",
      descripcion: ing.descripcion ?? "",
    });
    setErrores({});
    setEditando(false);
  };

  const guardar = async () => {
    const errs = {};
    if (!form.nombre?.trim()) errs.nombre = true;
    if (!form.cantidad || Number(form.cantidad) <= 0) errs.cantidad = true;
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      mostrarAlerta("warning", "Nombre y cantidad son obligatorios.");
      return;
    }
    setGuardando(true);
    try {
      await ModificarIngrediente(ing.id, {
        id_usuario: userId,
        nombre: form.nombre.trim(),
        cantidad: Number(form.cantidad),
        unidad: form.unidad?.trim() || null,
        descripcion: form.descripcion?.trim() || null,
      });
      mostrarAlerta("success", `Ingrediente "${form.nombre}" actualizado ✓`);
      setEditando(false);
      onGuardado({
        ...ing,
        nombre: form.nombre.trim(),
        cantidad: Number(form.cantidad),
        unidad: form.unidad?.trim() || null,
        descripcion: form.descripcion?.trim() || null,
      });
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al actualizar el ingrediente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!editando) {
    return (
      <li className="ali-ing-item">
        <div className="ali-ing-item__info">
          <strong>{ing.nombre}</strong>
          <span>
            {ing.cantidad == 0 ? "" : `${ing.cantidad}`}
            {ing.unidad ? ` ${ing.unidad}` : ""}
            {ing.descripcion ? ` · ${ing.descripcion}` : ""}
          </span>
        </div>
        <button
          type="button"
          className="ali-btn ali-btn--sm ali-btn--edit"
          onClick={() => setEditando(true)}
          title="Editar ingrediente"
        >
          ✏️
        </button>
      </li>
    );
  }

  return (
    <li className="ali-ing-item ali-ing-item--editing">
      <div className="ali-ing-edit-grid">
        <div className="ali-ing-edit-field">
          <label>
            Nombre <span className="ali-req">*</span>
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleField}
            placeholder="Nombre"
            className={errores.nombre ? "ali-input--error" : ""}
          />
        </div>
        <div className="ali-ing-edit-field">
          <label>
            Cantidad <span className="ali-req">*</span>
          </label>
          <input
            name="cantidad"
            type="number"
            value={form.cantidad}
            onChange={handleField}
            placeholder="Cantidad"
            min={0}
            className={errores.cantidad ? "ali-input--error" : ""}
          />
        </div>
        <div className="ali-ing-edit-field">
          <label>
            Unidad <span className="ali-opt">(opcional)</span>
          </label>
          <input
            name="unidad"
            value={form.unidad}
            onChange={handleField}
            placeholder="g, ml…"
          />
        </div>
        <div className="ali-ing-edit-field ali-ing-edit-field--wide">
          <label>
            Nota <span className="ali-opt">(opcional)</span>
          </label>
          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleField}
            placeholder="Nota opcional"
          />
        </div>
      </div>
      <div className="ali-ing-edit-actions">
        <button
          type="button"
          className="ali-btn ali-btn--sm ali-btn--primary"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? "…" : "✓ Guardar"}
        </button>
        <button
          type="button"
          className="ali-btn ali-btn--sm ali-btn--ghost"
          onClick={cancelar}
          disabled={guardando}
        >
          Cancelar
        </button>
      </div>
    </li>
  );
}

/* ══════════════════════════════════════════
   Modal Crear / Modificar
══════════════════════════════════════════ */
function ModalAlimento({ modo, datos, userId, onClose, onGuardar, loading }) {
  const [form, setForm] = useState({ ...datos });
  const [errores, setErrores] = useState({});
  const [nuevoIng, setNuevoIng] = useState({ ...INGREDIENTE_VACIO });
  const [erroresIng, setErroresIng] = useState({});
  const [ingredientesLocales, setIngredientesLocales] = useState(
    datos.ingredientes ?? [],
  );

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errores[name]) setErrores((p) => ({ ...p, [name]: undefined }));
  };
  const handleIngField = (e) => {
    const { name, value } = e.target;
    setNuevoIng((p) => ({ ...p, [name]: value }));
    if (erroresIng[name]) setErroresIng((p) => ({ ...p, [name]: undefined }));
  };

  const agregarIngrediente = () => {
    const errs = {};
    if (!nuevoIng.nombre?.trim()) errs.nombre = true;
    if (Object.keys(errs).length > 0) {
      setErroresIng(errs);
      mostrarAlerta(
        "warning",
        "El nombre y la cantidad del ingrediente son obligatorios.",
      );
      return;
    }
    setForm((p) => ({
      ...p,
      ingredientes: [
        ...(p.ingredientes ?? []),
        {
          nombre: nuevoIng.nombre.trim(),
          descripcion: nuevoIng.descripcion?.trim() || null,
          cantidad: Number(nuevoIng.cantidad),
          unidad: nuevoIng.unidad?.trim() || null,
        },
      ],
    }));
    setNuevoIng({ ...INGREDIENTE_VACIO });
    setErroresIng({});
  };

  const quitarIngrediente = (idx) =>
    setForm((p) => ({
      ...p,
      ingredientes: p.ingredientes.filter((_, i) => i !== idx),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validarForm(form);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      mostrarAlerta(
        "warning",
        "Corrige los campos marcados antes de continuar.",
      );
      return;
    }
    onGuardar({
      ...form,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      precio: Number(form.precio),
      imagenFile: form.imagenFile ?? null,
      imagen_borrada: form.imagenBorrada ? "1" : undefined,
      tiempo_preparacion:
        form.tiempo_preparacion !== "" && form.tiempo_preparacion !== null
          ? Number(form.tiempo_preparacion)
          : null,
    });
  };

  return (
    <div className="ali-overlay" onClick={onClose}>
      <div className="ali-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="ali-modal__header">
          <div className="ali-modal__header-left">
            <div className="ali-modal__icon">
              {modo === "crear" ? "➕" : "✏️"}
            </div>
            <div>
              <p className="ali-modal__eyebrow">
                {modo === "crear" ? "Nuevo alimento" : "Editando alimento"}
              </p>
              <h2 className="ali-modal__title">
                {modo === "crear" ? "Crear alimento" : datos.nombre}
              </h2>
            </div>
          </div>
          <button
            className="ali-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form className="ali-modal__form" onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className="ali-field">
            <label htmlFor="f-nombre">
              Nombre <span className="ali-req">*</span>
            </label>
            <input
              id="f-nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleField}
              placeholder="Ej: Hamburguesa clásica"
              className={errores.nombre ? "ali-input--error" : ""}
            />
            {errores.nombre && (
              <span className="ali-field-error">{errores.nombre}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="ali-field">
            <label htmlFor="f-desc">
              Descripción <span className="ali-opt">(opcional)</span>
            </label>
            <textarea
              id="f-desc"
              name="descripcion"
              value={form.descripcion ?? ""}
              onChange={handleField}
              rows={2}
              placeholder="Describe brevemente el alimento…"
            />
          </div>

          {/* Precio + Tiempo */}
          <div className="ali-field-row">
            <div className="ali-field">
              <label htmlFor="f-precio">
                Precio <span className="ali-req">*</span> ($)
              </label>
              <input
                id="f-precio"
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleField}
                min={0}
                placeholder="0"
                className={errores.precio ? "ali-input--error" : ""}
              />
              {errores.precio && (
                <span className="ali-field-error">{errores.precio}</span>
              )}
            </div>
            <div className="ali-field">
              <label htmlFor="f-tiempo">
                Tiempo preparación <span className="ali-opt">(min)</span>
              </label>
              <input
                id="f-tiempo"
                type="number"
                name="tiempo_preparacion"
                value={form.tiempo_preparacion ?? ""}
                onChange={handleField}
                min={0}
                placeholder="ej: 15"
                className={errores.tiempo_preparacion ? "ali-input--error" : ""}
              />
              {errores.tiempo_preparacion && (
                <span className="ali-field-error">
                  {errores.tiempo_preparacion}
                </span>
              )}
            </div>
          </div>

          {/* Imagen — subida de archivo */}
          <div className="ali-field">
            <label>Imagen <span className="ali-opt">(opcional)</span></label>

            {/* Preview de imagen seleccionada o imagen actual guardada */}
            {(form.imagenPreview || (form.imagenActual && !form.imagenBorrada)) ? (
              <div className="ali-img-preview">
                <img
                  src={form.imagenPreview ?? form.imagenActual}
                  alt="Preview"
                />
                <button
                  type="button"
                  className="ali-img-preview__remove"
                  title="Quitar imagen"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      imagenFile: null,
                      imagenPreview: null,
                      imagenBorrada: !!p.imagenActual,
                    }))
                  }
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="ali-img-upload-label" htmlFor="f-img-file">
                <span>📷 Seleccionar imagen</span>
                <input
                  id="f-img-file"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setForm((p) => ({
                      ...p,
                      imagenFile: file,
                      imagenPreview: URL.createObjectURL(file),
                      imagenBorrada: false,
                    }));
                  }}
                />
              </label>
            )}
          </div>

          {/* Disponible — solo modificar */}
          {modo === "modificar" && (
            <div className="ali-field ali-field--check">
              <input
                type="checkbox"
                id="f-disponible"
                name="disponible"
                checked={!!form.disponible}
                onChange={handleField}
              />
              <label htmlFor="f-disponible">Disponible para la venta</label>
            </div>
          )}

          {/* Ingredientes existentes — solo modificar */}
          {modo === "modificar" && ingredientesLocales.length > 0 && (
            <div className="ali-field">
              <label>Ingredientes</label>
              <div className="ali-ing-section">
                <p className="ali-ing-section__hint">
                  Haz clic en ✏️ para editar un ingrediente directamente.
                </p>
                <ul className="ali-ing-list">
                  {ingredientesLocales.map((ing) => (
                    <FilaIngrediente
                      key={ing.id}
                      ing={ing}
                      userId={userId}
                      onGuardado={(upd) =>
                        setIngredientesLocales((p) =>
                          p.map((i) => (i.id === upd.id ? upd : i)),
                        )
                      }
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Ingredientes nuevos — solo crear */}
          {modo === "crear" && (
            <div className="ali-field">
              <label>
                Ingredientes <span className="ali-opt">(opcional)</span>
              </label>
              <div className="ali-ing-section">
                <p className="ali-ing-section__hint">
                  Nombre es obligatorios · Cantidad, unidad y nota son
                  opcionales.
                </p>
                <div className="ali-ing-grid">
                  <input
                    name="nombre"
                    value={nuevoIng.nombre}
                    onChange={handleIngField}
                    placeholder="Ingrediente *"
                    className={erroresIng.nombre ? "ali-input--error" : ""}
                  />
                  <input
                    name="cantidad"
                    type="number"
                    value={nuevoIng.cantidad}
                    onChange={handleIngField}
                    placeholder="Cantidad *"
                    min={0}
                    className={erroresIng.cantidad ? "ali-input--error" : ""}
                  />
                  <input
                    name="unidad"
                    value={nuevoIng.unidad}
                    onChange={handleIngField}
                    placeholder="Unidad (g, ml…)"
                  />
                  <input
                    name="descripcion"
                    value={nuevoIng.descripcion}
                    onChange={handleIngField}
                    placeholder="Nota (opcional)"
                  />
                  <button
                    type="button"
                    className="ali-btn ali-btn--sm ali-btn--primary"
                    onClick={agregarIngrediente}
                  >
                    + Agregar
                  </button>
                </div>

                {form.ingredientes?.length > 0 && (
                  <ul className="ali-ing-list">
                    {form.ingredientes.map((ing, idx) => (
                      <li key={idx} className="ali-ing-item">
                        <div className="ali-ing-item__info">
                          <strong>{ing.nombre}</strong>
                          <span>
                            {ing.cantidad == 0 ? "" : `${ing.cantidad}`}
                            {ing.unidad ? ` ${ing.unidad}` : ""}
                            {ing.descripcion ? ` · ${ing.descripcion}` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ali-ing-item__remove"
                          onClick={() => quitarIngrediente(idx)}
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="ali-modal__actions">
            <button
              type="button"
              className="ali-btn ali-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ali-btn ali-btn--primary"
              disabled={loading}
            >
              {loading
                ? "Guardando…"
                : modo === "crear"
                  ? "Crear alimento ✦"
                  : "Guardar cambios ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Tarjeta de alimento
══════════════════════════════════════════ */
function AlimentoCard({ alimento, onEditar, onEstado }) {
  return (
    <article
      className={`ali-card ${!alimento.estado ? "ali-card--inactivo" : ""}`}
    >
      {/* Imagen */}
      {alimento.imagen ? (
        <img
          src={alimento.imagen}
          alt={alimento.nombre}
          className="ali-card__img"
        />
      ) : (
        <div className="ali-card__img-placeholder">🍽️</div>
      )}

      {/* Cuerpo */}
      <div className="ali-card__body">
        <div className="ali-card__top">
          <h3 className="ali-card__name">{alimento.nombre}</h3>
          <div className="ali-card__badges">
            <span
              className={`ali-badge ${alimento.estado ? "ali-badge--green" : "ali-badge--red"}`}
            >
              {alimento.estado ? "Activo" : "Inactivo"}
            </span>
            <span
              className={`ali-badge ${alimento.disponible ? "ali-badge--blue" : "ali-badge--gray"}`}
            >
              {alimento.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
        </div>

        {alimento.descripcion ? (
          <p className="ali-card__desc">{alimento.descripcion}</p>
        ) : (
          <p className="ali-card__desc ali-card__desc--empty">
            Sin descripción
          </p>
        )}

        <div className="ali-card__meta">
          <span className="ali-card__price">
            ${Number(alimento.precio ?? 0).toLocaleString("es-CO")}
          </span>
          {alimento.tiempo_preparacion != null && (
            <span className="ali-card__time">
              ⏱ {alimento.tiempo_preparacion} min
            </span>
          )}
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="ali-card__footer">
        <button
          className="ali-btn ali-btn--sm ali-btn--edit"
          onClick={() => onEditar(alimento)}
          title="Editar"
        >
          ✏️ Editar
        </button>
        <button
          className={`ali-btn ali-btn--sm ${alimento.estado ? "ali-btn--danger" : "ali-btn--success"}`}
          onClick={() => onEstado(alimento)}
          title={alimento.estado ? "Inhabilitar" : "Habilitar"}
        >
          {alimento.estado ? "🚫 Inhabilitar" : "✅ Habilitar"}
        </button>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaAlimentos() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);

  /* ── Auth ── */
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
      const res = await TraerAlimentos(id);
      setAlimentos(res.data ?? []);
    } catch {
      mostrarAlerta(
        "error",
        "Error al cargar los alimentos. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (form) => {
    setSaving(true);
    try {
      await CrearAlimento({ ...form, id_usuario: userId });
      mostrarAlerta("success", "Alimento creado correctamente ✓");
      setModal(null);
      cargar(userId);
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al crear el alimento.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleModificar = async (form) => {
    setSaving(true);
    try {
      await ModificarAlimento(modal.id, { ...form, id_usuario: userId });
      mostrarAlerta("success", "Alimento actualizado correctamente ✓");
      setModal(null);
      cargar(userId);
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al modificar el alimento.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (alimento) => {
    const accion = alimento.estado ? "inhabilitar" : "habilitar";
    if (
      !window.confirm(
        `¿Deseas ${accion} "${alimento.nombre}"?\nEsta acción se puede revertir.`,
      )
    )
      return;
    try {
      await CambiarEstadoAlimento(alimento.id, {
        id_usuario: userId,
        estado: !alimento.estado,
      });
      mostrarAlerta(
        "success",
        `"${alimento.nombre}" ${alimento.estado ? "inhabilitado" : "habilitado"} ✓`,
      );
      cargar(userId);
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al cambiar el estado.",
      );
    }
  };

  const abrirModificar = (alimento) => {
    setModal({
      modo: "modificar",
      id: alimento.id,
      datos: {
        nombre: alimento.nombre ?? "",
        descripcion: alimento.descripcion ?? "",
        precio: alimento.precio ?? "",
        imagenFile: null,
        imagenPreview: null,
        imagenActual: alimento.imagen ?? null,
        imagenBorrada: false,
        tiempo_preparacion: alimento.tiempo_preparacion ?? "",
        disponible: alimento.disponible ?? true,
        ingredientes: alimento.ingredientes ?? [],
      },
    });
  };

  /* Stats */
  const activos = alimentos.filter((a) => a.estado).length;
  const inactivos = alimentos.filter((a) => !a.estado).length;
  const disponibles = alimentos.filter((a) => a.disponible && a.estado).length;

  /* Filtro */
  const filtrados = alimentos.filter((a) =>
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="ali-page">
        <span className="ali-orb ali-orb--one" aria-hidden="true" />
        <span className="ali-orb ali-orb--two" aria-hidden="true" />
        <span className="ali-orb ali-orb--three" aria-hidden="true" />

        {/* Encabezado */}
        <header className="ali-header">
          <div>
            <p className="ali-eyebrow">🍽️ Gestión</p>
            <h1 className="ali-title">
              Catálogo de <span>Alimentos</span>
            </h1>
            <p className="ali-subtitle">
              Administra los alimentos de tu tienda.
            </p>
          </div>
          <button
            className="ali-btn ali-btn--primary ali-btn--lg"
            onClick={() =>
              setModal({ modo: "crear", datos: { ...FORM_VACIO } })
            }
          >
            + Nuevo alimento
          </button>
        </header>

        {/* Stats */}
        <div className="ali-stats">
          {[
            { val: alimentos.length, label: "Total", cls: "" },
            { val: activos, label: "Activos", cls: "ali-stat--green" },
            { val: inactivos, label: "Inactivos", cls: "ali-stat--gray" },
            { val: disponibles, label: "Disponibles", cls: "ali-stat--orange" },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`ali-stat-pill ${cls}`}>
              <span className="ali-stat-pill__val">{loading ? "—" : val}</span>
              <span className="ali-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="ali-toolbar">
          <div className="ali-search-wrap">
            <span className="ali-search-wrap__icon">🔍</span>
            <input
              placeholder="Buscar alimento por nombre…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar alimento"
            />
            {busqueda && (
              <button
                className="ali-search-wrap__clear"
                onClick={() => setBusqueda("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="ali-loading">
            <div className="ali-loading__spinner" />
            <p>Cargando alimentos…</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="ali-empty">
            <span className="ali-empty__icon">
              {alimentos.length === 0 ? "🍽️" : "🔎"}
            </span>
            <p>
              {alimentos.length === 0
                ? "Aún no tienes alimentos. ¡Crea el primero!"
                : `Sin resultados para "${busqueda}".`}
            </p>
            {alimentos.length === 0 ? (
              <button
                className="ali-btn ali-btn--primary"
                onClick={() =>
                  setModal({ modo: "crear", datos: { ...FORM_VACIO } })
                }
              >
                + Crear el primero
              </button>
            ) : (
              <button
                className="ali-btn ali-btn--ghost"
                onClick={() => setBusqueda("")}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="ali-grid">
            {filtrados.map((alimento) => (
              <AlimentoCard
                key={alimento.id}
                alimento={alimento}
                onEditar={abrirModificar}
                onEstado={handleEstado}
              />
            ))}
            {/* Tarjeta CTA */}
            <button
              className="ali-card ali-card--new"
              onClick={() =>
                setModal({ modo: "crear", datos: { ...FORM_VACIO } })
              }
            >
              <span className="ali-card--new__icon">+</span>
              <span className="ali-card--new__label">Nuevo alimento</span>
            </button>
          </div>
        )}

        {!loading && (
          <p className="ali-count">
            Mostrando <strong>{filtrados.length}</strong> de{" "}
            <strong>{alimentos.length}</strong> alimentos
          </p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ModalAlimento
          modo={modal.modo}
          datos={modal.datos}
          userId={userId}
          onClose={() => setModal(null)}
          onGuardar={modal.modo === "crear" ? handleCrear : handleModificar}
          loading={saving}
        />
      )}
    </>
  );
}

export default PaginaAlimentos;
