import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import {
  TraerProductos,
  TraerVariantes,
  AgregarVariante,
  AgregarTalla,
  ModificarColor,
  ModificarVariante,
  ModificarSimple,
  EliminarVariante,
  EliminarColor,
} from "../api/axios";
import "../styles/inventario.css";

const TALLAS  = ["XS","S","M","L","XL","XXL","28","30","32","34","Única"];
const COLORES = ["Negro","Blanco","Gris","Azul marino","Verde oliva","Beige","Rojo","Natural"];

function formatPrice(n) { return `$ ${Number(n).toLocaleString("es-CO")}`; }

function StockBadge({ stock }) {
  if (stock === 0) return <span className="inv-badge inv-badge--danger">Sin stock</span>;
  if (stock <= 5)  return <span className="inv-badge inv-badge--warning">Bajo: {stock}</span>;
  return <span className="inv-badge inv-badge--success">{stock} uds.</span>;
}
function TipoBadge({ tipo }) {
  return <span className={`inv-badge ${tipo === "variantes" ? "inv-badge--variant" : "inv-badge--simple"}`}>{tipo === "variantes" ? "🎨 Variantes" : "📦 Simple"}</span>;
}

function InvImagenInput({ value, onChange }) {
  const tieneImagen = value !== null && value !== undefined && value !== "";
  const previewSrc  = tieneImagen ? (typeof value === "string" ? value : URL.createObjectURL(value)) : null;
  return (
    <div className="inv-img-wrapper">
      {tieneImagen ? (
        <div className="inv-img-preview">
          <img src={previewSrc} alt="preview" />
          <button type="button" className="inv-img-preview__remove" onClick={() => onChange(null)}>✕</button>
        </div>
      ) : (
        <label className="inv-img-upload" title="Seleccionar imagen">
          <div className="inv-img-placeholder"><span>🖼️</span></div>
          <input type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files[0]; if (f) onChange(f); e.target.value = ""; }} />
        </label>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL DE INVENTARIO — nueva estructura
   Para variantes: muestra Colores → Tallas
   Para simple: muestra el stock directo
══════════════════════════════════════════ */
function ModalInventario({ producto, userId, onClose, onGuardado }) {
  const navigate   = useNavigate();
  const [stockData,    setStockData]    = useState([]);   // array de colores (con .tallas dentro)
  const [loadingStock, setLoadingStock] = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [eliminando,   setEliminando]   = useState(null); // { tipo: "color"|"talla"|"simple", id }

  // Agregar nuevo color
  const [mostrarAgregarColor, setMostrarAgregarColor] = useState(false);
  const [nColor, setNColor] = useState(COLORES[0]);
  const [nMarca, setNMarca] = useState("");
  const [nRef,   setNRef]   = useState("");
  const [nImg,   setNImg]   = useState(null);
  const [addColorLoading, setAddColorLoading] = useState(false);
  // tallas del nuevo color
  const [nTallasTemp,  setNTallasTemp]  = useState([]);
  const [nTalla,       setNTalla]       = useState(TALLAS[0]);
  const [nCant,        setNCant]        = useState("");

  // Agregar talla a color existente
  const [agregarTallaColorId, setAgregarTallaColorId] = useState(null);
  const [aTalla, setATalla] = useState(TALLAS[0]);
  const [aCant,  setACant]  = useState("");

  useEffect(() => { cargarStock(); }, []);

  const getToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) { mostrarAlerta("error", "token no existe"); navigate("/login"); return null; }
    return jwtDecode(token);
  };

  const cargarStock = async () => {
    setLoadingStock(true);
    const decode = getToken();
    if (!decode) return;
    try {
      const res = await TraerVariantes(producto.id, decode.id);
      if (producto.tipo === "variantes") {
        // res.data = [{ id_color, color, marca, referencia, imagen, tallas:[{id,talla,cantidad}] }]
        setStockData(res.data.map(c => ({
          ...c,
          _editando: false,
          _imgFile:  null,
          _imgBorrada: false,
        })));
      } else {
        // simple: res.data = [{ id, producto_id, cantidad, marca, referencia, imagen }]
        setStockData(res.data.map(r => ({ ...r, _editando: false, _imgFile: null, _imgBorrada: false })));
      }
    } catch {
      mostrarAlerta("error", "Error al cargar el inventario del producto");
    } finally {
      setLoadingStock(false);
    }
  };

  const setColorField = (idx, key, val) =>
    setStockData(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

  // ── Guardar color (marca, ref, imagen) ──
  const guardarColor = async (idx) => {
    const fila = stockData[idx];
    setSaving(true);
    const decode = getToken(); if (!decode) return;
    try {
      const form = new FormData();
      form.append("id_usuario", decode.id);
      form.append("id_color",   fila.id_color);
      if (fila.color)     form.append("color",     fila.color);
      if (fila.marca)     form.append("marca",     fila.marca);
      if (fila.referencia)form.append("referencia",fila.referencia);
      if (fila._imgFile) {
        form.append("imagen", fila._imgFile);
      } else if (fila._imgBorrada) {
        form.append("imagen_borrada", "1");
      }
      await ModificarColor(form);
      mostrarAlerta("success", "Color guardado correctamente");
      await cargarStock(); onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al guardar");
    } finally { setSaving(false); }
  };

  // ── Guardar talla (cantidad/talla) ──
  const guardarTalla = async (colorIdx, tallaIdx) => {
    const t = stockData[colorIdx].tallas[tallaIdx];
    setSaving(true);
    const decode = getToken(); if (!decode) return;
    try {
      await ModificarVariante({ id_usuario: decode.id, id: t.id, talla: t.talla, cantidad: Number(t.cantidad) });
      mostrarAlerta("success", "Talla guardada correctamente");
      await cargarStock(); onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al guardar");
    } finally { setSaving(false); }
  };

  // ── Guardar simple ──
  const guardarSimple = async (idx) => {
    const fila = stockData[idx];
    setSaving(true);
    const decode = getToken(); if (!decode) return;
    try {
      const form = new FormData();
      form.append("id_usuario", decode.id);
      form.append("id",         fila.id);
      form.append("cantidad",   Number(fila.cantidad));
      if (fila.marca)      form.append("marca",     fila.marca);
      if (fila.referencia) form.append("referencia",fila.referencia);
      if (fila._imgFile) {
        form.append("imagen", fila._imgFile);
      } else if (fila._imgBorrada) {
        form.append("imagen_borrada", "1");
      }
      await ModificarSimple(form);
      mostrarAlerta("success", "Guardado correctamente");
      await cargarStock(); onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al guardar");
    } finally { setSaving(false); }
  };

  // ── Agregar talla al nuevo color (temp) ──
  const agregarTallaTemp = () => {
    if (!nCant || Number(nCant) < 0) return;
    if (nTallasTemp.find(t => t.talla === nTalla)) { mostrarAlerta("error", `Ya tienes la talla ${nTalla}`); return; }
    setNTallasTemp(prev => [...prev, { talla: nTalla, cantidad: Number(nCant) }]);
    setNCant("");
  };

  // ── Agregar nuevo color al producto ──
  const agregarColor = async () => {
    if (nTallasTemp.length === 0) { mostrarAlerta("error", "Agrega al menos una talla para este color"); return; }
    setAddColorLoading(true);
    const decode = getToken(); if (!decode) return;
    try {
      const form = new FormData();
      form.append("id_usuario", decode.id);
      if (nColor) form.append("color",     nColor);
      if (nMarca) form.append("marca",     nMarca);
      if (nRef)   form.append("referencia",nRef);
      if (nImg)   form.append("imagen",    nImg);
      const res = await AgregarVariante(producto.id, form);
      const nuevoColorId = res.data?.id;
      // Agregar las tallas al nuevo color
      for (const t of nTallasTemp) {
        await AgregarTalla({ id_usuario: decode.id, id_color: nuevoColorId, talla: t.talla, cantidad: t.cantidad });
      }
      mostrarAlerta("success", `Color ${nColor} agregado`);
      setNMarca(""); setNRef(""); setNImg(null); setNTallasTemp([]); setMostrarAgregarColor(false);
      await cargarStock(); onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al agregar color");
    } finally { setAddColorLoading(false); }
  };

  // ── Agregar talla a color existente ──
  const agregarTallaAColor = async (colorId) => {
    if (!aCant || Number(aCant) < 0) return;
    const decode = getToken(); if (!decode) return;
    try {
      await AgregarTalla({ id_usuario: decode.id, id_color: colorId, talla: aTalla, cantidad: Number(aCant) });
      mostrarAlerta("success", `Talla ${aTalla} agregada`);
      setACant(""); setAgregarTallaColorId(null);
      await cargarStock(); onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al agregar talla");
    }
  };

  // ── Eliminar ──
  const confirmarEliminar = async () => {
    const decode = getToken(); if (!decode) return;
    try {
      if (eliminando.tipo === "color") {
        await EliminarColor(eliminando.id, decode.id);
        mostrarAlerta("success", "Color eliminado");
      } else {
        // talla o simple
        await EliminarVariante(eliminando.id, decode.id);
        mostrarAlerta("success", eliminando.tipo === "simple" ? "Eliminado" : "Talla eliminada");
      }
      setEliminando(null);
      await cargarStock(); onGuardado();
    } catch (err) {
      mostrarAlerta("error", err?.response?.data?.detail ?? "Error al eliminar");
      setEliminando(null);
    }
  };

  // Tallas editables inline — las guardamos en state local de stockData
  const setTallaField = (colorIdx, tallaIdx, key, val) =>
    setStockData(prev => prev.map((c, ci) =>
      ci !== colorIdx ? c : {
        ...c,
        tallas: c.tallas.map((t, ti) => ti !== tallaIdx ? t : { ...t, [key]: val })
      }
    ));

  const esVariante  = producto.tipo === "variantes";
  const stockTotal  = esVariante
    ? stockData.reduce((a, c) => a + (c.tallas ?? []).reduce((b, t) => b + Number(t.cantidad ?? 0), 0), 0)
    : stockData.reduce((a, r) => a + Number(r.cantidad ?? 0), 0);

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal inv-modal--lg" onClick={e => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="inv-modal__header">
          <div className="inv-modal__header-left">
            <div className="inv-modal__thumb" style={{ "--hue": (producto.id * 57) % 360 }}>
              {producto.nombre[0].toUpperCase()}
            </div>
            <div>
              <p className="inv-modal__eyebrow">Gestión de Inventario</p>
              <h2 className="inv-modal__title">{producto.nombre}</h2>
              <div className="inv-modal__meta">
                <TipoBadge tipo={producto.tipo} />
                <span className="inv-modal__price">{formatPrice(producto.precio)}</span>
                <span className="inv-modal__total-stock">Stock total: <strong>{loadingStock ? "…" : stockTotal}</strong></span>
              </div>
            </div>
          </div>
          <button className="inv-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Cuerpo */}
        <div className="inv-modal__body">
          {loadingStock ? (
            <div className="inv-loading"><div className="inv-loading__spinner" /><p>Cargando inventario…</p></div>
          ) : (
            <>

              {/* ══ VARIANTES: colores + tallas ══ */}
              {esVariante && (
                <>
                  <div className="inv-section-label">
                    <span>Colores y tallas</span>
                    <button className="inv-btn-link" onClick={() => setMostrarAgregarColor(v => !v)}>
                      {mostrarAgregarColor ? "— Cancelar" : "+ Agregar color"}
                    </button>
                  </div>

                  {/* Formulario agregar color */}
                  {mostrarAgregarColor && (
                    <div className="inv-add-variante">
                      <p style={{ fontWeight: 700, marginBottom: 8 }}>🎨 Nuevo color</p>
                      <div className="inv-add-variante__grid inv-add-variante__grid--lg">
                        <div className="inv-field"><label>Color</label>
                          <select value={nColor} onChange={e => setNColor(e.target.value)}>{COLORES.map(c => <option key={c}>{c}</option>)}</select>
                        </div>
                        <div className="inv-field"><label>Marca</label><input placeholder="Opcional" value={nMarca} onChange={e => setNMarca(e.target.value)} /></div>
                        <div className="inv-field"><label>Referencia</label><input placeholder="Opcional" value={nRef} onChange={e => setNRef(e.target.value)} /></div>
                        <div className="inv-field"><label>Imagen</label><InvImagenInput value={nImg} onChange={setNImg} /></div>
                      </div>
                      <p style={{ fontWeight: 700, margin: "12px 0 6px" }}>📐 Tallas para este color</p>
                      <div className="inv-add-variante__grid">
                        <div className="inv-field"><label>Talla</label>
                          <select value={nTalla} onChange={e => setNTalla(e.target.value)}>{TALLAS.map(t => <option key={t}>{t}</option>)}</select>
                        </div>
                        <div className="inv-field"><label>Cantidad</label><input type="number" min="0" placeholder="0" value={nCant} onChange={e => setNCant(e.target.value)} /></div>
                        <button className="inv-btn inv-btn--add" onClick={agregarTallaTemp} disabled={!nCant}>+ Talla</button>
                      </div>
                      {nTallasTemp.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          {nTallasTemp.map((t, i) => (
                            <span key={i} className="inv-talla-chip" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              {t.talla} ({t.cantidad})
                              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem" }} onClick={() => setNTallasTemp(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <button className="inv-btn inv-btn--add inv-btn--add-full" style={{ marginTop: 12 }} onClick={agregarColor} disabled={addColorLoading || nTallasTemp.length === 0}>
                        {addColorLoading ? "Agregando…" : `✓ Confirmar color "${nColor}"`}
                      </button>
                    </div>
                  )}

                  {/* Lista de colores */}
                  {stockData.length === 0 ? (
                    <p className="inv-empty-msg">Este producto no tiene colores registrados.</p>
                  ) : (
                    stockData.map((colorFila, ci) => (
                      <div key={colorFila.id_color} className="inv-color-bloque">
                        {/* Header del color */}
                        <div className="inv-color-header">
                          <div className="inv-color-cell">
                            <span className="inv-color-dot" style={{ background: `hsl(${(colorFila.color?.length ?? 0) * 40}deg 55% 55%)` }} />
                            {colorFila._editando ? (
                              <select className="inv-inline-select" value={colorFila.color ?? ""} onChange={e => setColorField(ci, "color", e.target.value)}>
                                {COLORES.map(c => <option key={c}>{c}</option>)}
                              </select>
                            ) : (
                              <strong>{colorFila.color ?? "Sin color"}</strong>
                            )}
                          </div>

                          {colorFila._editando ? (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              <input className="inv-inline-input" placeholder="Marca" value={colorFila.marca ?? ""} onChange={e => setColorField(ci, "marca", e.target.value)} />
                              <input className="inv-inline-input" placeholder="Referencia" value={colorFila.referencia ?? ""} onChange={e => setColorField(ci, "referencia", e.target.value)} />
                              <InvImagenInput
                                value={colorFila._imgFile ?? (!colorFila._imgBorrada ? colorFila.imagen : null)}
                                onChange={f => {
                                  if (f === null) { setColorField(ci, "_imgFile", null); setColorField(ci, "_imgBorrada", true); }
                                  else            { setColorField(ci, "_imgFile", f);    setColorField(ci, "_imgBorrada", false); }
                                }}
                              />
                              <button className="inv-btn inv-btn--save" onClick={() => guardarColor(ci)} disabled={saving}>{saving ? "…" : "✓ Guardar color"}</button>
                              <button className="inv-btn inv-btn--cancel" onClick={() => { setColorField(ci, "_editando", false); cargarStock(); }}>Cancelar</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              {colorFila.imagen && <img src={colorFila.imagen} alt="" className="inv-variante-img" />}
                              {colorFila.marca && <span className="inv-table__muted">🏷️ {colorFila.marca}</span>}
                              {colorFila.referencia && <span className="inv-table__muted">🔖 {colorFila.referencia}</span>}
                              <button className="inv-icon-btn" title="Editar color" onClick={() => setColorField(ci, "_editando", true)}>✏️</button>
                              {eliminando?.tipo === "color" && eliminando?.id === colorFila.id_color ? (
                                <>
                                  <span className="inv-confirm-text">¿Eliminar color?</span>
                                  <button className="inv-btn inv-btn--danger" onClick={confirmarEliminar}>Sí</button>
                                  <button className="inv-btn inv-btn--cancel" onClick={() => setEliminando(null)}>No</button>
                                </>
                              ) : (
                                <button className="inv-icon-btn inv-icon-btn--del" title="Eliminar color" onClick={() => setEliminando({ tipo: "color", id: colorFila.id_color })}>🗑️</button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tallas del color */}
                        <div className="inv-tallas-wrap">
                          {(colorFila.tallas ?? []).length === 0 ? (
                            <p className="inv-empty-msg" style={{ margin: "6px 0" }}>Sin tallas</p>
                          ) : (
                            <table className="inv-table inv-table--tallas">
                              <thead><tr><th>Talla</th><th>Cantidad</th><th></th></tr></thead>
                              <tbody>
                                {colorFila.tallas.map((t, ti) => (
                                  <tr key={t.id} className={t._editando ? "inv-table__row--editing" : ""}>
                                    <td>
                                      {t._editando ? (
                                        <select className="inv-inline-select" value={t.talla ?? ""} onChange={e => setTallaField(ci, ti, "talla", e.target.value)}>
                                          {TALLAS.map(tl => <option key={tl}>{tl}</option>)}
                                        </select>
                                      ) : <span className="inv-talla-chip">{t.talla ?? "—"}</span>}
                                    </td>
                                    <td>
                                      {t._editando ? (
                                        <input className="inv-inline-input" type="number" min="0" value={t.cantidad} onChange={e => setTallaField(ci, ti, "cantidad", e.target.value)} />
                                      ) : <StockBadge stock={Number(t.cantidad)} />}
                                    </td>
                                    <td>
                                      {t._editando ? (
                                        <div className="inv-row-actions">
                                          <button className="inv-btn inv-btn--save" onClick={() => guardarTalla(ci, ti)} disabled={saving}>{saving ? "…" : "✓"}</button>
                                          <button className="inv-btn inv-btn--cancel" onClick={() => { setTallaField(ci, ti, "_editando", false); cargarStock(); }}>✕</button>
                                        </div>
                                      ) : eliminando?.tipo === "talla" && eliminando?.id === t.id ? (
                                        <div className="inv-row-actions">
                                          <span className="inv-confirm-text">¿Eliminar?</span>
                                          <button className="inv-btn inv-btn--danger" onClick={confirmarEliminar}>Sí</button>
                                          <button className="inv-btn inv-btn--cancel" onClick={() => setEliminando(null)}>No</button>
                                        </div>
                                      ) : (
                                        <div className="inv-row-actions">
                                          <button className="inv-icon-btn" title="Editar" onClick={() => setTallaField(ci, ti, "_editando", true)}>✏️</button>
                                          <button className="inv-icon-btn inv-icon-btn--del" title="Eliminar talla" onClick={() => setEliminando({ tipo: "talla", id: t.id })}>🗑️</button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {/* Agregar talla a este color */}
                          {agregarTallaColorId === colorFila.id_color ? (
                            <div className="inv-add-variante__grid" style={{ marginTop: 8 }}>
                              <div className="inv-field"><label>Talla</label>
                                <select value={aTalla} onChange={e => setATalla(e.target.value)}>{TALLAS.map(t => <option key={t}>{t}</option>)}</select>
                              </div>
                              <div className="inv-field"><label>Cantidad</label><input type="number" min="0" placeholder="0" value={aCant} onChange={e => setACant(e.target.value)} /></div>
                              <button className="inv-btn inv-btn--add" onClick={() => agregarTallaAColor(colorFila.id_color)} disabled={!aCant}>+ Agregar</button>
                              <button className="inv-btn inv-btn--cancel" onClick={() => { setAgregarTallaColorId(null); setACant(""); }}>Cancelar</button>
                            </div>
                          ) : (
                            <button className="inv-btn-link" style={{ marginTop: 4, fontSize: "0.82rem" }} onClick={() => setAgregarTallaColorId(colorFila.id_color)}>
                              + Agregar talla a {colorFila.color}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ══ SIMPLE ══ */}
              {!esVariante && (
                <>
                  <div className="inv-section-label"><span>Stock del producto</span></div>
                  {stockData.length === 0 ? (
                    <p className="inv-empty-msg">No se encontró el registro de stock.</p>
                  ) : (
                    <div className="inv-simple-editor">
                      <div className="inv-simple-editor__img-row">
                        <p className="inv-simple-editor__label">Imagen</p>
                        {stockData[0]._editando ? (
                          <InvImagenInput
                            value={stockData[0]._imgFile ?? (!stockData[0]._imgBorrada ? stockData[0].imagen : null)}
                            onChange={f => {
                              if (f === null) { setColorField(0, "_imgFile", null); setColorField(0, "_imgBorrada", true); }
                              else            { setColorField(0, "_imgFile", f);    setColorField(0, "_imgBorrada", false); }
                            }}
                          />
                        ) : stockData[0].imagen ? (
                          <img src={stockData[0].imagen} alt="" className="inv-simple-img" />
                        ) : (
                          <div className="inv-simple-img inv-simple-img--empty">Sin imagen</div>
                        )}
                      </div>
                      <div className="inv-simple-editor__current">
                        <p className="inv-simple-editor__label">Cantidad actual</p>
                        {!stockData[0]._editando && (
                          <><span className="inv-simple-editor__val">{stockData[0].cantidad}</span><StockBadge stock={Number(stockData[0].cantidad)} /></>
                        )}
                      </div>
                      {stockData[0]._editando ? (
                        <div className="inv-simple-editor__form">
                          <div className="inv-simple-editor__form-row">
                            <div className="inv-field"><label>Cantidad</label><input type="number" min="0" value={stockData[0].cantidad} onChange={e => setColorField(0, "cantidad", e.target.value)} autoFocus /></div>
                            <div className="inv-field"><label>Marca</label><input placeholder="Opcional" value={stockData[0].marca ?? ""} onChange={e => setColorField(0, "marca", e.target.value)} /></div>
                            <div className="inv-field"><label>Referencia</label><input placeholder="Opcional" value={stockData[0].referencia ?? ""} onChange={e => setColorField(0, "referencia", e.target.value)} /></div>
                          </div>
                          <div className="inv-simple-editor__actions">
                            <button className="inv-btn inv-btn--cancel" onClick={() => { setColorField(0, "_editando", false); cargarStock(); }}>Cancelar</button>
                            <button className="inv-btn inv-btn--save" onClick={() => guardarSimple(0)} disabled={saving}>{saving ? "Guardando…" : "✓ Guardar cambios"}</button>
                          </div>
                        </div>
                      ) : (
                        <div className="inv-simple-editor__info-row">
                          {stockData[0].marca     && <span className="inv-simple-tag">🏷️ {stockData[0].marca}</span>}
                          {stockData[0].referencia && <span className="inv-simple-tag">🔖 {stockData[0].referencia}</span>}
                          <button className="inv-btn inv-btn--edit-simple" onClick={() => setColorField(0, "_editando", true)}>✏️ Modificar</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="inv-modal__footer">
          <button className="inv-btn inv-btn--ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL — Inventario
══════════════════════════════════════════ */
function PaginaInventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [productoModal, setProductoModal] = useState(null);

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
    cargarProductos(decode.id);
  }, []);

  const cargarProductos = async (id) => {
    setLoading(true);
    try {
      const res = await TraerProductos(id);
      setProductos(res.data);
    } catch {
      mostrarAlerta("error", "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtrado ── */
  const filtered = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "Todos" || p.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  /* Stats */
  const sinStock = productos.filter((p) => p.stock === 0).length;
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalStock = productos.reduce((acc, p) => acc + p.stock, 0);

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="inv-page">
        <span className="inv-orb inv-orb--one" aria-hidden="true" />
        <span className="inv-orb inv-orb--two" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="inv-header">
          <div>
            <p className="inv-eyebrow">🗂️ Stock</p>
            <h1 className="inv-title">
              Gestión de <span>Inventario</span>
            </h1>
            <p className="inv-subtitle">
              Consulta y actualiza el stock de cada producto. Para crear
              productos ve a{" "}
              <button
                className="inv-link"
                onClick={() => navigate("/dashboard/productos")}
              >
                Gestión de Productos →
              </button>
            </p>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="inv-stats">
          {[
            { val: productos.length, label: "Productos", cls: "" },
            { val: totalStock, label: "Total stock", cls: "inv-stat--blue" },
            { val: sinStock, label: "Sin stock", cls: "inv-stat--red" },
            { val: stockBajo, label: "Stock bajo", cls: "inv-stat--yellow" },
          ].map(({ val, label, cls }) => (
            <div key={label} className={`inv-stat-pill ${cls}`}>
              <span className="inv-stat-pill__val">{loading ? "—" : val}</span>
              <span className="inv-stat-pill__label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="inv-toolbar">
          <div className="inv-search">
            <span className="inv-search__icon">🔍</span>
            <input
              placeholder="Buscar producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="inv-search__clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
          <div className="inv-filters">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="Todos">Todos los tipos</option>
              <option value="simple">Simple</option>
              <option value="variantes">Con variantes</option>
            </select>
          </div>
        </div>

        {/* ── Tabla ── */}
        {loading ? (
          <div className="inv-loading">
            <div className="inv-loading__spinner" />
            <p>Cargando inventario…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="inv-empty">
            <span className="inv-empty__icon">
              {productos.length === 0 ? "🗂️" : "🔎"}
            </span>
            <p>
              {productos.length === 0
                ? "No hay productos. Crea uno desde Gestión de Productos."
                : "No se encontraron productos con esos filtros."}
            </p>
            {productos.length === 0 && (
              <button
                className="inv-btn inv-btn--primary"
                onClick={() => navigate("/dashboard/productos")}
              >
                Ir a Gestión de Productos →
              </button>
            )}
            {productos.length > 0 && (
              <button
                className="inv-btn inv-btn--ghost"
                onClick={() => {
                  setSearch("");
                  setFilterTipo("Todos");
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="inv-table-wrap">
            <table className="inv-table inv-table--main">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr
                    key={item.id}
                    className="inv-table__row inv-table__row--clickable"
                    onClick={() => setProductoModal(item)}
                    title="Clic para gestionar inventario"
                  >
                    <td className="inv-table__num">{i + 1}</td>
                    <td>
                      <div className="inv-table__product">
                        <div
                          className="inv-table__thumb"
                          style={{ "--hue": (item.id * 57) % 360 }}
                          aria-hidden="true"
                        >
                          {item.nombre[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{item.nombre}</strong>
                          {item.descripcion && (
                            <small>{item.descripcion}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <TipoBadge tipo={item.tipo} />
                    </td>
                    <td className="inv-table__price">
                      {formatPrice(item.precio)}
                    </td>
                    <td>
                      <StockBadge stock={item.stock} />
                    </td>
                    <td>
                      <button
                        className="inv-icon-btn inv-icon-btn--manage"
                        title="Gestionar inventario"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductoModal(item);
                        }}
                      >
                        📋 Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <p className="inv-count">
            Mostrando <strong>{filtered.length}</strong> de{" "}
            <strong>{productos.length}</strong> productos
          </p>
        )}
      </div>

      {/* ── Modal inventario ── */}
      {productoModal && (
        <ModalInventario
          producto={productoModal}
          userId={userId}
          onClose={() => setProductoModal(null)}
          onGuardado={() => cargarProductos(userId)}
        />
      )}
    </>
  );
}

export default PaginaInventario;
