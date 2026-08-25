import { useEffect, useRef, useState } from "react";
import "../styles/plantilla1.css";

import Dudaspedido    from "../components/plantilla1duda";
import ProductCard    from "../components/p1/ProductCard";
import ModalProducto  from "../components/p1/ModalProducto";
import SeccionTallas  from "../components/p1/SeccionTallas";
import FooterP1       from "../components/p1/FooterP1";
import CarritoPanel   from "../components/p1/CarritoPanel";
import CarritoModal   from "../components/p1/CarritoModal";
import { TraerProductosDominio } from "../api/axios";

/* ─────────────────────────────────────
   PLANTILLA 1
───────────────────────────────────── */
function Plantilla1({ tienda, dominio }) {
  const estilos = tienda.estilos;

  const [modalOpen,          setModalOpen]          = useState(false);
  const [modal,              setmodal]               = useState(false);
  const [productoseleccionado, setproductoseleccionado] = useState(null);
  const [coleccionActiva,    setColeccionActiva]     = useState(null);
  const [bolsaOpen,          setBolsaOpen]           = useState(false);
  const [carritoModal,       setCarritoModal]        = useState(false);
  const [itemsBolsa,         setItemsBolsa]          = useState([]);

  // Lazy load productos sueltos
  const [productosSueltos,   setProductosSueltos]    = useState([]);
  const [cargandoSueltos,    setCargandoSueltos]     = useState(false);
  const [sueltosCargados,    setSueltosCargados]     = useState(false);
  const triggerRef = useRef(null);

  const bg   = estilos?.color_principal  ?? "#ffffff";
  const sec  = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color      ?? "#042d78";
  const txt  = estilos?.text_color       ?? "#242f43";
  const btn  = estilos?.color_botones    ?? "#35a4ec";

  const abrirmodal = (producto) => {
    setmodal(true);
    setproductoseleccionado(producto);
  };

  useEffect(() => {
    if (sueltosCargados || !triggerRef.current || !dominio) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          setCargandoSueltos(true);
          TraerProductosDominio(dominio)
            .then((res) => setProductosSueltos(res.data ?? []))
            .catch(() => {})
            .finally(() => { setCargandoSueltos(false); setSueltosCargados(true); });
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [dominio, sueltosCargados]);

  const hayColecciones = tienda.colecciones && tienda.colecciones.length > 0;

  return (
    <div
      className="con-plantilla1"
      style={{
        background: `radial-gradient(ellipse at 20% 50%, ${sec}12 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 20%, ${btn}0d 0%, transparent 55%),
                     ${bg}`,
      }}
    >
      {/* ── HERO ── */}
      <section
        className="con-plantilla1__cont-inf"
        style={{ background: `linear-gradient(to bottom, ${sec}33 10%, ${sec}aa 50%, ${sec} 100%)` }}
      >
        <div className="con-plantilla1__titulo-logo">
          {tienda.logo ? (
            <img src={tienda.logo} alt={tienda.nombre} className="con-plantilla1__logo-img" />
          ) : (
            <div
              className="con-plantilla1__titulo-logo-alt"
              style={{ background: `linear-gradient(135deg, ${sec}66, ${sec})`, border: `2px solid ${sec}`, color: titl }}
            >
              {tienda.nombre[0].toUpperCase()}
            </div>
          )}
          <h1 className="con-plantilla1__nombre" style={{ color: titl }}>{tienda.nombre}</h1>
        </div>

        <label className="con-plantilla1__actividad" style={{ color: titl }}>{tienda.actividad}</label>
        <p className="con-plantilla1__descripcion" style={{ color: txt }}>{tienda.descripcion}</p>

        <div className="con-plantilla1__datos">
          {tienda.telefono && (
            <span className="con-plantilla1__dato con-plantilla1__dato--tel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              {tienda.telefono}
            </span>
          )}
          {tienda.direccion && (
            <span className="con-plantilla1__dato con-plantilla1__dato--dir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {tienda.direccion}
            </span>
          )}
        </div>

        <div className="con-plantilla1__hero-btns">
          <button
            className="con-plantilla1__btn-catalogo"
            style={{ background: btn, color: titl }}
            onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
          >
            Ver catálogo completo ↓
          </button>
          <button
            className="con-plantilla1__btn-como"
            style={{ borderColor: txt, color: txt }}
            onClick={() => setModalOpen(true)}
          >
            ¿Cómo hago mi pedido?
          </button>
        </div>
      </section>

      {/* ── CATÁLOGO ── */}
      <section id="catalogo" className="con-plantilla1__sec2">

        {/* Mini brand header */}
        <div className="section-2__titulo-logo">
          {tienda.logo ? (
            <img src={tienda.logo} alt={tienda.nombre} className="con-plantilla1__logo-small" />
          ) : (
            <div
              className="con-plantilla1__logo-small-alt"
              style={{ background: `linear-gradient(135deg, ${sec}66, ${sec})`, border: `1px solid ${sec}`, color: titl }}
            >
              {tienda.nombre[0].toUpperCase()}
            </div>
          )}
          <p className="con-plantilla1__sec2-nombre" style={{ color: txt }}>{tienda.nombre}</p>
        </div>

        {/* Filtro de colecciones */}
        {hayColecciones ? (
          <div className="p1-filtro">
            <p className="p1-filtro__hint" style={{ color: titl }}>Elige una colección para ver sus productos</p>
            <div className="p1-filtro__pills">
              {tienda.colecciones.map((col, idx) => {
                const activa = coleccionActiva === col.coleccion_nombre;
                const hues   = ["", "cc", "aa", "dd", "88", "bb"];
                const shade  = hues[idx % hues.length];
                return (
                  <button
                    key={idx}
                    className={`p1-filtro__pill ${activa ? "p1-filtro__pill--active" : ""}`}
                    style={activa
                      ? { background: sec + shade, color: titl, borderColor: sec + shade }
                      : { background: "transparent", color: sec, borderColor: sec + "70" }}
                    onClick={() => setColeccionActiva(activa ? null : col.coleccion_nombre)}
                  >
                    {col.coleccion_nombre}
                    {activa && <span className="p1-filtro__pill-close">✕</span>}
                  </button>
                );
              })}
            </div>
            <div className="p1-filtro__acciones">
              <button
                className="p1-filtro__accion"
                style={{ borderColor: `${sec}50`, color: sec }}
                onClick={() => document.getElementById("guia-tallas")?.scrollIntoView({ behavior: "smooth" })}
              >
                📐 Guía de tallas
              </button>
            </div>
          </div>
        ) : (
          <div className="p1-sin-colecciones-msg">
            <span className="p1-sin-colecciones-msg__emoji">🛍️</span>
            <h3 style={{ color: titl }}>¡Todo para ti en un solo lugar!</h3>
            <p style={{ color: `${txt}90` }}>
              No tenemos categorías separadas, pero eso significa que puedes explorar todo nuestro catálogo sin perderte nada.
            </p>
            <button
              className="p1-sin-colecciones-msg__btn"
              style={{ background: btn, color: titl }}
              onClick={() => document.getElementById("p1-productos")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver todos los productos ↓
            </button>
          </div>
        )}

        {/* ── PROMOCIONES ── */}
        {(() => {
          const promoGeneral  = tienda.productos_promo_general  ?? [];
          const promoUnitaria = tienda.productos_promo_unitaria ?? [];
          if (promoGeneral.length === 0 && promoUnitaria.length === 0) return null;
          const datosPromo = tienda.datospromocion;
          return (
            <section className="p1-promos">
              <span className="p1-promos__spark p1-promos__spark--1">🔥</span>
              <span className="p1-promos__spark p1-promos__spark--2">🔥</span>
              <span className="p1-promos__spark p1-promos__spark--3">✦</span>
              <span className="p1-promos__spark p1-promos__spark--4">✦</span>

              <div className="p1-promos__header">
                <div className="p1-promos__fire-badge">🔥 <span>Ofertas en llamas</span> 🔥</div>
                <h2 className="p1-promos__titulo">{datosPromo?.nombre ?? "¡Precios que queman!"}</h2>
                {datosPromo?.descripcion && <p className="p1-promos__subtitulo">{datosPromo.descripcion}</p>}
                <div className="p1-promos__flame-bar" />
              </div>

              {promoGeneral.length > 0 && (
                <div className="p1-promos__grupo">
                  {datosPromo?.descuento > 0 && (
                    <div className="p1-promos__grupo-label">
                      <div className="p1-promos__pct-pill">
                        <span className="p1-promos__pct-num">-{datosPromo.descuento}%</span>
                        <span className="p1-promos__pct-label">en todos estos productos</span>
                      </div>
                    </div>
                  )}
                  <div className="p1-products-grid">
                    {promoGeneral.map((p) => (
                      <ProductCard key={p.id} producto={{ ...p, precio: p.precio_original, descuento: p.descuento }} estilos={estilos} abrirmodal={abrirmodal} />
                    ))}
                  </div>
                </div>
              )}

              {promoUnitaria.length > 0 && (
                <div className="p1-promos__grupo">
                  {promoGeneral.length > 0 && (
                    <div className="p1-promos__sep-fuego">
                      <span>🔥</span><div className="p1-promos__sep-line" /><span>🔥</span>
                    </div>
                  )}
                  <div className="p1-promos__grupo-label">
                    <div className="p1-promos__excl-pill">✦ Descuentos exclusivos</div>
                  </div>
                  <div className="p1-products-grid">
                    {promoUnitaria.map((p) => (
                      <ProductCard key={p.id} producto={{ ...p, precio: p.precio_original, descuento: p.descuento }} estilos={estilos} abrirmodal={abrirmodal} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })()}

        {/* ── COLECCIONES ── */}
        {hayColecciones &&
          tienda.colecciones
            .filter((col) => coleccionActiva === null || col.coleccion_nombre === coleccionActiva)
            .map((col, idx) => (
              <div key={idx} className="p1-coleccion-bloque">
                {coleccionActiva === null && (
                  <>
                    <h2 className="p1-coleccion__titulo" style={{ color: titl, fontWeight: 800 }}>{col.coleccion_nombre}</h2>
                    {col.coleccion_descripcion && (
                      <p className="p1-coleccion__desc" style={{ color: txt + "80" }}>{col.coleccion_descripcion}</p>
                    )}
                  </>
                )}
                {coleccionActiva !== null && col.coleccion_descripcion && (
                  <p className="p1-coleccion__desc" style={{ color: txt + "80" }}>{col.coleccion_descripcion}</p>
                )}
                {col.productos?.length > 0 ? (
                  <div className="p1-products-grid">
                    {col.productos.map((p) => (
                      <ProductCard key={p.id} producto={p} estilos={estilos} abrirmodal={abrirmodal} />
                    ))}
                  </div>
                ) : (
                  <p className="p1-coleccion__vacia" style={{ color: `${txt}60` }}>
                    Esta colección aún no tiene productos disponibles.
                  </p>
                )}
                {coleccionActiva === null && idx < tienda.colecciones.length - 1 && (
                  <div className="p1-coleccion__divider" style={{ background: `${sec}30` }} />
                )}
              </div>
            ))}

        {/* Trigger lazy load */}
        <div ref={triggerRef} id="p1-productos" />

        {/* ── PRODUCTOS SUELTOS ── */}
        {(cargandoSueltos || productosSueltos.length > 0) && coleccionActiva === null && (
          <div className="p1-coleccion-bloque">
            <h2 className="p1-coleccion__titulo" style={{ color: titl, fontWeight: 800 }}>
              {hayColecciones ? "También te puede interesar" : "Nuestros productos"}
            </h2>
            <p className="p1-coleccion__desc" style={{ color: txt + "80" }}>
              {hayColecciones ? "Más cosas que podrían encantarte" : "Explora todo lo que tenemos para ti"}
            </p>
            {cargandoSueltos ? (
              <div className="p1-loading">
                <div className="p1-spinner" style={{ borderTopColor: btn }} />
                <p style={{ color: `${txt}80` }}>Cargando productos…</p>
              </div>
            ) : (
              <div className="p1-products-grid">
                {productosSueltos.map((p) => (
                  <ProductCard key={p.id} producto={p} estilos={estilos} abrirmodal={abrirmodal} />
                ))}
              </div>
            )}
          </div>
        )}

        {!hayColecciones && !cargandoSueltos && productosSueltos.length === 0 && sueltosCargados && (
          <div className="con-plantilla1__sin-colecciones">
            <p style={{ color: titl }}>🎉 Pronto tendremos productos disponibles para ti.</p>
          </div>
        )}
      </section>

      {/* ── MODAL PEDIDO ── */}
      {modalOpen && (
        <Dudaspedido setModalOpen={setModalOpen} estilos={estilos} pasarela={tienda.pasarela_pagos} />
      )}

      {/* ── MODAL PRODUCTO ── */}
      {modal && productoseleccionado && (
        <ModalProducto estilos={estilos} setmodal={setmodal} producto={productoseleccionado} />
      )}

      {/* ── GUÍA DE TALLAS ── */}
      <SeccionTallas estilos={estilos} />

      {/* ── FOOTER ── */}
      <FooterP1 tienda={tienda} estilos={estilos} />

      {/* ── CARRITO FLOTANTE ── */}
      <div className="p1-cart-fab-wrap">
        {bolsaOpen && (
          <CarritoPanel
            estilos={estilos}
            items={itemsBolsa}
            onClose={(nueva) => { if (nueva !== null) setItemsBolsa(nueva); setBolsaOpen(false); }}
            onAbrirModal={() => { setBolsaOpen(false); setCarritoModal(true); }}
          />
        )}
        <button
          className="p1-cart-fab"
          style={{ background: `linear-gradient(135deg, ${btn}, ${sec})`, boxShadow: `0 6px 24px ${btn}66`, color: titl }}
          onClick={() => {
            const datos = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
            setItemsBolsa(datos);
            setBolsaOpen((v) => !v);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="24" height="24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {itemsBolsa.length > 0 && (
            <span className="p1-cart-fab__badge" style={{ background: bg, color: btn }}>
              {itemsBolsa.reduce((a, i) => a + (i.cantidad ?? 1), 0)}
            </span>
          )}
        </button>
      </div>

      {/* ── MODAL CARRITO ── */}
      {carritoModal && (
        <CarritoModal
          estilos={estilos}
          pasarela={tienda.pasarela_pagos}
          items={itemsBolsa}
          dominio={dominio}
          telefono={tienda.telefono}
          nombreTienda={tienda.nombre}
          onClose={() => setCarritoModal(false)}
          onActualizar={(nueva) => setItemsBolsa(nueva)}
        />
      )}
    </div>
  );
}

export default Plantilla1;
