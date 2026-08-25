import { useEffect, useState } from "react";
import { MirarVariantes } from "../../api/axios";
import { mostrarAlerta } from "../../utils/alerts";

function formatPrice(n) {
  if (n == null) return "";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

function ModalProducto({ estilos, setmodal, producto }) {
  const bg   = estilos?.color_principal  ?? "#ffffff";
  const sec  = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color      ?? "#042d78";
  const txt  = estilos?.text_color       ?? "#242f43";
  const btn  = estilos?.color_botones    ?? "#35a4ec";

  // Para tipo "variantes": array de colores con sus tallas
  // [{ id, color, imagen, marca, referencia, tallas: [{id, talla, cantidad}] }]
  const [colores,  setColores]  = useState([]);
  // Para tipo "simple": array con un solo objeto { id, cantidad, ... }
  const [simple,   setSimple]   = useState(null);
  const [cargando, setCargando] = useState(true);

  // Selección actual
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const esVariantes = producto.tipo === "variantes";

  useEffect(() => {
    MirarVariantes(producto.id)
      .then((res) => {
        if (esVariantes) {
          const data = res.data; // [{ id, color, imagen, tallas:[...] }]
          setColores(data);
          if (data.length > 0) {
            const primerColor = data[0];
            setColorSeleccionado(primerColor);
            // Preseleccionar primera talla con stock
            const conStock = primerColor.tallas?.find(t => t.cantidad > 0);
            setTallaSeleccionada(conStock ?? primerColor.tallas?.[0] ?? null);
          }
        } else {
          // simple: res.data es array con un objeto
          const s = Array.isArray(res.data) ? res.data[0] : res.data;
          setSimple(s);
        }
      })
      .catch(() => mostrarAlerta("error", "Error trayendo las variantes"))
      .finally(() => setCargando(false));
  }, []);

  // Cuando cambia el color, resetear talla al primero con stock
  const elegirColor = (color) => {
    setColorSeleccionado(color);
    const conStock = color.tallas?.find(t => t.cantidad > 0);
    setTallaSeleccionada(conStock ?? color.tallas?.[0] ?? null);
    setCantidad(1);
  };

  const elegirTalla = (talla) => {
    setTallaSeleccionada(talla);
    setCantidad(1);
  };

  // Stock máximo: para variantes viene de la talla, para simple del objeto simple
  const maxCantidad = esVariantes
    ? (tallaSeleccionada?.cantidad ?? 0)
    : (simple?.cantidad ?? 0);

  const incrementar = () => setCantidad(c => Math.min(c + 1, maxCantidad));
  const decrementar = () => setCantidad(c => Math.max(c - 1, 1));

  // Imagen activa: la del color seleccionado o la del producto
  const imagenActiva = colorSeleccionado?.imagen ?? producto.imagen ?? null;

  // Puede agregar si tiene selección válida y stock disponible
  const puedeAgregar = esVariantes
    ? !!colorSeleccionado && !!tallaSeleccionada && (tallaSeleccionada.cantidad ?? 0) > 0
    : !!simple && (simple.cantidad ?? 0) > 0;

  const agregarAlCarrito = () => {
    if (!puedeAgregar) {
      mostrarAlerta("error", esVariantes ? "Selecciona color y talla" : "Producto sin stock");
      return;
    }
    const bolsaActual = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
    const precioUnitario = producto.precio_final ?? producto.precio_original ?? producto.precio ?? 0;

    // id_variante: para variantes usamos el id de la talla; para simple el id del simple
    const varianteId = esVariantes ? tallaSeleccionada.id : simple.id;

    bolsaActual.push({
      producto_id:     producto.id,
      variante_id:     varianteId,
      tipo:            producto.tipo,
      cantidad,
      nombre:          producto.nombre,
      imagen:          imagenActiva,
      talla:           esVariantes ? tallaSeleccionada.talla : null,
      color:           esVariantes ? colorSeleccionado.color : null,
      precio_unitario: Number(precioUnitario),
    });
    localStorage.setItem("bolsa", JSON.stringify(bolsaActual));
    mostrarAlerta("success", "¡Producto agregado a tu bolsa!");
    setmodal(false);
  };

  const precio = producto.precio_final ?? producto.precio_original ?? producto.precio;

  return (
    <div
      className="contenedor-productos-tienda"
      style={{ backgroundColor: `color-mix(in srgb, ${sec}40 50%, black)` }}
      onClick={(e) => e.target === e.currentTarget && setmodal(false)}
    >
      <div
        className="mp-modal"
        style={{ backgroundColor: bg, border: `1px solid ${sec}50`, boxShadow: `0 8px 48px ${sec}55` }}
      >
        <button className="mp-close" style={{ color: sec, borderColor: `${sec}50` }} onClick={() => setmodal(false)}>✕</button>

        {/* Imagen */}
        <div className="mp-images">
          <div className="mp-img-main" style={{ background: `linear-gradient(135deg, ${sec}25, ${btn}20)` }}>
            {imagenActiva ? (
              <img src={imagenActiva} alt={producto.nombre} />
            ) : (
              <span className="mp-img-placeholder" style={{ color: titl }}>
                {producto.nombre?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mp-info">
          <span className="mp-badge" style={{ background: `${btn}22`, color: titl }}>
            {esVariantes ? "✦ Con variantes" : "✦ Producto simple"}
          </span>

          <h2 className="mp-title" style={{ color: titl }}>{producto.nombre}</h2>

          {producto.descripcion && (
            <p className="mp-desc" style={{ color: txt }}>{producto.descripcion}</p>
          )}

          {/* Precio */}
          <div className="mp-pricing">
            {producto.precio_final ? (
              <>
                <span className="mp-price-original">{formatPrice(producto.precio_original)}</span>
                <span className="mp-price-final" style={{ color: titl }}>{formatPrice(producto.precio_final)}</span>
                {producto.descuento && (
                  <span className="mp-discount-badge" style={{ background: btn, color: "#fff" }}>
                    -{producto.descuento}%
                  </span>
                )}
              </>
            ) : (
              <span className="mp-price-final" style={{ color: titl }}>{formatPrice(precio)}</span>
            )}
          </div>

          {cargando ? (
            <div className="mp-loading"><div className="mp-spinner" style={{ borderTopColor: titl }} /></div>
          ) : esVariantes ? (
            <>
              {/* ── PASO 1: Seleccionar color ── */}
              <div className="mp-variantes">
                <p className="mp-variantes-label" style={{ color: titl }}>
                  1. Elige un color:
                </p>
                <div className="mp-colores-grid">
                  {colores.map((c) => {
                    const sel = colorSeleccionado?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        className={`mp-color-btn ${sel ? "mp-color-btn--active" : ""}`}
                        style={sel
                          ? { borderColor: sec, boxShadow: `0 0 0 2px ${sec}` }
                          : { borderColor: `${sec}40` }}
                        onClick={() => elegirColor(c)}
                        title={c.color}
                      >
                        {/* Punto de color */}
                        <span
                          className="mp-color-dot"
                          style={{ background: `hsl(${(c.color?.length ?? 0) * 40}deg 55% 50%)` }}
                        />
                        {/* Miniatura si tiene imagen */}
                        {c.imagen && (
                          <img src={c.imagen} alt={c.color} className="mp-color-thumb" />
                        )}
                        <span style={{ color: sel ? titl : `${titl}cc`, fontWeight: sel ? 700 : 500 }}>
                          {c.color ?? "Sin color"}
                        </span>
                        {sel && <span className="mp-color-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── PASO 2: Seleccionar talla ── */}
              {colorSeleccionado && (
                <div className="mp-variantes" style={{ marginTop: "12px" }}>
                  <p className="mp-variantes-label" style={{ color: titl }}>
                    2. Elige una talla:
                  </p>
                  <div className="mp-variantes-grid">
                    {(colorSeleccionado.tallas ?? []).map((t) => {
                      const sel      = tallaSeleccionada?.id === t.id;
                      const sinStock = t.cantidad === 0;
                      return (
                        <button
                          key={t.id}
                          className={`mp-variante-btn ${sel ? "mp-variante-btn--active" : ""} ${sinStock ? "mp-variante-btn--agotado" : ""}`}
                          style={sel
                            ? { background: btn, borderColor: btn, color: "#fff" }
                            : sinStock
                              ? { borderColor: `${sec}25`, color: `${titl}40`, cursor: "not-allowed" }
                              : { borderColor: sec, color: titl }}
                          onClick={() => !sinStock && elegirTalla(t)}
                          disabled={sinStock}
                          title={sinStock ? "Sin stock" : `${t.cantidad} disponibles`}
                        >
                          <span className="mp-variante-talla">{t.talla}</span>
                          <span
                            className="mp-variante-stock"
                            style={{ color: sel ? "#ffffffaa" : sinStock ? `${titl}40` : `${titl}80` }}
                          >
                            {sinStock ? "Agotado" : `${t.cantidad} disp.`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Simple: solo muestra stock
            simple && (
              <p className="mp-stock-simple" style={{ color: txt }}>
                🗃️ Stock disponible:{" "}
                <strong style={{ color: simple.cantidad > 0 ? titl : "#ef4444" }}>
                  {simple.cantidad > 0 ? simple.cantidad : "Sin stock"}
                </strong>
              </p>
            )
          )}

          {/* Control de cantidad */}
          {!cargando && puedeAgregar && (
            <div className="mp-cantidad">
              <span style={{ color: titl, fontWeight: 700, fontSize: "0.85rem" }}>Cantidad:</span>
              <div className="mp-cantidad-ctrl">
                <button className="mp-qty-btn" style={{ borderColor: `${sec}50`, color: titl }} onClick={decrementar} disabled={cantidad <= 1}>−</button>
                <span className="mp-qty-value" style={{ color: titl, borderColor: `${sec}30` }}>{cantidad}</span>
                <button className="mp-qty-btn" style={{ borderColor: `${sec}50`, color: titl }} onClick={incrementar} disabled={cantidad >= maxCantidad}>+</button>
              </div>
            </div>
          )}

          {/* Botón agregar */}
          <button
            className="mp-add-btn mp-add-btn--green"
            style={{ opacity: cargando || !puedeAgregar ? 0.5 : 1 }}
            onClick={agregarAlCarrito}
            disabled={cargando || !puedeAgregar}
          >
            🛒 Agregar a la bolsa
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalProducto;
