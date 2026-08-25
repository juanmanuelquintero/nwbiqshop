import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerProductos,
  ActualizarProducto,
  CambiarEstadoProducto,
  CrearProducto,
  AgregarVariante,
  AgregarTalla,
} from "../api/axios";
import "../styles/gestion-productos.css";

const TALLAS  = ["XS","S","M","L","XL","XXL","28","30","32","34","Única"];
const COLORES = ["Negro","Blanco","Gris","Azul marino","Verde oliva","Beige","Rojo","Natural"];

function formatPrice(n) { return `$ ${Number(n).toLocaleString("es-CO")}`; }

function StockBadge({ stock }) {
  if (stock === 0) return <span className="gp-badge gp-badge--danger">Sin stock</span>;
  if (stock <= 5)  return <span className="gp-badge gp-badge--warning">Bajo: {stock}</span>;
  return <span className="gp-badge gp-badge--success">{stock} uds.</span>;
}
function EstadoBadge({ estado }) {
  return <span className={`gp-badge ${estado ? "gp-badge--active" : "gp-badge--inactive"}`}>{estado ? "Activo" : "Inactivo"}</span>;
}
function TipoBadge({ tipo }) {
  return <span className={`gp-badge ${tipo === "variantes" ? "gp-badge--variant" : "gp-badge--simple"}`}>{tipo === "variantes" ? "🎨 Variantes" : "📦 Simple"}</span>;
}
function ImagenInput({ label, value, onChange }) {
  const tieneImagen = value !== null && value !== undefined && value !== "";
  const previewSrc  = tieneImagen ? (typeof value === "string" ? value : URL.createObjectURL(value)) : null;
  return (
    <div className="gp-field">
      <label>{label}</label>
      <div className="gp-img-wrapper">
        {tieneImagen ? (
          <div className="gp-img-preview">
            <img src={previewSrc} alt="preview" />
            <button type="button" className="gp-img-preview__remove" onClick={() => onChange(null)}>✕</button>
          </div>
        ) : (
          <label className="gp-img-upload">
            <div className="gp-img-placeholder"><span>🖼️</span><small>Seleccionar imagen</small></div>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) onChange(f); e.target.value = ""; }} />
          </label>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL CREAR PRODUCTO
   Nueva estructura: Producto → ProductoColores → ProductoVariante
   Un color tiene: color, marca, referencia, imagen + N tallas
══════════════════════════════════════════ */
function ModalCrear({ idUsuario, onClose, onCreado }) {
  const [paso,    setPaso]    = useState(1);
  const [tipo,    setTipo]    = useState(null);
  const [loading, setLoading] = useState(false);

  // Campos comunes
  const [nombre,      setNombre]      = useState("");
  const [descripcion, setDesc]        = useState("");
  const [precio,      setPrecio]      = useState("");

  // Simple
  const [cantSimple,  setCantSimple]  = useState("");
  const [marcaSimple, setMarcaSimple] = useState("");
  const [refSimple,   setRefSimple]   = useState("");
  const [imgSimple,   setImgSimple]   = useState(null);

  // Colores (cada uno tiene tallas)
  // colores: [{ color, marca, referencia, imagen: File|null, tallas: [{talla, cantidad}] }]
  const [colores, setColores] = useState([]);

  // Builder para color en curso
  const [bColor, setBColor] = useState(COLORES[0]);
  const [bMarca, setBMarca] = useState("");
  const [bRef,   setBRef]   = useState("");
  const [bImg,   setBImg]   = useState(null);
  // Builder para talla en curso
  const [bTalla, setBTalla] = useState(TALLAS[0]);
  const [bCant,  setBCant]  = useState("");
  // tallas pendientes antes de confirmar el color
  const [tallasTemp, setTallasTemp] = useState([]);

  const agregarTallaTemp = () => {
    if (!bCant || Number(bCant) < 0) return;
    if (tallasTemp.find(t => t.talla === bTalla)) {
      mostrarAlerta("error", `Ya agregaste la talla ${bTalla} para este color`); return;
    }
    setTallasTemp(prev => [...prev, { talla: bTalla, cantidad: Number(bCant) }]);
    setBCant("");
  };

  const confirmarColor = () => {
    if (tallasTemp.length === 0) { mostrarAlerta("error", "Agrega al menos una talla para este color"); return; }
    if (colores.find(c => c.color === bColor)) { mostrarAlerta("error", `Ya existe el color ${bColor}`); return; }
    setColores(prev => [...prev, { color: bColor, marca: bMarca, referencia: bRef, imagen: bImg, tallas: tallasTemp }]);
    setBMarca(""); setBRef(""); setBImg(null); setTallasTemp([]);
  };

  const quitarColor = (i) => setColores(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tipo === "variantes" && colores.length === 0) {
      mostrarAlerta("error", "Agrega al menos un color antes de crear el producto."); return;
    }
    setLoading(true);
    try {
      if (tipo === "simple") {
        const form = new FormData();
        form.append("id_usuario", idUsuario);
        form.append("nombre", nombre);
        form.append("descripcion", descripcion);
        form.append("precio", Number(precio));
        form.append("tipo", "simple");
        form.append("cantidad", Number(cantSimple));
        if (marcaSimple) form.append("marca", marcaSimple);
        if (refSimple)   form.append("referencia", refSimple);
        if (imgSimple)   form.append("imagen", imgSimple);
        await CrearProducto(form);
      } else {
        // Crear producto con el primer color + primera talla
        const primerColor = colores[0];
        const primeraTalla = primerColor.tallas[0];
        const form = new FormData();
        form.append("id_usuario",  idUsuario);
        form.append("nombre",      nombre);
        form.append("descripcion", descripcion);
        form.append("precio",      Number(precio));
        form.append("tipo",        "variantes");
        form.append("cantidad",    primeraTalla.cantidad);
        if (primeraTalla.talla)      form.append("talla",     primeraTalla.talla);
        if (primerColor.color)       form.append("color",     primerColor.color);
        if (primerColor.marca)       form.append("marca",     primerColor.marca);
        if (primerColor.referencia)  form.append("referencia",primerColor.referencia);
        if (primerColor.imagen)      form.append("imagen",    primerColor.imagen);
        const resCrear = await CrearProducto(form);
        const productoId = resCrear.data?.id;

        // Para el primer color, agregar las tallas adicionales vía /agregar-talla
        // Primero obtenemos el id_color del producto recién creado
        const resProductos = await TraerProductos(idUsuario);
        const productoCreado = resProductos.data
          .filter(p => p.nombre === nombre)
          .sort((a, b) => b.id - a.id)[0];

        // Importar TraerVariantes para obtener el id_color del primer color creado
        const { TraerVariantes: TV } = await import("../api/axios");
        const resVariantes = await TV(productoCreado.id, idUsuario);
        const primerColorObj = resVariantes.data[0]; // { id_color, color, tallas: [...] }

        // Tallas adicionales del primer color
        for (let k = 1; k < primerColor.tallas.length; k++) {
          const t = primerColor.tallas[k];
          await AgregarTalla({ id_usuario: idUsuario, id_color: primerColorObj.id_color, talla: t.talla, cantidad: t.cantidad });
        }

        // Colores adicionales
        for (let ci = 1; ci < colores.length; ci++) {
          const c = colores[ci];
          const colorForm = new FormData();
          colorForm.append("id_usuario", idUsuario);
          if (c.color)      colorForm.append("color",     c.color);
          if (c.marca)      colorForm.append("marca",     c.marca);
          if (c.referencia) colorForm.append("referencia",c.referencia);
          if (c.imagen)     colorForm.append("imagen",    c.imagen);
          const resColor = await AgregarVariante(productoCreado.id, colorForm);
          const nuevoColorId = resColor.data?.id;
          // Tallas del color adicional
          for (const t of c.tallas) {
            await AgregarTalla({ id_usuario: idUsuario, id_color: nuevoColorId, talla: t.talla, cantidad: t.cantidad });
          }
        }
      }
      mostrarAlerta("success", "Producto creado correctamente");
      onCreado(); onClose();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-modal gp-modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="gp-modal__header">
          <div className="gp-modal__header-left">
            <div className="gp-modal__icon">📦</div>
            <div>
              <p className="gp-modal__eyebrow">Nuevo producto</p>
              <h2 className="gp-modal__title">
                {paso === 1 ? "¿Qué tipo de producto es?" : `Crear producto ${tipo === "simple" ? "simple" : "con colores y tallas"}`}
              </h2>
            </div>
          </div>
          <button className="gp-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* PASO 1 — tipo */}
        {paso === 1 && (
          <div className="gp-tipo-selector">
            <button type="button" className={`gp-tipo-card ${tipo === "simple" ? "gp-tipo-card--on" : ""}`} onClick={() => setTipo("simple")}>
              <span className="gp-tipo-card__icon">📦</span>
              <strong>Producto simple</strong>
              <small>Un solo producto con una cantidad de stock. Sin tallas ni colores.</small>
            </button>
            <button type="button" className={`gp-tipo-card ${tipo === "variantes" ? "gp-tipo-card--on" : ""}`} onClick={() => setTipo("variantes")}>
              <span className="gp-tipo-card__icon">🎨</span>
              <strong>Con colores y tallas</strong>
              <small>El producto tiene colores, cada color puede tener varias tallas con su propio stock.</small>
            </button>
            <div className="gp-modal__actions">
              <button type="button" className="gp-btn gp-btn--ghost" onClick={onClose}>Cancelar</button>
              <button type="button" className="gp-btn gp-btn--primary" disabled={!tipo} onClick={() => setPaso(2)}>Continuar →</button>
            </div>
          </div>
        )}

        {/* PASO 2 — formulario */}
        {paso === 2 && (
          <form className="gp-modal__form" onSubmit={handleSubmit}>
            {/* Nombre + precio */}
            <div className="gp-modal__row gp-modal__row--2">
              <div className="gp-field gp-field--full">
                <label>Nombre del producto <span className="gp-req">*</span></label>
                <input required placeholder="Ej: Camiseta Oversize Negra" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="gp-field">
                <label>Precio <span className="gp-req">*</span></label>
                <div className="gp-input-prefix"><span>$</span><input required type="number" min="0" placeholder="89900" value={precio} onChange={(e) => setPrecio(e.target.value)} /></div>
              </div>
              {tipo === "simple" && (
                <div className="gp-field">
                  <label>Cantidad en stock <span className="gp-req">*</span></label>
                  <input required type="number" min="0" placeholder="0" value={cantSimple} onChange={(e) => setCantSimple(e.target.value)} />
                </div>
              )}
            </div>

            <div className="gp-field gp-field--full">
              <label>Descripción</label>
              <textarea rows={2} placeholder="Describe el producto brevemente..." value={descripcion} onChange={(e) => setDesc(e.target.value)} />
            </div>

            {/* Simple: marca, ref, imagen */}
            {tipo === "simple" && (
              <div className="gp-modal__row">
                <div className="gp-field"><label>Marca</label><input placeholder="Nike, Adidas…" value={marcaSimple} onChange={(e) => setMarcaSimple(e.target.value)} /></div>
                <div className="gp-field"><label>Referencia</label><input placeholder="REF-001" value={refSimple} onChange={(e) => setRefSimple(e.target.value)} /></div>
                <ImagenInput label="Imagen del producto" value={imgSimple} onChange={setImgSimple} />
              </div>
            )}

            {/* Variantes: colores + tallas */}
            {tipo === "variantes" && (
              <div className="gp-variantes-section">
                <p className="gp-variantes-section__title">Agregar colores y tallas <span className="gp-req">*</span></p>
                <p className="gp-variantes-section__hint">Define cada color con su imagen, marca y referencia. Luego agrega las tallas disponibles para ese color.</p>

                {/* Builder de color actual */}
                <div className="gp-color-builder">
                  <p className="gp-color-builder__label">🎨 Configurar color</p>
                  <div className="gp-variante-builder gp-variante-builder--lg">
                    <div className="gp-field"><label>Color</label>
                      <select value={bColor} onChange={(e) => setBColor(e.target.value)}>{COLORES.map(c => <option key={c}>{c}</option>)}</select>
                    </div>
                    <div className="gp-field"><label>Marca</label><input placeholder="Opcional" value={bMarca} onChange={(e) => setBMarca(e.target.value)} /></div>
                    <div className="gp-field"><label>Referencia</label><input placeholder="Opcional" value={bRef} onChange={(e) => setBRef(e.target.value)} /></div>
                    <ImagenInput label="Imagen del color" value={bImg} onChange={setBImg} />
                  </div>

                  {/* Tallas para este color */}
                  <p className="gp-color-builder__label">📐 Tallas para este color</p>
                  <div className="gp-variante-builder">
                    <div className="gp-field"><label>Talla</label>
                      <select value={bTalla} onChange={(e) => setBTalla(e.target.value)}>{TALLAS.map(t => <option key={t}>{t}</option>)}</select>
                    </div>
                    <div className="gp-field"><label>Cantidad</label>
                      <input type="number" min="0" placeholder="0" value={bCant} onChange={(e) => setBCant(e.target.value)} />
                    </div>
                    <button type="button" className="gp-btn gp-btn--add-variant" onClick={agregarTallaTemp} disabled={!bCant}>+ Agregar talla</button>
                  </div>

                  {tallasTemp.length > 0 && (
                    <div className="gp-variantes-list">
                      {tallasTemp.map((t, i) => (
                        <div key={i} className="gp-variante-tag">
                          <span className="gp-variante-tag__talla">{t.talla}</span>
                          <span className="gp-variante-tag__cant">{t.cantidad} uds.</span>
                          <button type="button" className="gp-variante-tag__remove" onClick={() => setTallasTemp(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" className="gp-btn gp-btn--primary" style={{ marginTop: "8px" }} onClick={confirmarColor}>
                    ✓ Confirmar color "{bColor}"
                  </button>
                </div>

                {/* Colores confirmados */}
                {colores.length > 0 && (
                  <div className="gp-colores-confirmados">
                    <p className="gp-variantes-section__hint">Colores agregados:</p>
                    {colores.map((c, i) => (
                      <div key={i} className="gp-color-tag">
                        {c.imagen && <img src={URL.createObjectURL(c.imagen)} className="gp-variante-tag__img" alt="" />}
                        <div>
                          <strong>{c.color}</strong>
                          <span style={{ marginLeft: 8, fontSize: "0.8rem", opacity: 0.7 }}>{c.tallas.map(t => `${t.talla}(${t.cantidad})`).join(" · ")}</span>
                        </div>
                        <button type="button" className="gp-variante-tag__remove" onClick={() => quitarColor(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="gp-modal__actions">
              <button type="button" className="gp-btn gp-btn--ghost" onClick={() => setPaso(1)}>← Volver</button>
              <button type="submit" className="gp-btn gp-btn--primary" disabled={loading}>{loading ? "Creando…" : "Crear producto ✦"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL EDITAR PRODUCTO
   Solo edita nombre, descripción, precio.
   El stock se gestiona desde Inventario.
══════════════════════════════════════════ */
function ModalEditar({ product, userId, onClose, onActualizado }) {
  const [nombre, setNombre] = useState(product.nombre);
  const [descripcion, setDesc] = useState(product.descripcion ?? "");
  const [precio, setPrecio] = useState(product.precio);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ActualizarProducto(product.id, {
        id_usuario: userId,
        nombre,
        descripcion,
        precio: Number(precio),
      });
      mostrarAlerta("success", "Producto actualizado correctamente");
      onClose();
      onActualizado();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ?? "Error al actualizar el producto";
      mostrarAlerta("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gp-modal__header">
          <div className="gp-modal__header-left">
            <div className="gp-modal__icon">✏️</div>
            <div>
              <p className="gp-modal__eyebrow">Editando producto</p>
              <h2 className="gp-modal__title">{product.nombre}</h2>
            </div>
          </div>
          <button
            className="gp-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form className="gp-modal__form" onSubmit={handleSubmit}>
          <div className="gp-field gp-field--full">
            <label>
              Nombre del producto <span className="gp-req">*</span>
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="gp-modal__row">
            <div className="gp-field">
              <label>
                Precio <span className="gp-req">*</span>
              </label>
              <div className="gp-input-prefix">
                <span>$</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
            </div>

            {/* Stock en modo sólo lectura */}
            <div className="gp-field">
              <label>Stock total</label>
              <div className="gp-stock-readonly">
                <span className="gp-stock-readonly__val">{product.stock}</span>
                <span className="gp-stock-readonly__hint">
                  🔒 Modifica las cantidades desde{" "}
                  <strong>Gestión de Inventario</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="gp-field gp-field--full">
            <label>Descripción</label>
            <textarea
              rows={3}
              placeholder="Describe el producto brevemente..."
              value={descripcion}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Info tipo */}
          <div className="gp-edit-tipo-info">
            <TipoBadge tipo={product.tipo} />
            {product.tipo === "variantes" && (
              <p>
                Las variantes (talla / color / cantidad) se administran desde{" "}
                <strong>Gestión de Inventario</strong>.
              </p>
            )}
          </div>

          <div className="gp-modal__actions">
            <button
              type="button"
              className="gp-btn gp-btn--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="gp-btn gp-btn--primary"
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
   MODAL CAMBIAR ESTADO
   Activa o desactiva el producto sin borrar datos.
══════════════════════════════════════════ */
function ModalCambiarEstado({ product, onClose, onConfirm }) {
  const activando = product.estado === false; // si está inactivo → va a activar
  return (
    <div className="gp-overlay" onClick={onClose}>
      <div
        className="gp-modal gp-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gp-delete-icon">{activando ? "✅" : "🚫"}</div>
        <h2 className="gp-delete-title">
          {activando ? "¿Activar producto?" : "¿Desactivar producto?"}
        </h2>
        <p className="gp-delete-desc">
          {activando ? (
            <>
              El producto <strong>"{product.nombre}"</strong> volverá a estar
              visible en tu tienda.
            </>
          ) : (
            <>
              El producto <strong>"{product.nombre}"</strong> dejará de
              mostrarse en tu tienda. Puedes reactivarlo cuando quieras.
            </>
          )}
        </p>
        <div className="gp-modal__actions">
          <button className="gp-btn gp-btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`gp-btn ${activando ? "gp-btn--activate" : "gp-btn--deactivate"}`}
            onClick={onConfirm}
          >
            {activando ? "Sí, activar" : "Sí, desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
function PaginaGestionProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterEst, setFilterEst] = useState("Todos");
  const [modal, setModal] = useState(null); // null | { type, product? }

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
    cargarProductos(decode.id);
  }, []);

  const cargarProductos = async (id) => {
    setLoading(true);
    try {
      const res = await TraerProductos(id);
      setProductos(res.data);
    } catch {
      mostrarAlerta("error", "Error al traer los productos");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtrado ── */
  const filtered = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "Todos" || p.tipo === filterTipo;
    const matchEst =
      filterEst === "Todos" ||
      (filterEst === "activo" && p.estado === true) ||
      (filterEst === "inactivo" && p.estado === false);
    return matchSearch && matchTipo && matchEst;
  });

  /* ── Stats ── */
  const totalActivos = productos.filter((p) => p.estado === true).length;
  const sinStock = productos.filter((p) => p.stock === 0).length;
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 5).length;

  /* ── Handlers modal ── */
  const openCrear = () => setModal({ type: "crear" });
  const openEditar = (p) => setModal({ type: "editar", product: p });
  const openEstado = (p) => setModal({ type: "estado", product: p });
  const closeModal = () => setModal(null);

  const onProductoCreado = () => cargarProductos(userId);

  const confirmarCambioEstado = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      mostrarAlerta("error", "token no existe");
      return navigate("/login");
    }
    const decode = jwtDecode(token);
    try {
      const res = await CambiarEstadoProducto(modal.product.id, decode.id);
      const nuevoEstado = res.data.estado;
      setProductos((prev) =>
        prev.map((p) =>
          p.id === modal.product.id ? { ...p, estado: nuevoEstado } : p,
        ),
      );
      mostrarAlerta("success", res.data.mensaje ?? "Estado actualizado");
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Error al cambiar el estado";
      mostrarAlerta("error", msg);
    } finally {
      closeModal();
    }
  };

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="gp-page">
        <span className="gp-orb gp-orb--one" aria-hidden="true" />
        <span className="gp-orb gp-orb--two" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="gp-header">
          <div className="gp-header__left">
            <p className="gp-eyebrow">📦 Catálogo</p>
            <h1 className="gp-title">
              Gestión de <span>Productos</span>
            </h1>
            <p className="gp-subtitle">
              Crea, edita y organiza todos los productos de tu tienda.
            </p>
          </div>
          <button
            className="gp-btn gp-btn--primary gp-btn--lg"
            onClick={openCrear}
          >
            + Nuevo producto
          </button>
        </header>

        {/* ── Stats ── */}
        <div className="gp-stats">
          {[
            { val: productos.length, label: "Total", cls: "" },
            { val: totalActivos, label: "Activos", cls: "gp-stat-pill--green" },
            { val: sinStock, label: "Sin stock", cls: "gp-stat-pill--red" },
            {
              val: stockBajo,
              label: "Stock bajo",
              cls: "gp-stat-pill--yellow",
            },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`gp-stat-pill ${cls}`}>
              <span className="gp-stat-pill__val">{loading ? "—" : val}</span>
              <span className="gp-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Barra de filtros ── */}
        <div className="gp-toolbar">
          <div className="gp-search">
            <span className="gp-search__icon">🔍</span>
            <input
              placeholder="Buscar por nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="gp-search__clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
          <div className="gp-filters">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="Todos">Todos los tipos</option>
              <option value="simple">Simple</option>
              <option value="variantes">Con variantes</option>
            </select>
            <select
              value={filterEst}
              onChange={(e) => setFilterEst(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* ── Contenido ── */}
        {loading ? (
          <div className="gp-loading">
            <div className="gp-loading__spinner" />
            <p>Cargando productos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gp-empty">
            <span className="gp-empty__icon">
              {productos.length === 0 ? "📦" : "🔎"}
            </span>
            <p>
              {productos.length === 0
                ? "Aún no tienes productos. ¡Crea el primero!"
                : "No se encontraron productos con esos filtros."}
            </p>
            {productos.length > 0 && (
              <button
                className="gp-btn gp-btn--ghost"
                onClick={() => {
                  setSearch("");
                  setFilterTipo("Todos");
                  setFilterEst("Todos");
                }}
              >
                Limpiar filtros
              </button>
            )}
            {productos.length === 0 && (
              <button className="gp-btn gp-btn--primary" onClick={openCrear}>
                + Crear primer producto
              </button>
            )}
          </div>
        ) : (
          <div className="gp-table-wrap">
            <table className="gp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className="gp-table__row">
                    <td className="gp-table__num">{i + 1}</td>
                    <td>
                      <div className="gp-table__product">
                        <div
                          className="gp-table__thumb"
                          style={{ "--hue": (item.id * 57) % 360 }}
                          aria-hidden="true"
                        >
                          {item.nombre[0].toUpperCase()}
                        </div>
                        <strong>{item.nombre}</strong>
                      </div>
                    </td>
                    <td>
                      <TipoBadge tipo={item.tipo} />
                    </td>
                    <td className="gp-table__price">
                      {formatPrice(item.precio)}
                    </td>
                    <td>
                      <StockBadge stock={item.stock} />
                    </td>
                    <td className="gp-table__desc">
                      {item.descripcion ?? "—"}
                    </td>
                    <td>
                      <EstadoBadge estado={item.estado} />
                    </td>
                    <td>
                      <div className="gp-table__actions">
                        <button
                          className="gp-icon-btn gp-icon-btn--edit"
                          title="Editar"
                          onClick={() => openEditar(item)}
                        >
                          ✏️
                        </button>
                        <button
                          className={`gp-icon-btn ${item.estado ? "gp-icon-btn--deactivate" : "gp-icon-btn--activate"}`}
                          title={
                            item.estado
                              ? "Desactivar producto"
                              : "Activar producto"
                          }
                          onClick={() => openEstado(item)}
                        >
                          {item.estado ? "🚫" : "✅"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <p className="gp-count">
            Mostrando <strong>{filtered.length}</strong> de{" "}
            <strong>{productos.length}</strong> productos
          </p>
        )}
      </div>

      {/* ── Modales ── */}
      {modal?.type === "crear" && (
        <ModalCrear
          idUsuario={userId}
          onClose={closeModal}
          onCreado={onProductoCreado}
        />
      )}
      {modal?.type === "editar" && (
        <ModalEditar
          product={modal.product}
          userId={userId}
          onClose={closeModal}
          onActualizado={() => cargarProductos(userId)}
        />
      )}
      {modal?.type === "estado" && (
        <ModalCambiarEstado
          product={modal.product}
          onClose={closeModal}
          onConfirm={confirmarCambioEstado}
        />
      )}
    </>
  );
}

export default PaginaGestionProductos;
