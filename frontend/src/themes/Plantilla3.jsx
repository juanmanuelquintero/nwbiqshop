import { useState, useEffect } from "react";
import "../styles/plantilla3.css";

import P3Header          from "../components/p3/P3Header";
import P3HeroCombos      from "../components/p3/P3HeroCombos";
import P3ColeccionSlider from "../components/p3/P3ColeccionSlider";
import P3TarjetaProducto from "../components/p3/P3TarjetaProducto";
import P3ProductModal    from "../components/p3/P3ProductModal";
import CarritoModal      from "../components/CarritoModal";

export default function Plantilla3({ tienda, dominio }) {
  const [itemsBolsa,           setItemsBolsa]           = useState([]);
  const [productoDetalle,      setProductoDetalle]      = useState(null);
  const [carritoModalAbierto,  setCarritoModalAbierto]  = useState(false);

  const estilos      = tienda?.estilos ?? {};
  const nombreTienda = tienda?.nombre  || "Mi Tienda";
  const logoTienda   = tienda?.logo    ?? null;
  const inicial      = nombreTienda.trim().charAt(0).toUpperCase();

  const telefonoTienda   = tienda?.telefono?.replace(/\D/g, "") ?? "";
  const telefonoWhatsApp = telefonoTienda.length === 10 ? `57${telefonoTienda}` : telefonoTienda;

  const colecciones    = tienda?.colecciones    ?? [];
  const combos         = tienda?.combos         ?? [];
  const alimentosSueltos = tienda?.alimentos_sueltos ?? [];

  const colores = {
    "--p3-bg":      estilos.color_principal  ?? "#f5f5f5",
    "--p3-surface": estilos.color_principal  ?? "#ffffff",
    "--p3-button":  estilos.color_botones    ?? "#e30613",
    "--p3-accent":  estilos.color_secundario ?? "#ff3c3c",
    "--p3-cart":    estilos.color_carrito    ?? "#e30613",
    "--p3-text":    estilos.text_color       ?? "#333",
    "--p3-title":   estilos.title_color      ?? "#1a1a1a",
  };

  const cantidadCarrito = itemsBolsa.reduce(
    (total, item) => total + Number(item.cantidad ?? 1),
    0,
  );

  const formatearPrecio = (precio) =>
    `$ ${Number(precio ?? 0).toLocaleString("es-CO")}`;

  /* Cargar bolsa desde localStorage al montar */
  useEffect(() => {
    try {
      const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      setItemsBolsa(Array.isArray(guardada) ? guardada : []);
    } catch {
      setItemsBolsa([]);
    }
  }, []);

  return (
    <div className="p3-page" style={colores}>

      {/* ── Header ── */}
      <P3Header
        tienda={tienda}
        cantidadCarrito={cantidadCarrito}
        itemsBolsa={itemsBolsa}
        onActualizarBolsa={setItemsBolsa}
        onAbrirCarritoModal={() => setCarritoModalAbierto(true)}
      />

      {/* ── Presentación de la tienda ── */}
      <section
        className="p3-presentacion"
        aria-labelledby="p3-presentacion-titulo"
      >
        <div className="p3-presentacion__card">
          <div className="p3-presentacion__main">
            <span className="p3-presentacion__eyebrow">Bienvenido a</span>
            <h1 id="p3-presentacion-titulo">{nombreTienda}</h1>
            {tienda?.descripcion && (
              <p className="p3-presentacion__description">{tienda.descripcion}</p>
            )}
          </div>
          <div className="p3-presentacion__contact">
            {tienda?.direccion && <span>📍 {tienda.direccion}</span>}
            {telefonoTienda    && <span>📞 {tienda.telefono}</span>}
            {telefonoWhatsApp  && (
              <a
                className="p3-presentacion__whatsapp"
                href={`https://wa.me/${telefonoWhatsApp}`}
                target="_blank"
                rel="noreferrer"
              >
                Escríbenos por WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Slider de combos ── */}
      {combos.length > 0 && (
        <P3HeroCombos
          combos={combos}
          formatearPrecio={formatearPrecio}
        />
      )}

      {/* ── Catálogo de colecciones ── */}
      <main className="p3-collections-section" id="p3-catalogo">

        <div className="p3-collections-header">
          <p className="p3-collections-header__eyebrow">
            🛍️ Todo lo que necesitas, en un solo lugar
          </p>
          <h2 className="p3-collections-header__title">
            ¿Qué se te antoja hoy?
          </h2>
          <p className="p3-collections-header__desc">
            Explora nuestras colecciones y encuentra eso que estabas buscando —
            o algo que todavía no sabías que necesitabas.
          </p>
        </div>

        {colecciones.length > 0 ? (
          colecciones.map((coleccion) => (
            <P3ColeccionSlider
              key={coleccion.id ?? coleccion.coleccion_nombre ?? coleccion.nombre}
              coleccion={coleccion}
              formatearPrecio={formatearPrecio}
              onVerDetalle={setProductoDetalle}
            />
          ))
        ) : (
          <div className="p3-collections-empty">
            <span>🛒</span>
            <p>Las colecciones estarán disponibles muy pronto.</p>
          </div>
        )}

        {/* Alimentos sueltos (fuera de colecciones) */}
        {alimentosSueltos.length > 0 && (
          <section
            className="p3-alimentos-section"
            aria-labelledby="p3-alimentos-sueltos-titulo"
          >
            <div className="p3-alimentos-section__header">
              <p>Más para disfrutar</p>
              <h3 id="p3-alimentos-sueltos-titulo">Todos los alimentos</h3>
            </div>
            <div className="p3-alimentos-section__list">
              {alimentosSueltos.map((alimento) => (
                <P3TarjetaProducto
                  key={alimento.alimento_id ?? alimento.id}
                  producto={alimento}
                  formatearPrecio={formatearPrecio}
                  onVerDetalle={setProductoDetalle}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="p3-footer">
        <div className="p3-footer__inner">
          <div className="p3-footer__brand">
            <div className="p3-footer__logo" aria-hidden="true">
              {logoTienda
                ? <img src={logoTienda} alt="" />
                : <span>{inicial}</span>
              }
            </div>
            <div>
              <strong>{nombreTienda}</strong>
              <p>Gracias por elegirnos.</p>
            </div>
          </div>
          <div className="p3-footer__links">
            {tienda?.direccion && <span>📍 {tienda.direccion}</span>}
            {telefonoTienda    && <span>📞 {tienda.telefono}</span>}
            {telefonoWhatsApp  && (
              <a
                href={`https://wa.me/${telefonoWhatsApp}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="p3-footer__bottom">
          © {new Date().getFullYear()} NWBIQShop. Todos los derechos reservados.
          Desarrollado por NWBIQ.
        </div>
      </footer>

      {/* ── Modal detalle de producto ── */}
      {productoDetalle && (
        <P3ProductModal
          producto={productoDetalle}
          formatearPrecio={formatearPrecio}
          onClose={() => setProductoDetalle(null)}
          onAgregar={(item) => {
            /* Re-leer bolsa desde localStorage (el modal ya la persistió) */
            try {
              const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
              setItemsBolsa(Array.isArray(guardada) ? guardada : []);
            } catch {
              setItemsBolsa((prev) => [...prev, item]);
            }
          }}
        />
      )}

      {/* ── Modal de carrito / pago ── */}
      {carritoModalAbierto && (
        <CarritoModal
          estilos={estilos}
          pasarela={tienda?.pasarela_pagos}
          items={itemsBolsa}
          dominio={dominio}
          telefono={tienda?.telefono}
          nombreTienda={nombreTienda}
          onClose={() => setCarritoModalAbierto(false)}
          onActualizar={setItemsBolsa}
        />
      )}
    </div>
  );
}
