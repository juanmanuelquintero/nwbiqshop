import { useState } from "react";
import { HacerPedido } from "../api/axios";
import "../styles/componentes.css";
import { mostrarAlerta } from "../utils/alerts";

function formatPrice(n) {
  if (n == null) return "";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

function CarritoModal({
  estilos,
  pasarela,
  items,
  dominio,
  telefono,
  nombreTienda,
  onClose,
  onActualizar,
  estadoAlPorMayor = false,
  cantidadMinimaMayorista = 6,
}) {
  const bg = estilos?.color_principal ?? "#ffffff";
  const sec = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";
  const btn = estilos?.color_botones ?? "#35a4ec";

  const [vista, setVista] = useState("carrito");
  const [correo, setCorreo] = useState("");
  const [correoErr, setCorreoErr] = useState("");
  const [cargando, setCargando] = useState(false);

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefonoformulario, setTelefonoformulario] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");

  const [nombresErr, setNombresErr] = useState("");
  const [apellidosErr, setApellidosErr] = useState("");
  const [telefonoErr, setTelefonoErr] = useState("");
  const [ciudadErr, setCiudadErr] = useState("");
  const [direccionErr, setDireccionErr] = useState("");

  const cantTotal = items.reduce((acc, i) => acc + (i.cantidad ?? 1), 0);
  const aplicaMayorista =
    estadoAlPorMayor && cantTotal >= cantidadMinimaMayorista;
  const itemsConPrecio = items.map((item) => {
    const precioMayorista = Number(item.precio_alpormayor);
    const precioOriginal = Number(item.precio_original);
    const descuento = Number(item.descuento ?? 0);
    const precioNormal = Number.isFinite(precioOriginal)
      ? precioOriginal * (1 - descuento / 100)
      : Number(item.precio_unitario ?? item.precio_final ?? 0);
    const precioUnitario =
      aplicaMayorista && Number.isFinite(precioMayorista)
        ? precioMayorista
        : precioNormal;
    return { ...item, precio_unitario: precioUnitario };
  });
  const total = itemsConPrecio.reduce(
    (acc, i) => acc + i.precio_unitario * (i.cantidad ?? 1),
    0,
  );

  const eliminar = (idx) => {
    const nueva = items.filter((_, i) => i !== idx);
    localStorage.setItem("bolsa", JSON.stringify(nueva));
    onActualizar(nueva);
  };

  const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const confirmarPedido = async () => {
    const errores = {
      nombres: !nombres.trim() ? "Los nombres son obligatorios." : "",
      apellidos: !apellidos.trim() ? "Los apellidos son obligatorios." : "",
      telefono: !telefonoformulario.trim() ? "El teléfono es obligatorio." : "",
      ciudad: !ciudad.trim() ? "La ciudad es obligatoria." : "",
      direccion: !direccion.trim() ? "La dirección es obligatoria." : "",
    };

    setNombresErr(errores.nombres);
    setApellidosErr(errores.apellidos);
    setTelefonoErr(errores.telefono);
    setCiudadErr(errores.ciudad);
    setDireccionErr(errores.direccion);

    if (!correo.trim()) {
      setCorreoErr("El correo es obligatorio para confirmar tu pedido.");
      return;
    }
    if (!emailValido(correo.trim())) {
      setCorreoErr("Ingresa un correo electrónico válido.");
      return;
    }
    if (Object.values(errores).some(Boolean)) return;

    setCorreoErr("");
    setCargando(true);

    try {
      const bolsaGuardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      const productos = Array.isArray(bolsaGuardada) ? bolsaGuardada : [];

      if (productos.length === 0) {
        mostrarAlerta(
          "error",
          "No hay productos en el carrito para confirmar el pedido.",
        );
        return;
      }

      const detalleProductos = productos
        .map(
          (item) =>
            `- ID: ${item.producto_id} | Nombre: ${item.nombre ?? "Sin nombre"} | Cantidad: ${item.cantidad ?? 1} | Talla: ${item.talla ?? "No aplica"} | Color: ${item.color ?? "No aplica"} | Precio final: ${formatPrice(item.precio_final)}`,
        )
        .join("\n");
      const telefonoWhatsApp = String(telefono ?? "").replace(/\D/g, "");
      const numeroWhatsApp = telefonoWhatsApp.startsWith("57")
        ? telefonoWhatsApp
        : `57${telefonoWhatsApp}`;
      const mensajeWhatsApp = [
        "Pedido",
        "",
        `Tienda: ${nombreTienda ?? ""}`,
        "Productos:",
        detalleProductos,
        "",
        "Datos del cliente:",
        `Nombre: ${nombres.trim()} ${apellidos.trim()}`,
        `Correo: ${correo.trim()}`,
        `Teléfono: ${telefonoformulario.trim()}`,
        `Ciudad: ${ciudad.trim()}`,
        `Dirección: ${direccion.trim()}`,
      ].join("\n");

      await HacerPedido({
        dominio,
        productos: productos.map((item) => ({
          producto_id: item.producto_id,
          id_variante: item.variante_id,
          tipo: item.tipo,
          cantidad: Number(item.cantidad ?? 1),
        })),
        correo: correo.trim(),
        nombresyapellidos: `${nombres.trim()} ${apellidos.trim()}`,
        telefono: telefonoformulario.trim(),
        ciudad: ciudad.trim(),
        direccion: direccion.trim(),
      });

      localStorage.removeItem("bolsa");
      onActualizar([]);
      mostrarAlerta("success", "Pedido creado correctamente.");
      onClose();
      window.location.assign(
        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`,
      );
    } catch (error) {
      const detalle = error?.response?.data?.detail;
      setCorreoErr(
        Array.isArray(detalle)
          ? "Revisa los datos ingresados."
          : detalle || "No se pudo crear el pedido. Inténtalo nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="p1-cart-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="p1-cart-modal"
        style={{
          background: bg,
          borderTop: `4px solid ${sec}`,
          boxShadow: `0 24px 80px ${sec}44`,
        }}
      >
        {/* ── VISTA CARRITO ── */}
        {vista === "carrito" && (
          <>
            <div
              className="p1-cart-modal__header"
              style={{ borderColor: `${sec}20` }}
            >
              <div>
                <span
                  className="p1-cart-modal__eyebrow"
                  style={{ color: titl }}
                >
                  🛒 Tu carrito
                </span>
                <h2 className="p1-cart-modal__titulo" style={{ color: titl }}>
                  {cantTotal > 0
                    ? `${cantTotal} ${cantTotal === 1 ? "producto" : "productos"} seleccionados`
                    : "Tu carrito está vacío"}
                </h2>
              </div>
              <button
                className="p1-cart-modal__close"
                style={{ color: `${txt}60` }}
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p1-cart-modal__empty">
                <span style={{ fontSize: "3rem" }}>🛍️</span>
                <p style={{ color: `${txt}70` }}>
                  No tienes productos en tu carrito
                </p>
              </div>
            ) : (
              <>
                <ul className="p1-cart-modal__list">
                  {itemsConPrecio.map((item, i) => (
                    <li
                      key={i}
                      className="p1-cart-modal__item"
                      style={{ borderColor: `${sec}15` }}
                    >
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="p1-cart-modal__img"
                        />
                      ) : (
                        <div
                          className="p1-cart-modal__img-ph"
                          style={{ background: `${sec}22`, color: titl }}
                        >
                          {item.nombre?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="p1-cart-modal__info">
                        <span
                          className="p1-cart-modal__nombre"
                          style={{ color: titl }}
                        >
                          {item.nombre}
                        </span>
                        <div className="p1-cart-modal__meta">
                          {item.talla && (
                            <span
                              className="p1-cart-modal__tag"
                              style={{ background: `${btn}18`, color: btn }}
                            >
                              {item.talla}
                            </span>
                          )}
                          {item.color && (
                            <span
                              className="p1-cart-modal__tag"
                              style={{ background: `${btn}18`, color: btn }}
                            >
                              {item.color}
                            </span>
                          )}
                          {aplicaMayorista &&
                            item.precio_alpormayor != null && (
                              <span
                                className="p1-cart-modal__tag"
                                style={{ background: `${btn}18`, color: btn }}
                              >
                                Mayorista
                              </span>
                            )}
                        </div>
                        <div className="p1-cart-modal__precios">
                          <span
                            style={{ color: `${txt}70`, fontSize: "0.82rem" }}
                          >
                            {formatPrice(item.precio_unitario)} ×{" "}
                            {item.cantidad}
                          </span>
                          <span style={{ color: titl, fontWeight: 800 }}>
                            ={" "}
                            {formatPrice(
                              (item.precio_unitario ?? 0) *
                                (item.cantidad ?? 1),
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        className="p1-cart-modal__del"
                        style={{ color: `${txt}40`, borderColor: `${txt}20` }}
                        onClick={() => eliminar(i)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div
                  className="p1-cart-modal__resumen"
                  style={{ background: `${sec}08`, borderColor: `${sec}20` }}
                >
                  <div className="p1-cart-modal__resumen-row">
                    <span style={{ color: `${txt}70` }}>
                      Subtotal ({cantTotal} items)
                    </span>
                    <span style={{ color: txt, fontWeight: 700 }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="p1-cart-modal__resumen-row p1-cart-modal__resumen-row--total">
                    <span style={{ color: titl, fontWeight: 800 }}>Total</span>
                    <span
                      style={{
                        color: titl,
                        fontWeight: 900,
                        fontSize: "1.25rem",
                      }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  className="p1-cart-modal__cta"
                  style={{
                    background: "linear-gradient(135deg, #5eca4a, #29a127)",
                    color: "#fff",
                    boxShadow: `0 6px 24px ${btn}55`,
                  }}
                  onClick={() => setVista("formulario")}
                >
                  {pasarela
                    ? "💳 Pagar mi carrito"
                    : "💬 Hacer pedido — WhatsApp"}
                </button>
              </>
            )}
          </>
        )}

        {/* ── VISTA FORMULARIO ── */}
        {vista === "formulario" && (
          <>
            <div
              className="p1-cart-modal__header"
              style={{ borderColor: `${sec}20` }}
            >
              <div>
                <span
                  className="p1-cart-modal__eyebrow"
                  style={{ color: titl }}
                >
                  📋 Último paso
                </span>

                <h2 className="p1-cart-modal__titulo" style={{ color: titl }}>
                  Datos para tu pedido
                </h2>
              </div>

              <button
                className="p1-cart-modal__close"
                style={{ color: `${txt}60` }}
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <div className="p1-cart-confirm">
              {/* ── Explicación ── */}
              <div
                className="p1-cart-confirm__intro"
                style={{
                  background: `${sec}0d`,
                  borderColor: `${sec}22`,
                }}
              >
                <div className="p1-cart-confirm__intro-icon">📦</div>

                <div>
                  <strong style={{ color: titl }}>
                    ¿A dónde enviamos tu pedido?
                  </strong>

                  <p
                    style={{
                      color: `${txt}85`,
                      fontSize: "0.83rem",
                      margin: "4px 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    Necesitamos estos datos para poder contactarte, confirmar tu
                    pedido y coordinar la entrega. Todos los campos son
                    obligatorios.
                  </p>
                </div>
              </div>

              {/* ── Resumen ── */}
              <div
                className="p1-cart-confirm__resumen"
                style={{
                  background: `${sec}0d`,
                  borderColor: `${sec}25`,
                }}
              >
                <span
                  style={{
                    color: `${txt}80`,
                    fontSize: "0.84rem",
                  }}
                >
                  {cantTotal} {cantTotal === 1 ? "producto" : "productos"}
                </span>

                <span
                  style={{
                    color: titl,
                    fontWeight: 900,
                    fontSize: "1.1rem",
                  }}
                >
                  {formatPrice(total)}
                </span>
              </div>

              {/* ── Nombres y apellidos ── */}
              <div className="p1-cart-confirm__row">
                <div className="p1-cart-confirm__field">
                  <label
                    className="p1-cart-confirm__label"
                    style={{ color: titl }}
                  >
                    👤 Nombres
                  </label>

                  <input
                    className="p1-cart-confirm__input"
                    type="text"
                    placeholder="Ej. Juan Carlos"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    style={{
                      borderColor: `${sec}40`,
                      color: txt,
                      background: `${sec}06`,
                    }}
                  />

                  {nombresErr && (
                    <span className="p1-cart-confirm__err">⚠ {nombresErr}</span>
                  )}
                </div>

                <div className="p1-cart-confirm__field">
                  <label
                    className="p1-cart-confirm__label"
                    style={{ color: titl }}
                  >
                    👤 Apellidos
                  </label>

                  <input
                    className="p1-cart-confirm__input"
                    type="text"
                    placeholder="Ej. Quintero López"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    style={{
                      borderColor: `${sec}40`,
                      color: txt,
                      background: `${sec}06`,
                    }}
                  />

                  {apellidosErr && (
                    <span className="p1-cart-confirm__err">
                      ⚠ {apellidosErr}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Correo ── */}
              <div className="p1-cart-confirm__field">
                <label
                  className="p1-cart-confirm__label"
                  style={{ color: titl }}
                >
                  📧 Correo electrónico
                </label>

                <input
                  className={`p1-cart-confirm__input ${
                    correoErr ? "p1-cart-confirm__input--err" : ""
                  }`}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setCorreoErr("");
                  }}
                  style={{
                    borderColor: correoErr ? "#ef4444" : `${sec}40`,
                    color: txt,
                    background: `${sec}06`,
                  }}
                />

                {correoErr && (
                  <span className="p1-cart-confirm__err">⚠ {correoErr}</span>
                )}
              </div>

              {/* ── Teléfono ── */}
              <div className="p1-cart-confirm__field">
                <label
                  className="p1-cart-confirm__label"
                  style={{ color: titl }}
                >
                  📱 Número de teléfono
                </label>

                <input
                  className="p1-cart-confirm__input"
                  type="tel"
                  inputMode="tel"
                  placeholder="Ej. 300 123 4567"
                  value={telefonoformulario}
                  onChange={(e) => setTelefonoformulario(e.target.value)}
                  style={{
                    borderColor: `${sec}40`,
                    color: txt,
                    background: `${sec}06`,
                  }}
                />

                {telefonoErr && (
                  <span className="p1-cart-confirm__err">⚠ {telefonoErr}</span>
                )}
              </div>

              {/* ── Ciudad ── */}
              <div className="p1-cart-confirm__field">
                <label
                  className="p1-cart-confirm__label"
                  style={{ color: titl }}
                >
                  📍 Ciudad
                </label>

                <input
                  className="p1-cart-confirm__input"
                  type="text"
                  placeholder="Ej. Cali"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  style={{
                    borderColor: `${sec}40`,
                    color: txt,
                    background: `${sec}06`,
                  }}
                />

                {ciudadErr && (
                  <span className="p1-cart-confirm__err">⚠ {ciudadErr}</span>
                )}
              </div>

              {/* ── Dirección ── */}
              <div className="p1-cart-confirm__field">
                <label
                  className="p1-cart-confirm__label"
                  style={{ color: titl }}
                >
                  🏠 Dirección de entrega
                </label>

                <input
                  className="p1-cart-confirm__input"
                  type="text"
                  placeholder="Ej. Calle 10 # 25-30, Apto 201"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  style={{
                    borderColor: `${sec}40`,
                    color: txt,
                    background: `${sec}06`,
                  }}
                />

                {direccionErr && (
                  <span className="p1-cart-confirm__err">⚠ {direccionErr}</span>
                )}
              </div>

              {/* ── Información ── */}
              <div
                className="p1-cart-confirm__info"
                style={{
                  background: `${sec}0d`,
                  borderColor: `${sec}22`,
                }}
              >
                <span className="p1-cart-confirm__info-icon">🔒</span>

                <p
                  style={{
                    color: `${txt}85`,
                    fontSize: "0.83rem",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  Usaremos estos datos únicamente para comunicarnos contigo
                  sobre tu pedido y coordinar su entrega.
                </p>
              </div>

              {/* ── Botones ── */}
              <div className="p1-cart-confirm__btns">
                <button
                  className="p1-cart-confirm__back"
                  style={{
                    borderColor: `${sec}40`,
                    color: `${txt}80`,
                  }}
                  onClick={() => {
                    setVista("carrito");

                    setCorreoErr("");
                    setNombresErr("");
                    setApellidosErr("");
                    setTelefonoErr("");
                    setCiudadErr("");
                    setDireccionErr("");
                  }}
                  disabled={cargando}
                >
                  ← Volver
                </button>

                <button
                  className="p1-cart-confirm__submit"
                  style={{
                    background: "linear-gradient(135deg, #5eca4a, #29a127)",
                    color: "#fff",
                  }}
                  onClick={() => confirmarPedido()}
                  disabled={cargando}
                >
                  {cargando ? (
                    <span className="p1-cart-confirm__spinner" />
                  ) : (
                    "✓ Confirmar pedido"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CarritoModal;
