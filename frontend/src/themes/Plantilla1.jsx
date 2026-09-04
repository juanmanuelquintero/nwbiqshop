import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/plantilla1.css";
import { MirarVariantes, TraerProductosDominio } from "../api/axios";
import CarritoModal from "../components/CarritoModal";
import GestionTallas from "../components/GestionTallas";
import { consolidarBolsa } from "../utils/bolsa";

export default function Plantilla1({ tienda, dominio }) {
  const [productosDominio, setProductosDominio] = useState([]);
  const [cargandoProductosDominio, setCargandoProductosDominio] =
    useState(false);
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  const [itemsBolsa, setItemsBolsa] = useState([]);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [variantesDetalle, setVariantesDetalle] = useState([]);
  const [varianteDetalle, setVarianteDetalle] = useState(null);
  const [tallaDetalle, setTallaDetalle] = useState(null);
  const [cantidadDetalle, setCantidadDetalle] = useState(1);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(false);
  const navigate = useNavigate();
  const listadeactividades = [
    "Venta de calzado",
    "Venta de ropa",
    "Venta de joyería",
    "Venta de gafas y accesorios",
  ];
  const actividadtienda = tienda.actividad;
  const guiaTallasDestino = {
    "Venta de calzado": "#guia-tallas-calzado",
    "Venta de ropa": "#guia-tallas",
    "Venta de joyería": "#guia-tallas-joyeria",
    "Venta de gafas y accesorios": "#guia-medidas-gafas",
  }[actividadtienda];
  const estilos = tienda.estilos ?? {};
  const colores = {
    "--p1-bg": estilos.color_principal ?? "#fff3f3",
    "--p1-secondary": estilos.color_secundario ?? "#ff9f9f",
    "--p1-title": estilos.title_color ?? "#ab6969",
    "--p1-text": estilos.text_color ?? "#501200",
    "--p1-button": estilos.color_botones ?? "#ff6969",
    "--p1-cart": estilos.color_carrito ?? "#ff8080",
  };
  const inicial = tienda.nombre?.trim()?.charAt(0).toUpperCase() || "T";
  const compraPorPasarela = Boolean(tienda.pasarela_pagos);
  const colecciones = tienda.colecciones ?? [];
  const mensajeCompra = compraPorPasarela
    ? "Agrega tus productos a la bolsa y finaliza tu compra de forma segura mediante nuestra pasarela de pagos."
    : "Arma tu bolsa con los productos que quieras y, al finalizar, envíanos tu pedido para confirmarlo por WhatsApp.";
  const promocion = tienda.datospromocion;
  const productosPromoGeneral = tienda.productos_promo_general ?? [];
  const productosPromoUnitaria = tienda.productos_promo_unitaria ?? [];
  const datosAlPorMayor = tienda.datos_alpormayor ?? null;
  const estadoAlPorMayor = datosAlPorMayor?.estado === true;
  const cantidadMinimaMayorista = Number(datosAlPorMayor?.cantidad_minima ?? 6);
  const formatearPrecio = (precio) =>
    `$${Number(precio ?? 0).toLocaleString("es-CO")}`;
  const precioPromocion = (producto, descuentoBase = 0) => {
    if (producto.precio_final != null) return Number(producto.precio_final);
    const precio = Number(producto.precio_original ?? producto.precio ?? 0);
    return precio * (1 - Number(producto.descuento ?? descuentoBase) / 100);
  };
  const obtenerDescuentoPromocion = (producto) => {
    const productoEnPromoGeneral =
      promocion?.estado &&
      productosPromoGeneral.some(
        (productoPromo) => String(productoPromo.id) === String(producto.id),
      );
    const productoEnPromoUnitaria = productosPromoUnitaria.some(
      (productoPromo) => String(productoPromo.id) === String(producto.id),
    );

    if (!productoEnPromoGeneral && !productoEnPromoUnitaria) return 0;
    return Number(
      producto.descuento ??
        (productoEnPromoGeneral ? promocion?.descuento : 0) ??
        0,
    );
  };
  const calcularPrecioMayorista = (producto, descuento = 0) => {
    if (!estadoAlPorMayor || producto.precio_alpormayor == null) return null;
    const precio = Number(producto.precio_alpormayor);
    return descuento > 0 ? precio * (1 - descuento / 100) : precio;
  };
  const renderProducto = (producto) => {
    const descuento = obtenerDescuentoPromocion(producto);

    const precioOriginal = Number(
      producto.precio_original ?? producto.precio ?? 0,
    );

    const precioFinal =
      descuento > 0 ? precioPromocion(producto, descuento) : precioOriginal;

    const precioMayorista = calcularPrecioMayorista(producto, descuento);

    const ganancia =
      precioMayorista != null
        ? Math.max(0, precioFinal - precioMayorista)
        : null;

    return (
      <article key={producto.id} className="p1-promo-product">
        <div className="p1-promo-product__image-wrap">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} />
          ) : (
            <span>✦</span>
          )}

          {descuento > 0 && <b>-{descuento}%</b>}
        </div>

        <div className="p1-promo-product__body">
          <h3>{producto.nombre}</h3>

          {descuento > 0 && (
            <span className="p1-promo-product__original">
              {formatearPrecio(precioOriginal)}
            </span>
          )}

          <strong>{formatearPrecio(precioFinal)}</strong>

          <button
            type="button"
            className="p1-promo-product__detail"
            onClick={() => setProductoDetalle(producto)}
          >
            Ver detalle →
          </button>
        </div>

        {precioMayorista != null && (
          <div className="mayorista-info">
            <div className="mayorista-precio">
              <span className="mayorista-badge">MAYORISTA</span>

              <div className="mayorista-detalle">
                <span className="mayorista-cantidad">
                  Desde {cantidadMinimaMayorista} uds.
                </span>

                <strong>{formatearPrecio(precioMayorista)}</strong>
              </div>
            </div>

            <div className="mayorista-ganancia">
              <span>Ganancia potencial</span>

              <strong>{formatearPrecio(ganancia)}</strong>
            </div>
          </div>
        )}
      </article>
    );
  };

  useEffect(() => {
    if (!dominio) {
      setProductosDominio([]);
      return;
    }

    let activo = true;
    setCargandoProductosDominio(true);
    TraerProductosDominio(dominio)
      .then((res) => {
        if (activo)
          setProductosDominio(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (activo) setProductosDominio([]);
      })
      .finally(() => {
        if (activo) setCargandoProductosDominio(false);
      });

    return () => {
      activo = false;
    };
  }, [dominio]);

  useEffect(() => {
    if (!productoDetalle) return undefined;

    let activo = true;
    setCargandoDetalle(true);
    setErrorDetalle(false);
    setVariantesDetalle([]);
    setVarianteDetalle(null);
    setTallaDetalle(null);
    setCantidadDetalle(1);

    MirarVariantes(productoDetalle.id)
      .then((res) => {
        if (!activo) return;
        const variantes = Array.isArray(res.data) ? res.data : [];
        setVariantesDetalle(variantes);
        setVarianteDetalle(variantes[0] ?? null);
      })
      .catch(() => {
        if (activo) setErrorDetalle(true);
      })
      .finally(() => {
        if (activo) setCargandoDetalle(false);
      });

    const cerrarConEscape = (event) => {
      if (event.key === "Escape") setProductoDetalle(null);
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      activo = false;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [productoDetalle]);

  useEffect(() => {
    try {
      const bolsaGuardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      const bolsa = consolidarBolsa(bolsaGuardada);
      setItemsBolsa(bolsa);
      localStorage.setItem("bolsa", JSON.stringify(bolsa));
    } catch {
      setItemsBolsa([]);
    }
  }, []);

  const idsProductosEnColecciones = new Set(
    colecciones
      .flatMap((coleccion) => coleccion.productos ?? [])
      .map((producto) => String(producto.id)),
  );
  const productosParaAntojarse = productosDominio.filter(
    (producto) => !idsProductosEnColecciones.has(String(producto.id)),
  );
  const cantidadBolsa = itemsBolsa.reduce(
    (total, item) => total + Number(item.cantidad ?? 1),
    0,
  );
  const descuentoDetalle = productoDetalle
    ? obtenerDescuentoPromocion(productoDetalle)
    : 0;
  const precioDetalleOriginal = Number(
    productoDetalle?.precio_original ?? productoDetalle?.precio ?? 0,
  );
  const precioDetalleFinal =
    productoDetalle && descuentoDetalle > 0
      ? precioPromocion(productoDetalle, descuentoDetalle)
      : precioDetalleOriginal;
  const precioDetalleMayorista = productoDetalle
    ? calcularPrecioMayorista(productoDetalle, descuentoDetalle)
    : null;
  const gananciaDetalle =
    precioDetalleMayorista != null
      ? Math.max(0, precioDetalleFinal - precioDetalleMayorista)
      : null;
  const cantidadDisponibleDetalle =
    tallaDetalle?.cantidad ??
    (productoDetalle?.tipo === "simple"
      ? Number(productoDetalle?.cantidad ?? 0)
      : 0);
  const aplicaMayoristaDetalle =
    estadoAlPorMayor &&
    precioDetalleMayorista != null &&
    cantidadDetalle >= cantidadMinimaMayorista;
  const precioUnitarioDetalle = aplicaMayoristaDetalle
    ? precioDetalleMayorista
    : precioDetalleFinal;
  const totalDetalle = precioUnitarioDetalle * cantidadDetalle;
  const imagenDetalle = varianteDetalle?.imagen ?? productoDetalle?.imagen;
  const puedeAgregarDetalle =
    cantidadDisponibleDetalle > 0 &&
    cantidadDetalle <= cantidadDisponibleDetalle;
  const agregarDetalleABolsa = () => {
    if (!productoDetalle || !puedeAgregarDetalle) return;

    const item = {
      producto_id: productoDetalle.id,
      variante_id: tallaDetalle?.id ?? null,
      color_id: varianteDetalle?.id ?? null,
      talla_id: tallaDetalle?.id ?? null,
      tipo: productoDetalle.tipo,
      cantidad: cantidadDetalle,
      nombre: productoDetalle.nombre,
      imagen: imagenDetalle,
      color: varianteDetalle?.color ?? null,
      talla: tallaDetalle?.talla ?? null,
      marca: varianteDetalle?.marca ?? null,
      referencia:
        varianteDetalle?.referencia ?? productoDetalle.referencia ?? null,
      precio_unitario: precioUnitarioDetalle,
      precio_final: totalDetalle,
      precio_original: precioDetalleOriginal,
      precio_alpormayor: precioDetalleMayorista,
      descuento: descuentoDetalle,
    };
    let bolsaActual = [];
    try {
      const bolsaGuardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      bolsaActual = Array.isArray(bolsaGuardada) ? bolsaGuardada : [];
    } catch {
      bolsaActual = [];
    }
    const nuevaBolsa = consolidarBolsa([...bolsaActual, item]);
    localStorage.setItem("bolsa", JSON.stringify(nuevaBolsa));
    setItemsBolsa(nuevaBolsa);
    setProductoDetalle(null);
  };

  return (
    <div className="p1-page" style={colores}>
      {/* ── SECCIÓN HERO / PRESENTACIÓN ── */}
      <section className="p1-hero">
        <div className="p1-hero__inner">
          <div className="p1-hero__brand">
            {tienda.logo ? (
              <img
                src={tienda.logo}
                alt={tienda.nombre}
                className="p1-hero__logo"
              />
            ) : (
              <span className="p1-hero__brand-icon p1-hero__brand-icon--fallback">
                {inicial}
              </span>
            )}
            <span className="p1-hero__brand-name">
              {tienda.nombre || "Tu tienda"}
            </span>
          </div>

          <p className="p1-hero__activity">
            {tienda.actividad || "Tienda online"}
          </p>
          <h1 className="p1-hero__title">Encuentra eso que estás buscando</h1>
          <p className="p1-hero__desc">
            {tienda.descripcion ||
              "Explora nuestro catálogo y elige los productos que más te gusten."}
          </p>

          <div className="p1-hero__purchase-info">
            <span className="p1-hero__purchase-icon">
              {compraPorPasarela ? "✓" : "◌"}
            </span>
            <span>{mensajeCompra}</span>
          </div>

          <div className="p1-hero__stats">
            <div className="p1-hero__stat">
              <span className="p1-hero__stat-value">{colecciones.length}</span>
              <span className="p1-hero__stat-label">COLECCIONES</span>
            </div>
            <div className="p1-hero__stat">
              <span className="p1-hero__stat-value">
                {compraPorPasarela ? "Pago online" : "WhatsApp"}
              </span>
              <span className="p1-hero__stat-label">COMPRA</span>
            </div>
            <div className="p1-hero__stat">
              <span className="p1-hero__stat-value">
                {tienda.direccion || "Online"}
              </span>
              <span className="p1-hero__stat-label">UBICACIÓN</span>
            </div>
          </div>

          <button
            className="p1-hero__cta"
            onClick={() =>
              document
                .getElementById("p1-catalogo")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Ver catálogo y armar mi bolsa ↓
          </button>

          {false && (
            <>
              {/* Logo + nombre */}
              <div className="p1-hero__brand">
                <span className="p1-hero__brand-icon">🐾</span>
                <span className="p1-hero__brand-name">Mango French</span>
              </div>

              {/* Título principal */}
              <h1 className="p1-hero__title">
                Catálogo de pijamas, cobijas y camisetas por mayor
              </h1>

              {/* Descripción */}
              <p className="p1-hero__desc">
                Encuentra <strong>178 referencias disponibles</strong> en
                pijamas, cobijas/mantas, camisetas y liquidaciones. Las{" "}
                <strong>pijamas están elaboradas en piel de durazno</strong>,
                las <strong>cobijas y mantas en piel de conejo</strong>, y la
                línea de <strong>camisetas</strong> tiene precios por volumen.
                En cada referencia podrás identificar fácilmente la{" "}
                <strong>talla y disponibilidad</strong>, el precio mayorista
                desde 6 unidades y el{" "}
                <strong>precio sugerido de venta al detal</strong>.
              </p>

              {/* Caja WhatsApp */}
              <div className="p1-hero__whatsapp">
                <span className="p1-hero__whatsapp-icon">📱</span>
                <span>
                  Para hacer tu pedido: toma pantallazo de las referencias que
                  te gusten y envíalas por WhatsApp
                </span>
              </div>

              {/* Estadísticas */}
              <div className="p1-hero__stats">
                <div className="p1-hero__stat">
                  <span className="p1-hero__stat-value">178</span>
                  <span className="p1-hero__stat-label">REFERENCIAS</span>
                </div>
                <div className="p1-hero__stat">
                  <span className="p1-hero__stat-value">24</span>
                  <span className="p1-hero__stat-label">CATEGORÍAS</span>
                </div>
                <div className="p1-hero__stat">
                  <span className="p1-hero__stat-value">Desde 6 uds</span>
                  <span className="p1-hero__stat-label">PEDIDO MÍNIMO</span>
                </div>
              </div>

              {/* Botón CTA */}
              <button className="p1-hero__cta">
                Bienvenid@ — baja para ver nuestro catálogo completo &darr;
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── SECCIÓN NAVEGACIÓN / CATEGORÍAS ── */}
      <section className="p1-nav-cats">
        <div className="p1-shop-nav__heading">
          <p className="p1-shop-nav__eyebrow">Explora a tu manera</p>
          <h2>Encuentra la colección que quieres</h2>
          <p>Elige una colección y ve directamente a sus productos.</p>
        </div>

        {colecciones.length > 0 ? (
          <div className="p1-shop-nav__collections">
            {colecciones.map((coleccion) => {
              const nombre = coleccion.coleccion_nombre ?? coleccion.nombre;
              const descripcion =
                coleccion.coleccion_descripcion ?? coleccion.descripcion;
              return (
                <button
                  key={nombre}
                  type="button"
                  className="p1-shop-nav__collection"
                  onClick={() =>
                    document
                      .getElementById("p1-catalogo")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <span className="p1-shop-nav__collection-name">{nombre}</span>
                  {descripcion && (
                    <span className="p1-shop-nav__collection-desc">
                      {descripcion}
                    </span>
                  )}
                  <span className="p1-shop-nav__collection-action">
                    Ver productos →
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="p1-shop-nav__empty">
            Pronto tendremos colecciones disponibles para explorar.
          </p>
        )}

        <div className="p1-shop-nav__trust" aria-label="Compra con confianza">
          <div className="p1-shop-nav__trust-card">
            <span>✓</span>
            <p>
              <strong>Pedido claro</strong>Elige tus productos y revísalos en tu
              bolsa antes de finalizar.
            </p>
          </div>
          <div className="p1-shop-nav__trust-card">
            <span>◌</span>
            <p>
              <strong>Compra acompañada</strong>
              {compraPorPasarela
                ? "Finaliza de forma segura en la pasarela de pago."
                : "Confirmamos tu pedido contigo por WhatsApp."}
            </p>
          </div>
          <div className="p1-shop-nav__trust-card">
            <span>♥</span>
            <p>
              <strong>Atención cercana</strong>Estamos para resolver tus dudas
              antes de tu compra.
            </p>
          </div>
        </div>

        {/* Navbar superior con logo */}
        <div className="p1-topbar">
          <span className="p1-topbar__icon">🐾</span>
          <span className="p1-topbar__name">Mango French</span>
        </div>

        <p className="p1-nav-cats__hint">
          Elige una línea y luego la categoría que deseas ver
        </p>

        {/* Botones principales de línea */}
        <div className="p1-nav-cats__main">
          <button className="p1-cat-btn p1-cat-btn--cobijas">
            🛏️ Cobijas ▾
          </button>
          <button className="p1-cat-btn p1-cat-btn--pijamas">
            🌙 Pijamas ▾
          </button>
          <button className="p1-cat-btn p1-cat-btn--camisetas">
            👕 Camisetas
          </button>
          <button className="p1-cat-btn p1-cat-btn--liquidaciones">
            ⚡ Liquidaciones
          </button>
        </div>

        {/* Pills secundarias */}
        <div className="p1-nav-cats__secondary">
          <button className="p1-pill">📏 Guía de tallas</button>
          <button className="p1-pill">🔥 Lista de precios</button>
        </div>
      </section>

      {/* ── SECCIÓN ¿CÓMO HAGO MI PEDIDO? ── */}
      <section className="p1-how">
        <div className="p1-order-guide">
          <div className="p1-order-guide__heading">
            <p className="p1-order-guide__eyebrow">Compra fácil y a tu ritmo</p>
            <h2>¿Cómo hago mi pedido?</h2>
            <p>
              Arma tu bolsa con tranquilidad. Te acompañamos durante todo el
              proceso.
            </p>
          </div>
          <div className="p1-order-guide__steps">
            <article className="p1-order-guide__step">
              <span>1</span>
              <div>
                <h3>Explora nuestro catálogo</h3>
                <p>
                  Escoge los productos que más te gusten y añádelos a tu bolsa.
                </p>
              </div>
            </article>
            <article className="p1-order-guide__step">
              <span>2</span>
              <div>
                <h3>Revisa tu carrito</h3>
                <p>
                  {compraPorPasarela
                    ? "Ve a tu carrito y presiona el botón “Pagar mi carrito”."
                    : "Ve a tu carrito, mira tus productos y presiona “Hacer pedido - WhatsApp”."}
                </p>
              </div>
            </article>
            <article className="p1-order-guide__step">
              <span>3</span>
              <div>
                <h3>Confirma tu pedido</h3>
                <p>
                  {compraPorPasarela
                    ? "Ingresa tu correo, presiona “Confirmar pedido” y continúa a la pasarela de pagos. Te notificaremos todo el proceso."
                    : "Ingresa tu correo y presiona “Finalizar pedido”. Te dirigiremos a WhatsApp para procesar el pago con nosotros."}
                </p>
              </div>
            </article>
          </div>
          <div className="p1-order-guide__tracking">
            <div>
              <strong>¿Ya hiciste un pedido?</strong>
              <span>
                Recuerda que puedes consultar su estado en cualquier momento.
              </span>
            </div>
            <a onClick={() => navigate("/buscar-pedidos")}>
              Consultar mi pedido →
            </a>
          </div>
          {guiaTallasDestino && (
            <div className="p1-order-guide__sizes">
              <span className="p1-order-guide__sizes-icon" aria-hidden="true">
                ↔
              </span>
              <div>
                <strong>¿Tienes dudas con tu talla?</strong>
                <span>
                  Usa nuestra guía de medidas para encontrar una referencia más
                  cómoda antes de hacer tu pedido.
                </span>
              </div>
              <a href={guiaTallasDestino}>Ver guía de tallas →</a>
            </div>
          )}
        </div>
      </section>

      <section className="p1-ref">
        {promocion?.estado && productosPromoGeneral.length > 0 && (
          <div className="p1-promotions-main">
            <span className="p1-promotions-main__spark p1-promotions-main__spark--one">
              ✦
            </span>
            <span className="p1-promotions-main__spark p1-promotions-main__spark--two">
              ✦
            </span>
            <div className="p1-promotions-main__heading">
              <p>Selección especial</p>
              <h2>{promocion.nombre || "Promociones"}</h2>
              <span>
                {promocion.descripcion ||
                  "Aprovecha estos productos seleccionados para ti."}
              </span>
            </div>
            <div className="p1-promotions-main__products">
              {productosPromoGeneral.map((producto) => {
                const original = Number(
                  producto.precio_original ?? producto.precio ?? 0,
                );
                const final = precioPromocion(producto, promocion.descuento);
                const descuento = Number(
                  producto.descuento ?? promocion.descuento ?? 0,
                );
                const mayorista = calcularPrecioMayorista(producto, descuento);
                return (
                  <article key={producto.id} className="p1-promo-product">
                    <div className="p1-promo-product__image-wrap">
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} />
                      ) : (
                        <span>✦</span>
                      )}
                      <b>{descuento > 0 ? `-${descuento}%` : "Oferta"}</b>
                    </div>
                    <div className="p1-promo-product__body">
                      <h3>{producto.nombre}</h3>
                      <span className="p1-promo-product__original">
                        {formatearPrecio(original)}
                      </span>
                      <strong>{formatearPrecio(final)}</strong>
                      <button
                        type="button"
                        className="p1-promo-product__detail"
                        onClick={() => setProductoDetalle(producto)}
                      >
                        Ver detalle →
                      </button>
                    </div>
                    {mayorista != null && (
                      <div className="mayorista-info">
                        <div className="mayorista-precio">
                          <span className="mayorista-badge">MAYORISTA</span>

                          <div className="mayorista-detalle">
                            <span className="mayorista-cantidad">
                              Desde {cantidadMinimaMayorista} uds.
                            </span>

                            <strong>{formatearPrecio(mayorista)}</strong>
                          </div>
                        </div>

                        <div className="mayorista-ganancia">
                          <span>Ganancia potencial</span>

                          <strong>
                            {formatearPrecio(Math.max(0, final - mayorista))}
                          </strong>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {productosPromoUnitaria.length > 0 && (
          <div className="p1-promotions-unit">
            <div className="p1-promotions-unit__heading">
              <p>Ofertas seleccionadas</p>
              <h2>Promociones unitarias</h2>
            </div>
            <div className="p1-promotions-unit__products">
              {productosPromoUnitaria.map((producto) => {
                const original = Number(
                  producto.precio_original ?? producto.precio ?? 0,
                );
                const final = precioPromocion(producto);
                const descuento = Number(producto.descuento ?? 0);
                const mayorista = calcularPrecioMayorista(producto, descuento);
                return (
                  <article key={producto.id} className="p1-unit-product">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} />
                    ) : (
                      <span>✦</span>
                    )}
                    <div className="p1-unit-product__content">
                      <h3>{producto.nombre}</h3>
                      <span>{formatearPrecio(original)}</span>
                      <strong>{formatearPrecio(final)}</strong>
                      <button
                        type="button"
                        className="p1-unit-product__detail"
                        onClick={() => setProductoDetalle(producto)}
                      >
                        Ver detalle →
                      </button>
                    </div>
                    {mayorista != null && (
                      <div className="mayorista-info">
                        <div className="mayorista-precio">
                          <span className="mayorista-badge">MAYORISTA</span>

                          <div className="mayorista-detalle">
                            <span className="mayorista-cantidad">
                              Desde {cantidadMinimaMayorista} uds.
                            </span>

                            <strong>{formatearPrecio(mayorista)}</strong>
                          </div>
                        </div>

                        <div className="mayorista-ganancia">
                          <span>Ganancia potencial</span>

                          <strong>
                            {formatearPrecio(Math.max(0, final - mayorista))}
                          </strong>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── SECCIÓN COLECCIONES ── */}
      <section className="p1-catalog" id="p1-catalogo">
        {colecciones.map((coleccion, indiceColeccion) => {
          const nombre =
            coleccion.coleccion_nombre ?? coleccion.nombre ?? "Colección";
          const descripcion =
            coleccion.coleccion_descripcion ?? coleccion.descripcion;
          const productos = coleccion.productos ?? [];

          return (
            <div
              className="p1-collection"
              key={coleccion.id ?? `${nombre}-${indiceColeccion}`}
            >
              <div className="p1-collection__header">
                <div>
                  <h2 className="p1-collection__title">{nombre}</h2>
                  {descripcion && (
                    <p className="p1-collection__description">{descripcion}</p>
                  )}
                </div>
                <span className="p1-collection__count">
                  {productos.length}{" "}
                  {productos.length === 1 ? "producto" : "productos"}
                </span>
              </div>

              {productos.length > 0 ? (
                <div className="p1-products-grid">
                  {productos.map(renderProducto)}
                </div>
              ) : (
                <p className="p1-collection__empty">
                  Esta colección aún no tiene productos.
                </p>
              )}
            </div>
          );
        })}
      </section>

      {(cargandoProductosDominio || productosParaAntojarse.length > 0) && (
        <section
          className="p1-more-products"
          aria-labelledby="p1-more-products-title"
        >
          <div className="p1-more-products__heading">
            <p>Una última mirada</p>
            <h2 id="p1-more-products-title">Antójate de algo más</h2>
            <span>
              Descubre esas piezas que pueden ser justo lo que te faltaba. Date
              un gusto y encuentra tu próximo favorito.
            </span>
          </div>
          {cargandoProductosDominio ? (
            <p className="p1-more-products__loading">
              Cargando más productos...
            </p>
          ) : (
            <div className="p1-products-grid">
              {productosParaAntojarse.map(renderProducto)}
            </div>
          )}
        </section>
      )}

      {listadeactividades.includes(actividadtienda) ? (
        <GestionTallas actividad={actividadtienda} estilos={estilos} />
      ) : (
        <></>
      )}

      {productoDetalle && (
        <div
          className="p1-product-modal__overlay"
          role="presentation"
          onMouseDown={() => setProductoDetalle(null)}
        >
          <section
            className="p1-product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="p1-product-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="p1-product-modal__close"
              onClick={() => setProductoDetalle(null)}
              aria-label="Cerrar detalle del producto"
            >
              ×
            </button>
            <div className="p1-product-modal__image-wrap">
              {imagenDetalle ? (
                <img src={imagenDetalle} alt={productoDetalle.nombre} />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>
            <div className="p1-product-modal__content">
              <span className="p1-product-modal__ref">
                {productoDetalle.referencia ??
                  productoDetalle.codigo ??
                  `Ref. ${productoDetalle.id}`}
              </span>
              <h2 id="p1-product-modal-title">{productoDetalle.nombre}</h2>
              {productoDetalle.descripcion && (
                <p>{productoDetalle.descripcion}</p>
              )}
              <div className="p1-product-modal__price">
                {descuentoDetalle > 0 && (
                  <del>{formatearPrecio(precioDetalleOriginal)}</del>
                )}
                <strong>{formatearPrecio(precioUnitarioDetalle)}</strong>
                {aplicaMayoristaDetalle && <b>Precio mayorista aplicado</b>}
                {descuentoDetalle > 0 && <b>-{descuentoDetalle}% OFF</b>}
              </div>
              {precioDetalleMayorista != null && (
                <div className="p1-product-modal__wholesale-card">
                  <div className="p1-product-modal__wholesale-header">
                    <div className="p1-product-modal__wholesale-icon">🏷️</div>

                    <div>
                      <span className="p1-product-modal__wholesale-title">
                        Precio mayorista
                      </span>

                      <span className="p1-product-modal__wholesale-min">
                        Desde {cantidadMinimaMayorista} unidades
                      </span>
                    </div>
                  </div>

                  <div className="p1-product-modal__wholesale-main">
                    <span className="p1-product-modal__wholesale-label">
                      Precio al por mayor
                    </span>

                    <strong className="p1-product-modal__wholesale-value">
                      {formatearPrecio(precioDetalleMayorista)}
                    </strong>
                  </div>

                  <div className="p1-product-modal__wholesale-profit">
                    <span>Ganancia potencial</span>

                    <strong>
                      {formatearPrecio(gananciaDetalle)} <small>c/u</small>
                    </strong>
                  </div>
                </div>
              )}

              {productoDetalle && puedeAgregarDetalle && (
                <div className="p1-product-modal__quantity">
                  <div className="p1-product-modal__quantity-header">
                    <span>Cantidad</span>

                    <span className="p1-product-modal__quantity-stock">
                      {cantidadDisponibleDetalle} disponibles
                    </span>
                  </div>

                  <div className="p1-product-modal__quantity-controls">
                    <button
                      type="button"
                      onClick={() =>
                        setCantidadDetalle((cantidad) =>
                          Math.max(1, cantidad - 1),
                        )
                      }
                      disabled={cantidadDetalle <= 1}
                      aria-label="Reducir cantidad"
                      className="p1-product-modal__quantity-btn"
                    >
                      −
                    </button>

                    <strong
                      aria-live="polite"
                      className="p1-product-modal__quantity-value"
                    >
                      {cantidadDetalle}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        setCantidadDetalle((cantidad) =>
                          Math.min(cantidadDisponibleDetalle, cantidad + 1),
                        )
                      }
                      disabled={cantidadDetalle >= cantidadDisponibleDetalle}
                      aria-label="Aumentar cantidad"
                      className="p1-product-modal__quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="p1-product-modal__quantity-total">
                    <span>Total</span>

                    <strong>{formatearPrecio(totalDetalle)}</strong>

                    {aplicaMayoristaDetalle && (
                      <span className="p1-product-modal__wholesale-tag">
                        Precio mayorista
                      </span>
                    )}
                  </div>
                </div>
              )}

              {cargandoDetalle && (
                <p className="p1-product-modal__status">
                  Cargando opciones disponibles...
                </p>
              )}
              {!cargandoDetalle && errorDetalle && (
                <p className="p1-product-modal__status p1-product-modal__status--error">
                  No pudimos cargar las opciones. Inténtalo de nuevo.
                </p>
              )}
              {!cargandoDetalle &&
                !errorDetalle &&
                variantesDetalle.length > 0 && (
                  <div className="p1-product-modal__variants">
                    {productoDetalle.tipo === "variantes" ? (
                      <>
                        <span>Elige un color</span>
                        <div className="p1-product-modal__options">
                          {variantesDetalle.map((variante) => (
                            <button
                              key={variante.id}
                              type="button"
                              className={
                                varianteDetalle?.id === variante.id
                                  ? "is-selected"
                                  : ""
                              }
                              onClick={() => {
                                setVarianteDetalle(variante);
                                setTallaDetalle(null);
                              }}
                            >
                              {variante.color || "Opción"}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                    {varianteDetalle?.tallas?.length > 0 && (
                      <>
                        <span>Disponibilidad por talla</span>
                        <div className="p1-product-modal__sizes">
                          {varianteDetalle.tallas.map((talla) => (
                            <button
                              key={talla.id}
                              type="button"
                              disabled={talla.cantidad <= 0}
                              className={`${tallaDetalle?.id === talla.id ? "is-selected" : ""} ${talla.cantidad > 0 ? "" : "is-sold-out"}`}
                              onClick={() => {
                                setTallaDetalle(talla);
                                setCantidadDetalle(1);
                              }}
                            >
                              {talla.talla}{" "}
                              <small>
                                {talla.cantidad > 0
                                  ? `${talla.cantidad} disponibles`
                                  : "Agotada"}
                              </small>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              {!cargandoDetalle &&
                !errorDetalle &&
                variantesDetalle.length === 0 && (
                  <p className="p1-product-modal__status">
                    Este producto no tiene opciones adicionales.
                  </p>
                )}
              <button
                type="button"
                className="p1-product-modal__add"
                disabled={cargandoDetalle || !puedeAgregarDetalle}
                onClick={agregarDetalleABolsa}
              >
                {productoDetalle.tipo === "simple" || tallaDetalle
                  ? "Agregar a la bolsa"
                  : "Selecciona una talla para agregar"}
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="p1-footer">
        <strong>{tienda.nombre || "Tu tienda"}</strong>
        <span>Desarrollado por NWBIQ</span>
        <small>
          © {new Date().getFullYear()} NWBIQSHOP. Todos los derechos reservados.
        </small>
      </footer>

      {/* Navbar inferior fijo */}
      <nav className="p1-nav-bottom">
        <span className="p1-nav-bottom__icon" aria-hidden="true">
          ✦
        </span>
        <span className="p1-nav-bottom__name">
          {tienda.nombre || "Tu tienda"}
        </span>
        <div className="p1-nav-bottom__actions">
          <button
            type="button"
            className="p1-nav-bottom__bag"
            onClick={() => setBolsaAbierta(true)}
            aria-label="Abrir bolsa de compras"
          >
            <span aria-hidden="true">🛍️</span>
            {cantidadBolsa > 0 && <b>{cantidadBolsa}</b>}
          </button>
          <button
            type="button"
            className="p1-nav-bottom__top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Volver al inicio"
          >
            ↑
          </button>
        </div>
      </nav>

      {bolsaAbierta && (
        <CarritoModal
          estilos={estilos}
          pasarela={compraPorPasarela}
          items={itemsBolsa}
          estadoAlPorMayor={estadoAlPorMayor}
          cantidadMinimaMayorista={cantidadMinimaMayorista}
          dominio={dominio}
          telefono={tienda.telefono}
          nombreTienda={tienda.nombre}
          onClose={() => setBolsaAbierta(false)}
          onActualizar={setItemsBolsa}
        />
      )}
    </div>
  );
}
