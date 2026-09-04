import { useState } from "react";
import "../styles/buscarpedidos..css";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import { BuscarPedidosCliente, TraerProductosPedido } from "../api/axios.js";

const ESTADOS_PEDIDO = [
  { id: "pendiente", label: "Pendiente", icon: "✓" },
  { id: "confirmado", label: "Confirmado", icon: "✓" },
  { id: "enviado", label: "Enviado", icon: "→" },
  { id: "entregado", label: "Entregado", icon: "✓" },
];

const normalizarEstado = (estado) =>
  String(estado ?? "pendiente")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-");

function BuscarPedidos() {
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [activeField, setActiveField] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [pedidoAbierto, setPedidoAbierto] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState({});
  const [pedidoCargando, setPedidoCargando] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const hasSearchValue = correo.trim() || telefono.trim();

  function contactarWhatsapp(telefono, id_pedido) {
    const mensaje = `Hola, tengo dudas sobre mi pedido. Mi número de pedido es #${id_pedido}. ¿Me podrían ayudar con la información?`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
  }

  const formatMoney = (value) => {
    const numeric = Number(value ?? 0);
    return `$ ${numeric.toLocaleString("es-CO")}`;
  };

  const getPedidoProductos = (pedido) => {
    if (!pedido || typeof pedido !== "object") return [];

    const candidates = [pedido.productos, pedido.detalle, pedido.items];
    const found = candidates.find((item) => Array.isArray(item));
    return Array.isArray(found) ? found : [];
  };

  const handleSearch = async () => {
    if (telefono.length != 0 && correo.length != 0) {
      mostrarAlerta("error", "Por favor, ingresa solo uno de los dos campos.");
      return;
    }
    try {
      const res = await BuscarPedidosCliente({
        correo: correo,
        telefono: telefono,
      });
      const results = Array.isArray(res?.data) ? res.data : [];
      setPedidos(results);
      setPedidoAbierto(null);
      setDetallesPedido({});

      if (results.length > 0) {
        console.log(results);
        return mostrarAlerta("success", "pedidos encontrados");
      }
      mostrarAlerta("error", "no se encontro ningun pedido asociado");
    } catch {
      setPedidos([]);
      mostrarAlerta("error", "error al traer los pedidos");
    }
  };

  const ProductosPedido = async (id) => {
    if (pedidoAbierto === id) {
      setPedidoAbierto(null);
      return;
    }

    if (detallesPedido[id]) {
      setPedidoAbierto(id);
      return;
    }

    setPedidoAbierto(id);
    setPedidoCargando(id);
    try {
      const res = await TraerProductosPedido(id);
      setDetallesPedido((detalles) => ({ ...detalles, [id]: res.data }));
      setPedidoAbierto(id);
      console.log(res.data);
    } catch {
      setPedidoAbierto(null);
      mostrarAlerta("error", "error trayendo el detalle del producto");
    } finally {
      setPedidoCargando(null);
    }
  };

  return (
    <>
      <Navbar id={4} />
      <main className="buscar-pedidos">
        <div className="buscar-pedidos__glow buscar-pedidos__glow--one" />
        <div className="buscar-pedidos__glow buscar-pedidos__glow--two" />
        {/* ── Encabezado ── */}
        <section className="buscar-pedidos__hero">
          <div className="buscar-pedidos__hero-icon">🔎</div>

          <div>
            <span className="buscar-pedidos__eyebrow">
              Seguimiento de pedidos
            </span>

            <h1 className="buscar-pedidos__title">Consulta tu pedido</h1>

            <p className="buscar-pedidos__description">
              Ingresa tu correo electrónico o número de teléfono para consultar
              el estado de tu pedido.
            </p>
          </div>
        </section>

        {/* ── Formulario ── */}
        <section className="buscar-pedidos__card">
          <div className="buscar-pedidos__card-header">
            <div>
              <h2>Buscar pedido</h2>

              <p>
                Utiliza cualquiera de los siguientes datos para encontrar tu
                pedido.
              </p>
            </div>

            <span className="buscar-pedidos__secure">🔒</span>
          </div>

          <div className="buscar-pedidos__fields">
            {/* Correo */}
            <div
              className={`buscar-pedidos__field ${activeField === "correo" ? "is-active" : ""} ${correo ? "has-value" : ""}`}
            >
              <label htmlFor="correo">
                <span>📧</span>
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                onFocus={() => setActiveField("correo")}
                onBlur={() => setActiveField("")}
              />

              <span className="buscar-pedidos__hint">
                El correo utilizado al realizar el pedido.
              </span>
            </div>

            <div className="buscar-pedidos__separator">
              <span>O</span>
            </div>

            {/* Teléfono */}
            <div
              className={`buscar-pedidos__field ${activeField === "telefono" ? "is-active" : ""} ${telefono ? "has-value" : ""}`}
            >
              <label htmlFor="telefono">
                <span>📱</span>
                Número de teléfono
              </label>

              <input
                id="telefono"
                type="tel"
                inputMode="tel"
                placeholder="300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                onFocus={() => setActiveField("telefono")}
                onBlur={() => setActiveField("")}
              />

              <span className="buscar-pedidos__hint">
                El número utilizado para realizar el pedido.
              </span>
            </div>
          </div>

          {/* Botón */}
          <button
            type="button"
            className="buscar-pedidos__button"
            disabled={!hasSearchValue}
            aria-disabled={!hasSearchValue}
            onClick={handleSearch}
          >
            <span>🔎</span>
            Buscar pedido
          </button>

          {/* Nota */}
          <div className="buscar-pedidos__info">
            <span>💡</span>

            <p>
              Puedes utilizar cualquiera de los dos datos. No necesitas ingresar
              ambos.
            </p>
          </div>
        </section>

        {/* ── Resultado ── */}
        {pedidos.length > 0 ? (
          <section className="buscar-pedidos__result buscar-pedidos__result--list">
            <div className="buscar-pedidos__result-header">
              <div className="buscar-pedidos__result-icon">📦</div>

              <div>
                <h2>Resultados de tu búsqueda</h2>
                <p>Se encontraron {pedidos.length} pedido(s).</p>
              </div>
            </div>

            <div className="buscar-pedidos__pedido-list">
              {pedidos.map((pedido, pedidoIndex) => {
                const labelPedido = pedido.id ?? `Pedido ${pedidoIndex + 1}`;
                const estadoPedido = String(pedido.estado ?? "pendiente");
                const estadoClase = normalizarEstado(estadoPedido);
                const detallePedido = detallesPedido[pedido.id];
                const productosPedido = getPedidoProductos(detallePedido);
                const estaAbierto = pedidoAbierto === pedido.id;
                const estaCargando = pedidoCargando === pedido.id;
                const indiceEstado = ESTADOS_PEDIDO.findIndex(
                  ({ id }) => id === estadoClase,
                );
                const pedidoCancelado = ["cancelado", "rechazado"].includes(
                  estadoClase,
                );

                return (
                  <article
                    key={
                      pedido.id ??
                      `${pedido.correocliente ?? "pedido"}-${pedidoIndex}`
                    }
                    className={`buscar-pedidos__pedido ${estaAbierto ? "is-open" : ""}`}
                    onClick={() => ProductosPedido(pedido.id)}
                  >
                    <div className="buscar-pedidos__pedido-top">
                      <span className="buscar-pedidos__pedido-id">
                        Pedido #{labelPedido}
                      </span>
                      <span
                        className={`buscar-pedidos__pedido-status buscar-pedidos__pedido-status--${estadoClase}`}
                      >
                        <i aria-hidden="true" />
                        {estadoPedido}
                      </span>
                    </div>

                    <div className="buscar-pedidos__pedido-meta">
                      {pedido.correocliente && (
                        <span>✉️ {pedido.correocliente}</span>
                      )}
                      {pedido.telefonocliente && (
                        <span>📱 {pedido.telefonocliente}</span>
                      )}
                      {pedido.numeroguia && (
                        <span style={{ fontWeight: "bold" }}>
                          🚚 Guía: {pedido.numeroguia}
                        </span>
                      )}
                      {pedido.fecha_creacion && (
                        <span>
                          📅{" "}
                          {new Date(pedido.fecha_creacion).toLocaleDateString(
                            "es-CO",
                          )}
                        </span>
                      )}
                      {pedido.telefonotienda && (
                        <button
                          className="btn-contactar"
                          onClick={() =>
                            contactarWhatsapp(pedido.telefonotienda, pedido.id)
                          }
                        >
                          Contactar a la tienda
                        </button>
                      )}
                    </div>

                    {estaAbierto && (
                      <>
                        {pedidoCancelado ? (
                          <p className="buscar-pedidos__pedido-cancelled">
                            Este pedido fue {estadoPedido.toLowerCase()}.
                          </p>
                        ) : (
                          <div className="buscar-pedidos__tracking">
                            <div className="buscar-pedidos__tracking-header">
                              <span>Seguimiento del pedido</span>
                              <strong>{estadoPedido}</strong>
                            </div>
                            <ol className="buscar-pedidos__timeline">
                              {ESTADOS_PEDIDO.map((estado, index) => (
                                <li
                                  key={estado.id}
                                  className={
                                    index <= indiceEstado ? "is-complete" : ""
                                  }
                                >
                                  <span>{estado.icon}</span>
                                  <small>{estado.label}</small>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {productosPedido.length > 0 ? (
                          <div className="buscar-pedidos__productos">
                            <div className="buscar-pedidos__productos-header">
                              <span>Detalle del pedido</span>
                              <span className="buscar-pedidos__productos-count">
                                {productosPedido.length} producto
                                {productosPedido.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="buscar-pedidos__producto-list">
                              {productosPedido.map((producto, itemIndex) => {
                                const nombreProducto =
                                  producto.nombre ??
                                  producto.producto ??
                                  producto.producto_nombre ??
                                  `Producto ${itemIndex + 1}`;
                                const cantidadProducto =
                                  producto.cantidad ??
                                  producto.quantity ??
                                  producto.qty ??
                                  producto.cantidad_total ??
                                  1;
                                const precioProducto =
                                  producto.subtotal ??
                                  producto.precio_total ??
                                  producto.total ??
                                  producto.precio_unitario ??
                                  producto.precio ??
                                  producto.valor ??
                                  0;
                                const varianteProducto = [
                                  producto.variante?.talla &&
                                    "Talla: " + producto.variante.talla,
                                  producto.variante?.color,
                                  producto.variante?.referencia &&
                                    "Ref. " + producto.variante.referencia,
                                ]
                                  .filter(Boolean)
                                  .join(" · ");

                                return (
                                  <button
                                    type="button"
                                    key={
                                      producto.id ??
                                      `${labelPedido}-${itemIndex}`
                                    }
                                    className="buscar-pedidos__producto-item"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setProductoSeleccionado(producto);
                                    }}
                                  >
                                    <span className="buscar-pedidos__producto-number">
                                      {String(itemIndex + 1).padStart(2, "0")}
                                    </span>

                                    <div className="buscar-pedidos__producto-info">
                                      <span className="buscar-pedidos__producto-name">
                                        {nombreProducto}
                                      </span>
                                      <span className="buscar-pedidos__producto-meta">
                                        Cantidad: {cantidadProducto} und.
                                        {varianteProducto &&
                                          ` · ${varianteProducto}`}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="buscar-pedidos__pedido-empty">
                            <span aria-hidden="true">ℹ️</span>
                            <p>
                              {estaCargando
                                ? "Cargando detalle del pedido..."
                                : "Sin detalle de productos disponible."}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div className="buscar-pedidos__pedido-total">
                      <span>Total</span>
                      <strong>{formatMoney(pedido.totalcompra ?? 0)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="buscar-pedidos__result">
            <div className="buscar-pedidos__result-icon">📦</div>

            <h2>Tus pedidos aparecerán aquí</h2>

            <p>
              Ingresa tu correo electrónico o número de teléfono y presiona{" "}
              <strong>“Buscar pedido”</strong> para consultar tus pedidos.
            </p>
          </section>
        )}
      </main>

      {productoSeleccionado && (
        <div
          className="buscar-pedidos__product-modal"
          role="presentation"
          onClick={() => setProductoSeleccionado(null)}
        >
          <section
            className="buscar-pedidos__product-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-producto-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="buscar-pedidos__product-close"
              aria-label="Cerrar detalle del producto"
              onClick={() => setProductoSeleccionado(null)}
            >
              ×
            </button>

            <div className="buscar-pedidos__product-image">
              {productoSeleccionado.variante?.imagen ? (
                <img
                  src={productoSeleccionado.variante.imagen}
                  alt={productoSeleccionado.nombre ?? "Producto"}
                />
              ) : (
                <span aria-hidden="true">📦</span>
              )}
            </div>

            <div className="buscar-pedidos__product-content">
              <span className="buscar-pedidos__product-eyebrow">
                Detalle del producto
              </span>
              <h2 id="detalle-producto-titulo">
                {productoSeleccionado.nombre ?? "Producto"}
              </h2>
              <p className="buscar-pedidos__product-description">
                {productoSeleccionado.descripcion ??
                  "Este producto no tiene una descripción disponible."}
              </p>

              <div className="buscar-pedidos__product-attributes">
                {productoSeleccionado.variante?.marca && (
                  <span>
                    <small>Marca</small>
                    {productoSeleccionado.variante.marca}
                  </span>
                )}
                {productoSeleccionado.variante?.referencia && (
                  <span>
                    <small>Referencia</small>
                    {productoSeleccionado.variante.referencia}
                  </span>
                )}
                {productoSeleccionado.variante?.color && (
                  <span>
                    <small>Color</small>
                    {productoSeleccionado.variante.color}
                  </span>
                )}
                {productoSeleccionado.variante?.talla && (
                  <span>
                    <small>Talla</small>
                    {productoSeleccionado.variante.talla}
                  </span>
                )}
              </div>

              <div className="buscar-pedidos__product-summary">
                <span>
                  <small>Cantidad</small>
                  {productoSeleccionado.cantidad ?? 1} und.
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default BuscarPedidos;
