import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import { TraerProductos, ActualizarProducto, EliminarProducto } from "../api/axios";
import api from "../api/axios";
import "../styles/gestion-productos.css";

/* ══════════════════════════════════════════
   Constantes
══════════════════════════════════════════ */
const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "Única"];
const COLORES = ["Negro", "Blanco", "Gris", "Azul marino", "Verde oliva", "Beige", "Rojo", "Natural"];

function formatPrice(n) {
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

/* ══════════════════════════════════════════
   Sub-componentes de badges
══════════════════════════════════════════ */
function StockBadge({ stock }) {
  if (stock === 0)  return <span className="gp-badge gp-badge--danger">Sin stock</span>;
  if (stock <= 5)   return <span className="gp-badge gp-badge--warning">Bajo: {stock}</span>;
  return <span className="gp-badge gp-badge--success">{stock} uds.</span>;
}

function EstadoBadge({ estado }) {
  return (
    <span className={`gp-badge ${estado === true ? "gp-badge--active" : "gp-badge--inactive"}`}>
      {estado === true ? "Activo" : "Inactivo"}
    </span>
  );
}

function TipoBadge({ tipo }) {
  return (
    <span className={`gp-badge ${tipo === "variantes" ? "gp-badge--variant" : "gp-badge--simple"}`}>
      {tipo === "variantes" ? "🎨 Variantes" : "📦 Simple"}
    </span>
  );
}

/* ══════════════════════════════════════════
   MODAL CREAR PRODUCTO
══════════════════════════════════════════ */
function ModalCrear({ idUsuario, onClose, onCreado }) {
  /* Paso 1: elegir tipo | Paso 2: rellenar datos */
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState(null); // "simple" | "variantes"
  const [loading, setLoading] = useState(false);

  /* Campos comunes */
  const [nombre, setNombre]       = useState("");
  const [descripcion, setDesc]    = useState("");
  const [precio, setPrecio]       = useState("");

  /* Simple: solo cantidad */
  const [cantSimple, setCantSimple] = useState("");

  /* Variantes: lista de { talla, color, cantidad } */
  const [variantes, setVariantes] = useState([]);
  const [vTalla, setVTalla]       = useState(TALLAS[0]);
  const [vColor, setVColor]       = useState(COLORES[0]);
  const [vCant, setVCant]         = useState("");

  const agregarVariante = () => {
    if (!vCant || Number(vCant) < 0) return;
    const existe = variantes.find((v) => v.talla === vTalla && v.color === vColor);
    if (existe) {
      mostrarAlerta("error", `Ya existe la variante ${vTalla} / ${vColor}`);
      return;
    }
    setVariantes((prev) => [...prev, { talla: vTalla, color: vColor, cantidad: Number(vCant) }]);
    setVCant("");
  };

  const quitarVariante = (i) => setVariantes((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tipo === "variantes" && variantes.length === 0) {
      mostrarAlerta("error", "Agrega al menos una variante antes de crear el producto.");
      return;
    }
    setLoading(true);
    try {
      if (tipo === "simple") {
        // Producto simple: una sola llamada
        await CrearProducto({
          id_usuario: idUsuario,
          nombre,
          descripcion,
          precio: Number(precio),
          tipo: "simple",
          cantidad: Number(cantSimple),
        });
      } else {
        // Producto con variantes:
        // 1. Primera llamada crea el producto base + primera variante
        const primeraVariante = variantes[0];
        await api.post("/crear-producto", {
          id_usuario: idUsuario,
          nombre,
          descripcion,
          precio: Number(precio),
          tipo: "variantes",
          talla: primeraVariante.talla,
          color: primeraVariante.color,
          cantidad: primeraVariante.cantidad,
        });

        // 2. Traer el producto recién creado para obtener su id
        const productosRes = await TraerProductos(idUsuario);
        const todosProductos = productosRes.data;
        // El recién creado es el de mayor id con ese nombre
        const productoCreado = todosProductos
          .filter((p) => p.nombre === nombre)
          .sort((a, b) => b.id - a.id)[0];

        // 3. Agregar el resto de variantes con el endpoint dedicado
        if (productoCreado && variantes.length > 1) {
          for (let idx = 1; idx < variantes.length; idx++) {
            const v = variantes[idx];
            await api.post(`/agregar-variante/${productoCreado.id}`, {
              producto_id: productoCreado.id,
              talla: v.talla,
              color: v.color,
              cantidad: v.cantidad,
            });
          }
        }
      }
      mostrarAlerta("success", "Producto creado correctamente");
      onCreado();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Error al crear el producto";
      mostrarAlerta("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Cabecera ── */}
        <div className="gp-modal__header">
          <div className="gp-modal__header-left">
            <div className="gp-modal__icon">📦</div>
            <div>
              <p className="gp-modal__eyebrow">Nuevo producto</p>
              <h2 className="gp-modal__title">
                {paso === 1 ? "¿Qué tipo de producto es?" : `Crear producto ${tipo === "simple" ? "simple" : "con variantes"}`}
              </h2>
            </div>
          </div>
          <button className="gp-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* ══ PASO 1 — Elegir tipo ══ */}
        {paso === 1 && (
          <div className="gp-tipo-selector">
            <button
              type="button"
              className={`gp-tipo-card ${tipo === "simple" ? "gp-tipo-card--on" : ""}`}
              onClick={() => setTipo("simple")}
            >
              <span className="gp-tipo-card__icon">📦</span>
              <strong>Producto simple</strong>
              <small>Un solo producto con una cantidad de stock. Sin tallas ni colores.</small>
            </button>
            <button
              type="button"
              className={`gp-tipo-card ${tipo === "variantes" ? "gp-tipo-card--on" : ""}`}
              onClick={() => setTipo("variantes")}
            >
              <span className="gp-tipo-card__icon">🎨</span>
              <strong>Con variantes</strong>
              <small>El producto tiene tallas, colores o ambos. Se define stock por variante.</small>
            </button>
            <div className="gp-modal__actions">
              <button type="button" className="gp-btn gp-btn--ghost" onClick={onClose}>Cancelar</button>
              <button
                type="button"
                className="gp-btn gp-btn--primary"
                disabled={!tipo}
                onClick={() => setPaso(2)}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ══ PASO 2 — Formulario ══ */}
        {paso === 2 && (
          <form className="gp-modal__form" onSubmit={handleSubmit}>

            {/* Campos comunes */}
            <div className="gp-field gp-field--full">
              <label>Nombre del producto <span className="gp-req">*</span></label>
              <input
                required
                placeholder="Ej: Camiseta Oversize Negra"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="gp-modal__row">
              <div className="gp-field">
                <label>Precio <span className="gp-req">*</span></label>
                <div className="gp-input-prefix">
                  <span>$</span>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="89900"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                  />
                </div>
              </div>

              {/* Simple: cantidad directa */}
              {tipo === "simple" && (
                <div className="gp-field">
                  <label>Cantidad en stock <span className="gp-req">*</span></label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cantSimple}
                    onChange={(e) => setCantSimple(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="gp-field gp-field--full">
              <label>Descripción</label>
              <textarea
                rows={2}
                placeholder="Describe el producto brevemente..."
                value={descripcion}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            {/* ── Variantes ── */}
            {tipo === "variantes" && (
              <div className="gp-variantes-section">
                <p className="gp-variantes-section__title">
                  Agregar variantes <span className="gp-req">*</span>
                </p>
                <p className="gp-variantes-section__hint">
                  Selecciona talla y color, escribe la cantidad y presiona "Agregar".
                </p>

                <div className="gp-variante-builder">
                  <div className="gp-field">
                    <label>Talla</label>
                    <select value={vTalla} onChange={(e) => setVTalla(e.target.value)}>
                      {TALLAS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="gp-field">
                    <label>Color</label>
                    <select value={vColor} onChange={(e) => setVColor(e.target.value)}>
                      {COLORES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="gp-field">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={vCant}
                      onChange={(e) => setVCant(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="gp-btn gp-btn--add-variant"
                    onClick={agregarVariante}
                    disabled={!vCant}
                  >
                    + Agregar
                  </button>
                </div>

                {/* Lista de variantes agregadas */}
                {variantes.length > 0 && (
                  <div className="gp-variantes-list">
                    {variantes.map((v, i) => (
                      <div key={i} className="gp-variante-tag">
                        <span className="gp-variante-tag__talla">{v.talla}</span>
                        <span className="gp-variante-tag__color">{v.color}</span>
                        <span className="gp-variante-tag__cant">{v.cantidad} uds.</span>
                        <button
                          type="button"
                          className="gp-variante-tag__remove"
                          onClick={() => quitarVariante(i)}
                          aria-label="Quitar variante"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {variantes.length === 0 && (
                  <p className="gp-variantes-empty">Aún no has agregado variantes.</p>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="gp-modal__actions">
              <button type="button" className="gp-btn gp-btn--ghost" onClick={() => setPaso(1)}>
                ← Volver
              </button>
              <button type="submit" className="gp-btn gp-btn--primary" disabled={loading}>
                {loading ? "Creando…" : "Crear producto ✦"}
              </button>
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
function ModalEditar({ product, onClose, onActualizado }) {
  const [nombre, setNombre]    = useState(product.nombre);
  const [descripcion, setDesc] = useState(product.descripcion ?? "");
  const [precio, setPrecio]    = useState(product.precio);
  const [loading, setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ActualizarProducto(product.id, {
        nombre,
        descripcion,
        precio: Number(precio),
      });
      mostrarAlerta("success", "Producto actualizado correctamente");
      onClose();
      onActualizado();
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Error al actualizar el producto";
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
          <button className="gp-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="gp-modal__form" onSubmit={handleSubmit}>

          <div className="gp-field gp-field--full">
            <label>Nombre del producto <span className="gp-req">*</span></label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="gp-modal__row">
            <div className="gp-field">
              <label>Precio <span className="gp-req">*</span></label>
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
              <p>Las variantes (talla / color / cantidad) se administran desde <strong>Gestión de Inventario</strong>.</p>
            )}
          </div>

          <div className="gp-modal__actions">
            <button type="button" className="gp-btn gp-btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="gp-btn gp-btn--primary" disabled={loading}>
              {loading ? "Guardando…" : "Guardar cambios ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL ELIMINAR
══════════════════════════════════════════ */
function ModalEliminar({ product, onClose, onConfirm }) {
  return (
    <div className="gp-overlay" onClick={onClose}>
      <div className="gp-modal gp-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="gp-delete-icon">🗑️</div>
        <h2 className="gp-delete-title">¿Eliminar producto?</h2>
        <p className="gp-delete-desc">
          Vas a eliminar <strong>"{product.nombre}"</strong>. Esta acción no se puede deshacer y eliminará también su stock e inventario asociado.
        </p>
        <div className="gp-modal__actions">
          <button className="gp-btn gp-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="gp-btn gp-btn--danger" onClick={onConfirm}>Sí, eliminar</button>
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
  const [productos, setProductos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [username, setUsername]     = useState("");
  const [userId, setUserId]         = useState(null);
  const [search, setSearch]         = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterEst, setFilterEst]   = useState("Todos");
  const [modal, setModal]           = useState(null); // null | { type, product? }

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
    const matchTipo   = filterTipo === "Todos" || p.tipo === filterTipo;
    const matchEst    = filterEst  === "Todos"
      || (filterEst === "activo"   && p.estado === true)
      || (filterEst === "inactivo" && p.estado === false);
    return matchSearch && matchTipo && matchEst;
  });

  /* ── Stats ── */
  const totalActivos  = productos.filter((p) => p.estado === true).length;
  const sinStock      = productos.filter((p) => p.stock === 0).length;
  const stockBajo     = productos.filter((p) => p.stock > 0 && p.stock <= 5).length;

  /* ── Handlers modal ── */
  const openCrear   = () => setModal({ type: "crear" });
  const openEditar  = (p) => setModal({ type: "editar", product: p });
  const openElim    = (p) => setModal({ type: "eliminar", product: p });
  const closeModal  = () => setModal(null);

  const onProductoCreado = () => cargarProductos(userId);

  const confirmarEliminar = async () => {
    try {
      await EliminarProducto(modal.product.id);
      setProductos((prev) => prev.filter((p) => p.id !== modal.product.id));
      mostrarAlerta("success", "Producto eliminado correctamente");
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Error al eliminar el producto";
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
            <h1 className="gp-title">Gestión de <span>Productos</span></h1>
            <p className="gp-subtitle">Crea, edita y organiza todos los productos de tu tienda.</p>
          </div>
          <button className="gp-btn gp-btn--primary gp-btn--lg" onClick={openCrear}>
            + Nuevo producto
          </button>
        </header>

        {/* ── Stats ── */}
        <div className="gp-stats">
          {[
            { val: productos.length, label: "Total",      cls: "" },
            { val: totalActivos,     label: "Activos",    cls: "gp-stat-pill--green" },
            { val: sinStock,         label: "Sin stock",  cls: "gp-stat-pill--red" },
            { val: stockBajo,        label: "Stock bajo", cls: "gp-stat-pill--yellow" },
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
              <button className="gp-search__clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="gp-filters">
            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
              <option value="Todos">Todos los tipos</option>
              <option value="simple">Simple</option>
              <option value="variantes">Con variantes</option>
            </select>
            <select value={filterEst} onChange={(e) => setFilterEst(e.target.value)}>
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
            <span className="gp-empty__icon">{productos.length === 0 ? "📦" : "🔎"}</span>
            <p>
              {productos.length === 0
                ? "Aún no tienes productos. ¡Crea el primero!"
                : "No se encontraron productos con esos filtros."}
            </p>
            {productos.length > 0 && (
              <button
                className="gp-btn gp-btn--ghost"
                onClick={() => { setSearch(""); setFilterTipo("Todos"); setFilterEst("Todos"); }}
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
                    <td><TipoBadge tipo={item.tipo} /></td>
                    <td className="gp-table__price">{formatPrice(item.precio)}</td>
                    <td><StockBadge stock={item.stock} /></td>
                    <td className="gp-table__desc">{item.descripcion ?? "—"}</td>
                    <td><EstadoBadge estado={item.estado} /></td>
                    <td>
                      <div className="gp-table__actions">
                        <button
                          className="gp-icon-btn gp-icon-btn--edit"
                          title="Editar"
                          onClick={() => openEditar(item)}
                        >✏️</button>
                        <button
                          className="gp-icon-btn gp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => openElim(item)}
                        >🗑️</button>
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
            Mostrando <strong>{filtered.length}</strong> de <strong>{productos.length}</strong> productos
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
          onClose={closeModal}
          onActualizado={() => cargarProductos(userId)}
        />
      )}
      {modal?.type === "eliminar" && (
        <ModalEliminar
          product={modal.product}
          onClose={closeModal}
          onConfirm={confirmarEliminar}
        />
      )}
    </>
  );
}

export default PaginaGestionProductos;
