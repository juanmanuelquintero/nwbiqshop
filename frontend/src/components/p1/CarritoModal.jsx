import { useState } from "react";
import { HacerPedido } from "../../api/axios";

function formatPrice(n) {
  if (n == null) return "";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

function CarritoModal({ estilos, pasarela, items, dominio, telefono, nombreTienda, onClose, onActualizar }) {
  const bg   = estilos?.color_principal  ?? "#ffffff";
  const sec  = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color      ?? "#042d78";
  const txt  = estilos?.text_color       ?? "#242f43";
  const btn  = estilos?.color_botones    ?? "#35a4ec";

  const [vista,     setVista]     = useState("carrito");
  const [correo,    setCorreo]    = useState("");
  const [correoErr, setCorreoErr] = useState("");
  const [cargando,  setCargando]  = useState(false);
  const [pedidoId,  setPedidoId]  = useState(null);

  const total     = items.reduce((acc, i) => acc + (i.precio_unitario ?? 0) * (i.cantidad ?? 1), 0);
  const cantTotal = items.reduce((acc, i) => acc + (i.cantidad ?? 1), 0);

  const eliminar = (idx) => {
    const nueva = items.filter((_, i) => i !== idx);
    localStorage.setItem("bolsa", JSON.stringify(nueva));
    onActualizar(nueva);
  };

  const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const abrirWhatsApp = (idPedido, correoCliente, listaItems) => {
    if (!telefono) return;
    const numero = telefono.replace(/\D/g, "");
    const lineas = listaItems.map((item) => {
      const sub      = (item.precio_unitario ?? 0) * (item.cantidad ?? 1);
      const variante = [item.talla, item.color].filter(Boolean).join(" / ");
      return `• ${item.nombre}${variante ? ` (${variante})` : ""} x${item.cantidad} — ${formatPrice(sub)}`;
    });
    const mensaje =
      `=====Nuevo pedido — ${nombreTienda ?? dominio}=====\n\n` +
      lineas.join("\n") +
      `\n\nTotal: ${formatPrice(total)}\n` +
      `Correo usuario: ${correoCliente}\n` +
      `ID Pedido #${idPedido}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener,noreferrer");
  };

  const confirmarPedido = async () => {
    if (!correo.trim()) { setCorreoErr("El correo es obligatorio para confirmar tu pedido."); return; }
    if (!emailValido(correo.trim())) { setCorreoErr("Ingresa un correo electrónico válido."); return; }
    setCorreoErr("");
    setCargando(true);
    try {
      const res = await HacerPedido({
        dominio,
        correo: correo.trim(),
        productos: items.map((item) => ({
          producto_id: item.producto_id,
          id_variante: item.variante_id,
          tipo:        item.tipo,
          cantidad:    item.cantidad ?? 1,
        })),
      });
      const idPedido = res.data?.pedido_id;
      setPedidoId(idPedido);
      localStorage.removeItem("bolsa");
      onActualizar([]);
      abrirWhatsApp(idPedido, correo.trim(), items);
      setVista("confirmado");
    } catch (err) {
      setCorreoErr(err?.response?.data?.detail ?? "Ocurrió un error al procesar tu pedido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p1-cart-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="p1-cart-modal" style={{ background: bg, borderTop: `4px solid ${sec}`, boxShadow: `0 24px 80px ${sec}44` }}>

        {/* ── VISTA CARRITO ── */}
        {vista === "carrito" && (
          <>
            <div className="p1-cart-modal__header" style={{ borderColor: `${sec}20` }}>
              <div>
                <span className="p1-cart-modal__eyebrow" style={{ color: titl }}>🛒 Tu carrito</span>
                <h2 className="p1-cart-modal__titulo" style={{ color: titl }}>
                  {cantTotal > 0 ? `${cantTotal} ${cantTotal === 1 ? "producto" : "productos"} seleccionados` : "Tu carrito está vacío"}
                </h2>
              </div>
              <button className="p1-cart-modal__close" style={{ color: `${txt}60` }} onClick={onClose}>✕</button>
            </div>

            {items.length === 0 ? (
              <div className="p1-cart-modal__empty">
                <span style={{ fontSize: "3rem" }}>🛍️</span>
                <p style={{ color: `${txt}70` }}>No tienes productos en tu carrito</p>
              </div>
            ) : (
              <>
                <ul className="p1-cart-modal__list">
                  {items.map((item, i) => (
                    <li key={i} className="p1-cart-modal__item" style={{ borderColor: `${sec}15` }}>
                      {item.imagen
                        ? <img src={item.imagen} alt={item.nombre} className="p1-cart-modal__img" />
                        : <div className="p1-cart-modal__img-ph" style={{ background: `${sec}22`, color: titl }}>{item.nombre?.[0]?.toUpperCase()}</div>}
                      <div className="p1-cart-modal__info">
                        <span className="p1-cart-modal__nombre" style={{ color: titl }}>{item.nombre}</span>
                        <div className="p1-cart-modal__meta">
                          {item.talla && <span className="p1-cart-modal__tag" style={{ background: `${btn}18`, color: btn }}>{item.talla}</span>}
                          {item.color && <span className="p1-cart-modal__tag" style={{ background: `${btn}18`, color: btn }}>{item.color}</span>}
                        </div>
                        <div className="p1-cart-modal__precios">
                          <span style={{ color: `${txt}70`, fontSize: "0.82rem" }}>{formatPrice(item.precio_unitario)} × {item.cantidad}</span>
                          <span style={{ color: titl, fontWeight: 800 }}>= {formatPrice((item.precio_unitario ?? 0) * (item.cantidad ?? 1))}</span>
                        </div>
                      </div>
                      <button className="p1-cart-modal__del" style={{ color: `${txt}40`, borderColor: `${txt}20` }} onClick={() => eliminar(i)} title="Eliminar">✕</button>
                    </li>
                  ))}
                </ul>

                <div className="p1-cart-modal__resumen" style={{ background: `${sec}08`, borderColor: `${sec}20` }}>
                  <div className="p1-cart-modal__resumen-row">
                    <span style={{ color: `${txt}70` }}>Subtotal ({cantTotal} items)</span>
                    <span style={{ color: txt, fontWeight: 700 }}>{formatPrice(total)}</span>
                  </div>
                  <div className="p1-cart-modal__resumen-row p1-cart-modal__resumen-row--total">
                    <span style={{ color: titl, fontWeight: 800 }}>Total</span>
                    <span style={{ color: titl, fontWeight: 900, fontSize: "1.25rem" }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  className="p1-cart-modal__cta"
                  style={{ background: "linear-gradient(135deg, #5eca4a, #29a127)", color: "#fff", boxShadow: `0 6px 24px ${btn}55` }}
                  onClick={() => setVista("formulario")}
                >
                  {pasarela ? "💳 Pagar mi carrito" : "💬 Pedir productos — WhatsApp"}
                </button>
              </>
            )}
          </>
        )}

        {/* ── VISTA FORMULARIO ── */}
        {vista === "formulario" && (
          <>
            <div className="p1-cart-modal__header" style={{ borderColor: `${sec}20` }}>
              <div>
                <span className="p1-cart-modal__eyebrow" style={{ color: titl }}>📋 Último paso</span>
                <h2 className="p1-cart-modal__titulo" style={{ color: titl }}>Confirma tu pedido</h2>
              </div>
              <button className="p1-cart-modal__close" style={{ color: `${txt}60` }} onClick={onClose}>✕</button>
            </div>

            <div className="p1-cart-confirm">
              <div className="p1-cart-confirm__resumen" style={{ background: `${sec}0d`, borderColor: `${sec}25` }}>
                <span style={{ color: `${txt}80`, fontSize: "0.84rem" }}>{cantTotal} {cantTotal === 1 ? "producto" : "productos"}</span>
                <span style={{ color: titl, fontWeight: 900, fontSize: "1.1rem" }}>{formatPrice(total)}</span>
              </div>

              <div className="p1-cart-confirm__field">
                <label className="p1-cart-confirm__label" style={{ color: titl }}>📧 Tu correo electrónico</label>
                <input
                  className={`p1-cart-confirm__input ${correoErr ? "p1-cart-confirm__input--err" : ""}`}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => { setCorreo(e.target.value); setCorreoErr(""); }}
                  style={{ borderColor: correoErr ? "#ef4444" : `${sec}40`, color: txt, background: `${sec}06` }}
                  onKeyDown={(e) => e.key === "Enter" && confirmarPedido()}
                  autoFocus
                />
                {correoErr && <span className="p1-cart-confirm__err">⚠ {correoErr}</span>}
              </div>

              <div className="p1-cart-confirm__info" style={{ background: `${sec}0d`, borderColor: `${sec}22` }}>
                <span className="p1-cart-confirm__info-icon">ℹ️</span>
                <p style={{ color: `${txt}85`, fontSize: "0.83rem", margin: 0, lineHeight: 1.55 }}>
                  Con este correo podrás consultar el estado de tu pedido en cualquier momento.
                </p>
              </div>

              <div className="p1-cart-confirm__btns">
                <button className="p1-cart-confirm__back" style={{ borderColor: `${sec}40`, color: `${txt}80` }}
                  onClick={() => { setVista("carrito"); setCorreoErr(""); }} disabled={cargando}>
                  ← Volver
                </button>
                <button className="p1-cart-confirm__submit"
                  style={{ background: "linear-gradient(135deg, #5eca4a, #29a127)", color: "#fff" }}
                  onClick={confirmarPedido} disabled={cargando}>
                  {cargando ? <span className="p1-cart-confirm__spinner" /> : "✓ Confirmar pedido"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── VISTA CONFIRMADO ── */}
        {vista === "confirmado" && (
          <div className="p1-cart-ok">
            <div className="p1-cart-ok__icon">✅</div>
            <h2 className="p1-cart-ok__titulo" style={{ color: titl }}>¡Pedido confirmado!</h2>
            {pedidoId && (
              <span className="p1-cart-ok__pedido-id" style={{ background: `${sec}15`, color: sec }}>Pedido #{pedidoId}</span>
            )}
            <p className="p1-cart-ok__texto" style={{ color: `${txt}85` }}>
              Tu pedido fue registrado y el resumen fue enviado al WhatsApp de la tienda.
              Consulta el estado en cualquier momento con el correo{" "}
              <strong style={{ color: titl }}>{correo}</strong>.
            </p>
            <div className="p1-cart-ok__info" style={{ background: `${sec}0d`, borderColor: `${sec}22` }}>
              <span>📬</span>
              <p style={{ color: `${txt}80`, fontSize: "0.83rem", margin: 0 }}>
                Si WhatsApp no se abrió automáticamente, usa el botón de abajo para reenviar.
              </p>
            </div>
            <div className="p1-cart-ok__btns">
              {telefono && (
                <button className="p1-cart-ok__btn-wa" onClick={() => abrirWhatsApp(pedidoId, correo, [])}>
                  📲 Abrir WhatsApp
                </button>
              )}
              <button
                className="p1-cart-ok__btn"
                style={{ background: `linear-gradient(135deg, ${btn}, ${sec})`, color: bg }}
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarritoModal;
