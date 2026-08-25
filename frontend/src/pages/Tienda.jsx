import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MirarVariantes,
  TraerTiendaCliente,
  TraerProductosDominio,
} from "../api/axios";
import "../styles/tienda.css";
import { CarritoCompras } from "../utils/icons";
import { mostrarAlerta } from "../utils/alerts";

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
function formatPrice(n) {
  if (n == null) return "";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

/* ══════════════════════════════════════════
   Navbar de la tienda — usa colores propios
══════════════════════════════════════════ */
function TiendaNavbar({ nombre, estilos, logo, hayOfertas }) {
  const bg = estilos?.color_principal ?? "#2259d7";
  const sec = estilos?.color_secundario ?? "#2259d7";
  const txt = estilos?.title_color ?? "#fff";
  const textColor = estilos?.text_color ?? "#242f43";
  const cart = estilos?.color_carrito ?? "#35a4ec";
  const btn = estilos?.color_botones ?? "#35a4ec";

  const [bolsaVisible, setBolsaVisible] = useState(false);
  const [items, setItems] = useState([]);

  // Leer bolsa del localStorage cada vez que se abre el panel
  const abrirBolsa = () => {
    const datos = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
    setItems(datos);
    setBolsaVisible((v) => !v);
  };

  const eliminarItem = (index) => {
    const nueva = items.filter((_, i) => i !== index);
    setItems(nueva);
    localStorage.setItem("bolsa", JSON.stringify(nueva));
  };

  const total = items.reduce(
    (acc, item) => acc + (item.precio_unitario ?? 0) * (item.cantidad ?? 1),
    0,
  );

  const cantidadTotal = items.reduce(
    (acc, item) => acc + (item.cantidad ?? 1),
    0,
  );

  return (
    <header
      className="tn-navbar"
      style={{
        background: `linear-gradient(to right, ${bg} 40%, ${sec + "70"} 100%)`,
        boxShadow: `0px 0px 15px ${sec}`,
      }}
    >
      <div className="tn-navbar__brand">
        {logo ? (
          <img src={logo} alt={nombre} className="tn-navbar__logo" />
        ) : (
          <span className="tn-navbar__initial" style={{ background: cart }}>
            {nombre?.[0]?.toUpperCase()}
          </span>
        )}
        <span className="tn-navbar__name" style={{ color: txt }}>
          {nombre}
        </span>
      </div>

      <nav className="tn-navbar__links">
        <a href="#info" className="tn-navbar__link" style={{ color: txt }}>
          Nosotros
        </a>
        {hayOfertas && (
          <a href="#ofertas" className="tn-navbar__link" style={{ color: txt }}>
            Ofertas
          </a>
        )}
        <a
          href="#colecciones"
          className="tn-navbar__link"
          style={{ color: txt }}
        >
          Colecciones
        </a>
        <a href="#contacto" className="tn-navbar__link" style={{ color: txt }}>
          Contacto
        </a>
      </nav>

      {/* Ícono carrito */}
      <div className="tn-navbar__contenedor-carrito" onClick={abrirBolsa}>
        <CarritoCompras width={38} height={38} fill={cart} />
        {cantidadTotal > 0 && (
          <span className="tn-navbar__badge" style={{ background: cart }}>
            {cantidadTotal}
          </span>
        )}
      </div>

      {/* Panel bolsa */}
      {bolsaVisible && (
        <>
          {/* Overlay para cerrar al click fuera */}
          <div
            className="bolsa-overlay"
            onClick={() => setBolsaVisible(false)}
          />
          <div
            className="bolsa-panel"
            style={{
              background: bg,
              border: `1px solid ${sec}50`,
              boxShadow: `0 8px 40px ${sec}60`,
            }}
          >
            {/* Header */}
            <div className="bolsa-panel__header">
              <span className="bolsa-panel__title" style={{ color: txt }}>
                🛒 Mi bolsa
              </span>
              <button
                className="bolsa-panel__close"
                style={{ color: txt, borderColor: `${txt}40` }}
                onClick={() => setBolsaVisible(false)}
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              /* Vacía */
              <div className="bolsa-panel__empty">
                <span className="bolsa-panel__empty-icon">🛍️</span>
                <p style={{ color: `${txt}99` }}>Tu bolsa está vacía</p>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                <ul className="bolsa-panel__list">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="bolsa-item"
                      style={{ borderColor: `${sec}30` }}
                    >
                      {/* Imagen / placeholder */}
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="bolsa-item__img"
                        />
                      ) : (
                        <div
                          className="bolsa-item__placeholder"
                          style={{
                            background: `linear-gradient(135deg, ${sec}30, ${btn}25)`,
                            color: btn,
                          }}
                        >
                          {item.nombre?.[0]?.toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div className="bolsa-item__info">
                        <span
                          className="bolsa-item__nombre"
                          style={{ color: txt }}
                        >
                          {item.nombre}
                        </span>
                        <div className="bolsa-item__meta">
                          {item.talla && (
                            <span
                              className="bolsa-item__tag"
                              style={{ background: `${btn}22`, color: btn }}
                            >
                              {item.talla}
                            </span>
                          )}
                          {item.color && (
                            <span
                              className="bolsa-item__tag"
                              style={{ background: `${btn}22`, color: btn }}
                            >
                              {item.color}
                            </span>
                          )}
                          <span
                            className="bolsa-item__cant"
                            style={{ color: `${txt}80` }}
                          >
                            x{item.cantidad}
                          </span>
                        </div>
                        <span
                          className="bolsa-item__precio"
                          style={{ color: btn }}
                        >
                          {formatPrice(item.precio_unitario * item.cantidad)}
                        </span>
                      </div>

                      {/* Eliminar */}
                      <button
                        className="bolsa-item__del"
                        style={{ color: `${txt}60`, borderColor: `${txt}25` }}
                        onClick={() => eliminarItem(i)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Footer total + botón */}
                <div
                  className="bolsa-panel__footer"
                  style={{ borderColor: `${sec}30` }}
                >
                  <div className="bolsa-panel__total">
                    <span style={{ color: `${txt}90`, fontSize: "0.82rem" }}>
                      Total ({cantidadTotal}{" "}
                      {cantidadTotal === 1 ? "producto" : "productos"})
                    </span>
                    <span
                      className="bolsa-panel__total-price"
                      style={{ color: btn }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>
                  <button
                    className="bolsa-panel__btn-carrito"
                    style={{
                      background: `linear-gradient(135deg, ${btn}, ${sec})`,
                      boxShadow: `0 4px 18px ${btn}55`,
                    }}
                    onClick={() =>
                      console.log(
                        "bolsa:",
                        JSON.parse(localStorage.getItem("bolsa") ?? "[]"),
                      )
                    }
                  >
                    Ir a mi carrito →
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════
   Footer de la tienda
══════════════════════════════════════════ */
function TiendaFooter({ nombre, estilos, telefono, direccion }) {
  const bg = estilos?.color_principal ?? "#2259d7";
  const txt = estilos?.title_color ?? "#fff";
  const sub = estilos?.text_color ?? "#e0e7ff";

  return (
    <footer className="tn-footer" style={{ background: bg }}>
      <div className="tn-footer__content">
        <div className="tn-footer__brand">
          <strong style={{ color: txt }}>{nombre}</strong>
          <p style={{ color: sub }}>Tu tienda de confianza</p>
        </div>
        <div className="tn-footer__info">
          {telefono && (
            <div className="tn-footer__row">
              <span style={{ color: sub }}>📞</span>
              <span style={{ color: txt }}>{telefono}</span>
            </div>
          )}
          {direccion && (
            <div className="tn-footer__row">
              <span style={{ color: sub }}>📍</span>
              <span style={{ color: txt }}>{direccion}</span>
            </div>
          )}
        </div>
        <div className="tn-footer__credit">
          <p style={{ color: sub }}>
            Powered by <strong style={{ color: txt }}>NWBIQShop</strong>
          </p>
        </div>
      </div>
      <p className="tn-footer__copy" style={{ color: sub }}>
        © {new Date().getFullYear()} {nombre}. Todos los derechos reservados.
      </p>
    </footer>
  );
}

/* ══════════════════════════════════════════
   Tarjeta de producto en oferta
══════════════════════════════════════════ */
function ProductoOfertaCard({ producto, estilos, abrirmodal }) {
  const btnColor = estilos?.color_botones ?? "#35a4ec";
  const titleColor = estilos?.title_color ?? "#042d78";
  const textColor = estilos?.text_color ?? "#242f43";
  const secColor = estilos?.color_secundario ?? "#2d75e4";

  return (
    <div className="tn-product-card" style={{ "--card-accent": btnColor }}>
      <div className="tn-product-card__badge" style={{ background: btnColor }}>
        -{producto.descuento}%
      </div>

      <div
        className="tn-product-card__img"
        style={{
          background: `linear-gradient(135deg, ${secColor}33, ${btnColor}33)`,
        }}
      >
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} />
        ) : (
          <span
            className="tn-product-card__placeholder"
            style={{ color: btnColor }}
          >
            {producto.nombre[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="tn-product-card__body">
        <h3 className="tn-product-card__name" style={{ color: titleColor }}>
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="tn-product-card__desc" style={{ color: textColor }}>
            {producto.descripcion}
          </p>
        )}

        <div className="tn-product-card__pricing">
          <span className="tn-product-card__original">
            {formatPrice(producto.precio_original)}
          </span>
          <span className="tn-product-card__final" style={{ color: btnColor }}>
            {formatPrice(producto.precio_final)}
          </span>
        </div>

        <button
          className="tn-product-card__btn"
          style={{ background: btnColor }}
          onClick={() => abrirmodal(producto)}
        >
          Ver producto →
        </button>
      </div>
    </div>
  );
}

function ModalProducto({ estilos, setmodal, producto }) {
  const bg = estilos?.color_principal ?? "#2259d7";
  const sec = estilos?.color_secundario ?? "#2d75e4";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";
  const btn = estilos?.color_botones ?? "#35a4ec";

  const [variantes, setvariantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Para productos con variantes: variante seleccionada
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  // Cantidad
  const [cantidad, setCantidad] = useState(1);

  const esVariantes = producto.tipo === "variantes";

  const mirarvariantes = async () => {
    try {
      const res = await MirarVariantes(producto.id);
      setvariantes(res.data);
      if (res.data.length > 0) {
        // Preseleccionar la primera variante que tenga imagen; si ninguna tiene, la primera
        const conImagen = res.data.find((v) => v.imagen);
        setVarianteSeleccionada(conImagen ?? res.data[0]);
      }
    } catch (err) {
      mostrarAlerta("error", "Error trayendo las variantes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    mirarvariantes();
  }, []);

  // Máximo disponible según selección
  const maxCantidad = varianteSeleccionada?.cantidad ?? 1;

  const incrementar = () => setCantidad((c) => Math.min(c + 1, maxCantidad));
  const decrementar = () => setCantidad((c) => Math.max(c - 1, 1));

  // Cuando cambia la variante, resetear cantidad a 1
  const seleccionarVariante = (v) => {
    setVarianteSeleccionada(v);
    setCantidad(1);
  };

  const agregarAlCarrito = () => {
    if (!varianteSeleccionada) {
      mostrarAlerta("error", "Selecciona una opción antes de continuar");
      return;
    }

    const bolsaActual = JSON.parse(localStorage.getItem("bolsa") ?? "[]");

    // Precio efectivo del producto
    const precioUnitario =
      producto.precio_final ?? producto.precio_original ?? producto.precio ?? 0;

    const item = {
      producto_id: producto.id,
      variante_id: varianteSeleccionada.id,
      tipo: producto.tipo,
      cantidad,
      // Datos visuales para el panel de bolsa
      nombre: producto.nombre,
      imagen: varianteSeleccionada.imagen ?? null,
      talla: varianteSeleccionada.talla ?? null,
      color: varianteSeleccionada.color ?? null,
      precio_unitario: Number(precioUnitario),
    };

    bolsaActual.push(item);
    localStorage.setItem("bolsa", JSON.stringify(bolsaActual));
    mostrarAlerta("success", "¡Producto agregado a tu bolsa!");
    setmodal(false);
  };

  // Precio a mostrar
  const precio =
    producto.precio_final ?? producto.precio_original ?? producto.precio;

  return (
    <div
      className="contenedor-productos-tienda"
      style={{ backgroundColor: `color-mix(in srgb, ${sec}40 50%, black)` }}
      onClick={(e) => e.target === e.currentTarget && setmodal(false)}
    >
      <div
        className="mp-modal"
        style={{
          backgroundColor: bg,
          border: `1px solid ${sec}50`,
          boxShadow: `0 8px 48px ${sec}55`,
        }}
      >
        {/* Botón cerrar */}
        <button
          className="mp-close"
          style={{ color: sec, borderColor: `${sec}50` }}
          onClick={() => setmodal(false)}
        >
          ✕
        </button>

        {/* Imágenes */}
        <div className="mp-images">
          <div
            className="mp-img-main"
            style={{ background: `linear-gradient(135deg, ${sec}25, ${btn}20)` }}
          >
            {/* Imagen dinámica: variante seleccionada → imagen de variante, si no → imagen del producto → placeholder */}
            {(varianteSeleccionada?.imagen || producto.imagen) ? (
              <img src={varianteSeleccionada?.imagen ?? producto.imagen} alt={producto.nombre} />
            ) : (
              <span className="mp-img-placeholder" style={{ color: btn }}>
                {producto.nombre?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mp-info">
          {/* Badge tipo */}
          <span
            className="mp-badge"
            style={{ background: `${btn}22`, color: btn }}
          >
            {esVariantes ? "✦ Con variantes" : "✦ Producto simple"}
          </span>

          <h2 className="mp-title" style={{ color: titl }}>
            {producto.nombre}
          </h2>

          {producto.descripcion && (
            <p className="mp-desc" style={{ color: txt }}>
              {producto.descripcion}
            </p>
          )}

          {/* Precio */}
          <div className="mp-pricing">
            {producto.precio_final ? (
              <>
                <span className="mp-price-original">
                  {formatPrice(producto.precio_original)}
                </span>
                <span className="mp-price-final" style={{ color: btn }}>
                  {formatPrice(producto.precio_final)}
                </span>
                {producto.descuento && (
                  <span
                    className="mp-discount-badge"
                    style={{ background: btn, color: "#fff" }}
                  >
                    -{producto.descuento}%
                  </span>
                )}
              </>
            ) : (
              <span className="mp-price-final" style={{ color: btn }}>
                {formatPrice(precio)}
              </span>
            )}
          </div>

          {/* Variantes o simple */}
          {cargando ? (
            <div className="mp-loading">
              <div className="mp-spinner" style={{ borderTopColor: btn }} />
            </div>
          ) : esVariantes ? (
            <div className="mp-variantes">
              <p className="mp-variantes-label" style={{ color: titl }}>
                Selecciona talla y color:
              </p>
              <div className="mp-variantes-grid">
                {variantes.map((v) => {
                  const seleccionada = varianteSeleccionada?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      className={`mp-variante-btn ${seleccionada ? "mp-variante-btn--active" : ""}`}
                      style={
                        seleccionada
                          ? {
                              background: btn,
                              borderColor: btn,
                              color: "#fff",
                            }
                          : {
                              borderColor: `${sec}50`,
                              color: txt,
                            }
                      }
                      onClick={() => seleccionarVariante(v)}
                    >
                      <span className="mp-variante-talla">{v.talla}</span>
                      <span className="mp-variante-color">{v.color}</span>
                      <span
                        className="mp-variante-stock"
                        style={{
                          color: seleccionada ? "#ffffffaa" : `${txt}80`,
                        }}
                      >
                        {v.cantidad} disp.
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            varianteSeleccionada && (
              <p className="mp-stock-simple" style={{ color: `${txt}90` }}>
                🗃️ Stock disponible:{" "}
                <strong style={{ color: btn }}>
                  {varianteSeleccionada.cantidad}
                </strong>
              </p>
            )
          )}

          {/* Control cantidad */}
          {!cargando && varianteSeleccionada && (
            <div className="mp-cantidad">
              <span
                style={{ color: titl, fontWeight: 700, fontSize: "0.85rem" }}
              >
                Cantidad:
              </span>
              <div className="mp-cantidad-ctrl">
                <button
                  className="mp-qty-btn"
                  style={{ borderColor: `${sec}50`, color: txt }}
                  onClick={decrementar}
                  disabled={cantidad <= 1}
                >
                  −
                </button>
                <span
                  className="mp-qty-value"
                  style={{ color: titl, borderColor: `${sec}30` }}
                >
                  {cantidad}
                </span>
                <button
                  className="mp-qty-btn"
                  style={{ borderColor: `${sec}50`, color: txt }}
                  onClick={incrementar}
                  disabled={cantidad >= maxCantidad}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Botón agregar */}
          <button
            className="mp-add-btn"
            style={{
              background: `linear-gradient(135deg, ${btn}, ${sec})`,
              boxShadow: `0 6px 20px ${btn}55`,
              opacity: cargando || !varianteSeleccionada ? 0.6 : 1,
            }}
            onClick={agregarAlCarrito}
            disabled={cargando || !varianteSeleccionada}
          >
            🛒 Agregar a la bolsa
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Tarjeta de producto de colección (sin descuento)
══════════════════════════════════════════ */
function ColeccionProductoCard({ producto, estilos, abrirmodal }) {
  const btnColor = estilos?.color_botones ?? "#35a4ec";
  const titleColor = estilos?.title_color ?? "#042d78";
  const textColor = estilos?.text_color ?? "#242f43";
  const secColor = estilos?.color_secundario ?? "#2d75e4";

  const descuento = Number(producto.descuento ?? 0);
  const precio = Number(producto.precio ?? 0);

  const preciofinal = precio - precio * (descuento / 100);

  const formatPrice = (n) =>
    n == null ? "" : `$ ${Number(n).toLocaleString("es-CO")}`;

  const products = () => {
    if (producto.precio != preciofinal) {
      return {
        descripcion: producto.nombre,
        descuento: producto.descuento,
        id: producto.id,
        imagen: producto.imagen,
        nombre: producto.nombre,
        precio_final: preciofinal,
        precio_original: producto.precio,
        tipo: producto.tipo,
      };
    } else {
      return {
        descripcion: producto.nombre,
        descuento: producto.descuento,
        id: producto.id,
        imagen: producto.imagen,
        nombre: producto.nombre,
        precio: producto.precio,
        tipo: producto.tipo,
      };
    }
  };

  return (
    <div className="tn-product-card" style={{ "--card-accent": btnColor }}>
      {/* Imagen / placeholder */}
      <div
        className="tn-product-card__img"
        style={{
          background: `linear-gradient(135deg, ${secColor}33, ${btnColor}22)`,
        }}
      >
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} />
        ) : (
          <span
            className="tn-product-card__placeholder"
            style={{ color: btnColor }}
          >
            {producto.nombre?.[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="tn-product-card__body">
        <h3 className="tn-product-card__name" style={{ color: titleColor }}>
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="tn-product-card__desc" style={{ color: textColor }}>
            {producto.descripcion}
          </p>
        )}
        {producto.precio != null && (
          <div className="tn-product-card__pricing">
            {descuento > 0 ? (
              <>
                <span className="tn-product-card__original">
                  {formatPrice(precio)}
                </span>
                <span
                  className="tn-product-card__final"
                  style={{ color: btnColor }}
                >
                  {formatPrice(preciofinal)}
                </span>
                <span
                  className="tn-product-card__badge"
                  style={{
                    background: btnColor,
                    position: "static",
                    padding: "0.2rem 0.55rem",
                  }}
                >
                  -{descuento}%
                </span>
              </>
            ) : (
              <span
                className="tn-product-card__final"
                style={{ color: btnColor }}
              >
                {formatPrice(precio)}
              </span>
            )}
          </div>
        )}
        <button
          className="tn-product-card__btn"
          style={{ background: btnColor }}
          onClick={() => abrirmodal(products)}
        >
          Ver producto →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   404 de tienda (dominio no encontrado)
══════════════════════════════════════════ */
function Tienda404({ dominio }) {
  const nav = useNavigate();
  return (
    <div className="tn-404">
      <div className="tn-404__orb tn-404__orb--one" />
      <div className="tn-404__orb tn-404__orb--two" />
      <div className="tn-404__content">
        <div className="tn-404__code">404</div>
        <h1 className="tn-404__title">Tienda no encontrada</h1>
        <p className="tn-404__desc">
          No existe ninguna tienda con el dominio <strong>"{dominio}"</strong>.
          Es posible que la URL esté incorrecta o que la tienda haya sido
          desactivada.
        </p>
        <div className="tn-404__actions">
          <button
            className="tn-404__btn tn-404__btn--primary"
            onClick={() => nav("/")}
          >
            ← Volver al inicio
          </button>
          <button
            className="tn-404__btn tn-404__btn--ghost"
            onClick={() => nav("/registro")}
          >
            Crear mi tienda gratis
          </button>
        </div>
        <p className="tn-404__hint">
          ¿Eres el dueño de esta tienda? Revisa tu dominio en Opciones.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA TIENDA — principal
══════════════════════════════════════════ */
function Tienda() {
  const { busqueda } = useParams();
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noExiste, setNoExiste] = useState(false);
  const [modal, setmodal] = useState(false);
  const [productoseleccionado, setproductoseleccionado] = useState([]);

  // Productos sueltos — carga lazy con Intersection Observer
  const [productosSueltos, setProductosSueltos] = useState([]);
  const [cargandoSueltos, setCargandoSueltos] = useState(false);
  const [sueltosCargados, setSueltosCargados] = useState(false);
  const triggerRef = useRef(null);

  const abrirmodal = (producto) => {
    setmodal(true);
    setproductoseleccionado(producto);
  };

  useEffect(() => {
    async function traerTienda() {
      try {
        const res = await TraerTiendaCliente(busqueda);
        setTienda(res.data);
        console.log(res.data);
        const existebolsa = localStorage.getItem("bolsa");
        if (existebolsa) {
          localStorage.removeItem("bolsa");
        }
      } catch {
        setNoExiste(true);
      } finally {
        setLoading(false);
      }
    }
    traerTienda();
  }, [busqueda]);

  // Intersection Observer — dispara el fetch de sueltos cuando el trigger entra en viewport
  // Depende de `tienda` para correr DESPUÉS de que el JSX se monte y triggerRef sea válido
  useEffect(() => {
    if (!tienda || sueltosCargados || !triggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          setCargandoSueltos(true);
          TraerProductosDominio(busqueda)
            .then((res) => setProductosSueltos(res.data ?? []))
            .catch(() => {})
            .finally(() => {
              setCargandoSueltos(false);
              setSueltosCargados(true);
            });
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [tienda, busqueda, sueltosCargados]);

  /* Loading */
  if (loading) {
    return (
      <div className="tn-loading">
        <div className="tn-loading__spinner" />
        <p>Cargando tienda…</p>
      </div>
    );
  }

  /* 404 */
  if (noExiste || !tienda) return <Tienda404 dominio={busqueda} />;

  const {
    estilos,
    nombre,
    descripcion,
    actividad,
    telefono,
    direccion,
    datospromocion,
    productos_promo_general,
    productos_promo_unitaria,
  } = tienda;

  const bg = estilos?.color_principal ?? "#2259d7";
  const sec = estilos?.color_secundario ?? "#2d75e4";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";
  const btn = estilos?.color_botones ?? "#35a4ec";

  const hayPromoGeneral =
    datospromocion?.estado && productos_promo_general?.length > 0;
  const hayPromoUnitaria = productos_promo_unitaria?.length > 0;
  const hayOfertas = hayPromoGeneral || hayPromoUnitaria;

  return (
    <div className="tn-page">
      {/* ── Navbar ── */}
      <TiendaNavbar
        nombre={nombre}
        estilos={estilos}
        logo={tienda.logo}
        hayOfertas={hayOfertas}
      />

      {/* ── Hero ── */}
      <section
        className="tn-hero"
        style={{
          background: `linear-gradient(135deg, ${bg} 0%, ${sec} 60%, ${btn}55 100%)`,
        }}
      >
        {/* Decoraciones */}
        <span
          className="tn-hero__orb tn-hero__orb--one"
          style={{ background: btn + "33" }}
        />
        <span
          className="tn-hero__orb tn-hero__orb--two"
          style={{ background: bg + "55" }}
        />

        <div className="tn-hero__content">
          <p
            className="tn-hero__eyebrow"
            style={{ color: btn === "#35a4ec" ? "#bfeaff" : btn + "cc" }}
          >
            Bienvenido a
          </p>
          <h1 className="tn-hero__title" style={{ color: "#fff" }}>
            {nombre}
          </h1>
          {descripcion && (
            <p
              className="tn-hero__desc"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {descripcion}
            </p>
          )}
          {hayOfertas && (
            <a
              href="#ofertas"
              className="tn-hero__cta"
              style={{ background: btn, color: "#fff" }}
            >
              🏷️ Ver ofertas
            </a>
          )}
        </div>
        <div
          className="tn-info__card"
          style={{
            border: `1px solid ${sec + "80"}`,
            boxShadow: `0px 0px 20px ${sec + "90"}`,
            backgroundColor: bg + "120",
          }}
        >
          <div className="tn-info__header">
            <div className="tn-info__icon" style={{ background: bg }}>
              🏪
            </div>
            <div>
              <h2 style={{ color: titl }}>Conócenos</h2>
              <p style={{ color: txt }}>{descripcion}</p>
            </div>
          </div>
          <div className="tn-info__rows">
            {actividad && (
              <div className="tn-info__row">
                <span className="tn-info__label" style={{ color: titl }}>
                  Nos dedicamos a
                </span>
                <span className="tn-info__val" style={{ color: txt }}>
                  {actividad}
                </span>
              </div>
            )}
            {telefono && (
              <div className="tn-info__row">
                <span className="tn-info__label" style={{ color: titl }}>
                  📞 Teléfono
                </span>
                <span className="tn-info__val" style={{ color: txt }}>
                  {telefono}
                </span>
              </div>
            )}
            {direccion && (
              <div className="tn-info__row">
                <span className="tn-info__label" style={{ color: titl }}>
                  📍 Dirección
                </span>
                <span className="tn-info__val" style={{ color: txt }}>
                  {direccion}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Info de la tienda ── */}
      <section
        className="tn-info"
        id="info"
        style={{
          background: sec + "12",
        }}
        onClick={() => console.log(estilos)}
      >

        {/* ── Ofertas ── */}
        {hayOfertas && (
          <section
            className="tn-ofertas"
            id="ofertas"
            style={{ boxShadow: `0px 0px 15px ${sec + "80"}` }}
          >
            {/* Separador decorativo */}
            <div className="tn-ofertas__header">
              <div className="tn-ofertas__badge" style={{ background: btn }}>
                🏷️ Ofertas
              </div>
              <h2 className="tn-ofertas__title" style={{ color: titl }}>
                {datospromocion?.nombre ?? "Ofertas especiales"}
              </h2>
              {datospromocion?.descripcion && (
                <p className="tn-ofertas__desc" style={{ color: txt }}>
                  {datospromocion.descripcion}
                </p>
              )}
              <hr style={{ border: `1px solid ${sec}`, marginTop: "10px" }} />
            </div>
            <div
              className="contenedor-promociones"
              style={{ background: sec + "50" }}
            >
              {/* Promo general */}
              {hayPromoGeneral && (
                <>
                  <p className="tn-ofertas__sublabel" style={{ color: txt }}>
                    🎉 {datospromocion.descuento}% de descuento en productos
                    seleccionados
                  </p>
                  <div className="tn-product-grid">
                    {productos_promo_general.map((p) => (
                      <ProductoOfertaCard
                        key={p.id}
                        producto={p}
                        estilos={estilos}
                        abrirmodal={(pro) => abrirmodal(pro)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Promo unitaria */}
            {hayPromoUnitaria && (
              <>
                <p
                  className="tn-ofertas__sublabel2"
                  style={{ color: titl, marginTop: "2rem" }}
                >
                  🎯 Descuentos exclusivos por producto
                </p>
                <div className="tn-product-grid">
                  {productos_promo_unitaria.map((p) => (
                    <ProductoOfertaCard
                      key={p.id}
                      producto={p}
                      estilos={estilos}
                      abrirmodal={(pro) => abrirmodal(pro)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}
        {/* ── Colecciones ── */}
        {tienda.colecciones?.length > 0 && (
          <section className="tn-colecciones" id="colecciones">
            {/* Encabezado de sección */}
            <div
              className="tn-colecciones__intro"
              style={{ borderColor: sec + "60" }}
            >
              <span className="tn-colecciones__eyebrow" style={{ color: btn }}>
                🗃️ Catálogo
              </span>
              <h2 className="tn-colecciones__titulo" style={{ color: titl }}>
                Mira nuestras colecciones
              </h2>
              <p className="tn-colecciones__incentivo" style={{ color: txt }}>
                Explora todo lo que tenemos para ti. Encuentra exactamente lo
                que buscas y no te pierdas ninguna de nuestras propuestas
                especiales.
              </p>
            </div>

            {/* Colecciones una debajo de la otra */}
            {tienda.colecciones.map((col, idx) => (
              <div key={idx} className="tn-col-bloque">
                {/* Cabecera de la colección */}
                <div
                  className="tn-col-header"
                  style={{
                    background: `linear-gradient(90deg, ${sec}25, ${bg}10)`,
                    borderLeft: `4px solid ${btn}`,
                  }}
                >
                  <div>
                    <h3
                      className="tn-col-header__nombre"
                      style={{ color: titl }}
                    >
                      {col.coleccion_nombre}
                    </h3>
                    {col.coleccion_descripcion && (
                      <p className="tn-col-header__desc" style={{ color: txt }}>
                        {col.coleccion_descripcion}
                      </p>
                    )}
                  </div>
                  <span
                    className="tn-col-header__count"
                    style={{ background: btn + "22", color: btn }}
                  >
                    {col.productos?.length ?? 0} producto
                    {col.productos?.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Productos de la colección */}
                {col.productos?.length > 0 ? (
                  <div className="tn-product-grid tn-col-grid">
                    {col.productos.map((p) => (
                      <ColeccionProductoCard
                        key={p.id}
                        producto={p}
                        estilos={estilos}
                        abrirmodal={(pro) => abrirmodal(pro)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="tn-col-empty" style={{ color: txt + "99" }}>
                    Esta colección aún no tiene productos disponibles.
                  </p>
                )}

                {/* Separador entre colecciones */}
                {idx < tienda.colecciones.length - 1 && (
                  <div
                    className="tn-col-divider"
                    style={{ background: sec + "30" }}
                  />
                )}
              </div>
            ))}
          </section>
        )}
        {/* ── Trigger lazy load + Productos sueltos ── */}
        <div ref={triggerRef} />
        {(cargandoSueltos || productosSueltos.length > 0) && (
          <section className="tn-sueltos" id="productos">
            <div
              className="tn-colecciones__intro"
              style={{ borderColor: sec + "60" }}
            >
              <span className="tn-colecciones__eyebrow" style={{ color: btn }}>
                📦 Más productos
              </span>
              <h2 className="tn-colecciones__titulo" style={{ color: titl }}>
                También te puede interesar
              </h2>
            </div>

            {cargandoSueltos ? (
              <div className="tn-sueltos__loading">
                <div
                  className="tn-loading__spinner"
                  style={{ borderTopColor: btn }}
                />
                <p style={{ color: `${txt}80` }}>Cargando productos…</p>
              </div>
            ) : (
              <div className="tn-product-grid">
                {productosSueltos.map((p) => (
                  <ColeccionProductoCard
                    key={p.id}
                    producto={p}
                    estilos={tienda.estilos}
                    abrirmodal={abrirmodal}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </section>

      {/* ── Contacto ── */}
      <section
        className="tn-contacto"
        id="contacto"
        style={{ background: `linear-gradient(135deg, ${bg}, ${sec})` }}
      >
        <h2 style={{ color: "#fff" }}>¿Quieres saber más?</h2>
        <p style={{ color: "rgba(255,255,255,0.85)" }}>
          Contáctanos y con gusto te atendemos.
        </p>
        <div className="tn-contacto__info">
          {telefono && (
            <a
              href={`tel:${telefono}`}
              className="tn-contacto__chip"
              style={{ borderColor: btn, color: "#fff" }}
            >
              📞 {telefono}
            </a>
          )}
          {!telefono && !direccion && (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Configura tu información de contacto en las opciones de la tienda.
            </p>
          )}
        </div>
      </section>
      {modal && (
        <ModalProducto
          estilos={estilos}
          setmodal={setmodal}
          producto={productoseleccionado}
        />
      )}

      {/* ── Footer ── */}
      <TiendaFooter
        nombre={nombre}
        estilos={estilos}
        telefono={telefono}
        direccion={direccion}
      />
    </div>
  );
}

export default Tienda;
