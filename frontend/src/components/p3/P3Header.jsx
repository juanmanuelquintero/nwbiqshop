import { useState } from "react";
import CarritoPanel from "../CarritoPanel";
import { IconMenu, IconSearch, IconCart } from "./P3Icons";

/* ── Subcategorías por defecto (sin tienda conectada) ── */
const SUBCATS_DEFAULT = [
  { id: "colecciones", label: "Colecciones", icon: "🪄" },
  { id: "alimentos",   label: "Alimentos",   icon: "🍽️" },
];

/* ════════════════════════════════════════
   P3Header
   Props:
     tienda          — objeto tienda completo
     cantidadCarrito — número de ítems en bolsa
     itemsBolsa      — array de ítems
     onActualizarBolsa(nuevaBolsa) — callback al modificar bolsa
     onAbrirCarritoModal()         — callback para abrir el modal de pago
════════════════════════════════════════ */
export default function P3Header({
  tienda,
  cantidadCarrito,
  itemsBolsa,
  onActualizarBolsa,
  onAbrirCarritoModal,
}) {
  const [busqueda, setBusqueda]               = useState("");
  const [subcatActiva, setSubcatActiva]       = useState(null);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false);
  const [bolsaAbierta, setBolsaAbierta]       = useState(false);

  const estilos      = tienda?.estilos ?? {};
  const nombreTienda = tienda?.nombre  || "Mi Tienda";
  const logoTienda   = tienda?.logo    ?? null;
  const inicial      = nombreTienda.trim().charAt(0).toUpperCase();
  const colecciones  = tienda?.colecciones ?? [];

  /* Subcats dinámicas desde las colecciones, o las por defecto */
  const subcats =
    colecciones.length > 0
      ? colecciones.map((col) => ({
          id:    String(col.id ?? col.titulo ?? col.coleccion_nombre ?? col.nombre),
          label: col.titulo ?? col.coleccion_nombre ?? col.nombre ?? "Colección",
          icon:  "📦",
        }))
      : SUBCATS_DEFAULT;

  /* Navegar hasta la sección de una colección */
  const irAColeccion = (coleccion) => {
    const id = coleccion.id ?? coleccion.titulo ?? coleccion.coleccion_nombre ?? coleccion.nombre;
    setSubcatActiva(String(id));
    setCategoriasAbiertas(false);
    document
      .getElementById(`p3-coleccion-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    document.getElementById("p3-catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const abrirBolsa = () => {
    try {
      const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      onActualizarBolsa(Array.isArray(guardada) ? guardada : []);
    } catch {
      onActualizarBolsa([]);
    }
    setBolsaAbierta((v) => !v);
  };

  return (
    <header className="p3-header">

      {/* ── Barra superior ── */}
      <div className="p3-topbar">

        {/* Marca / logo */}
        <div className="p3-topbar__brand" aria-label={nombreTienda}>
          <div className="p3-topbar__logo">
            {logoTienda
              ? <img src={logoTienda} alt={nombreTienda} />
              : <span>{inicial}</span>
            }
          </div>
          <span className="p3-topbar__store-name">{nombreTienda}</span>
        </div>

        {/* Categorías */}
        <div className="p3-topbar__categories">
          <button
            type="button"
            className="p3-topbar__categories-btn"
            aria-label="Ver categorías"
            aria-expanded={categoriasAbiertas}
            aria-controls="p3-categorias-modal"
            onClick={() => setCategoriasAbiertas((v) => !v)}
          >
            <IconMenu />
            <span>Categorías</span>
          </button>

          {categoriasAbiertas && (
            <div
              id="p3-categorias-modal"
              className="p3-categorias-modal"
              role="dialog"
              aria-label="Colecciones de la tienda"
            >
              <div className="p3-categorias-modal__content">
                <div className="p3-categorias-modal__header">
                  <strong>Categorías</strong>
                  <button
                    type="button"
                    onClick={() => setCategoriasAbiertas(false)}
                    aria-label="Cerrar categorías"
                  >
                    ×
                  </button>
                </div>
                {colecciones.length > 0 ? (
                  <div className="p3-categorias-modal__list">
                    {colecciones.map((col) => (
                      <button
                        key={col.id ?? col.titulo ?? col.coleccion_nombre ?? col.nombre}
                        type="button"
                        onClick={() => irAColeccion(col)}
                      >
                        {col.titulo ?? col.coleccion_nombre ?? col.nombre ?? "Colección"}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p3-categorias-modal__empty">
                    Aún no hay categorías disponibles.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Buscador */}
        <form className="p3-topbar__search" role="search" onSubmit={handleBuscar}>
          <input
            type="search"
            className="p3-topbar__search-input"
            placeholder="¿Qué estás buscando?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
          <button type="submit" className="p3-topbar__search-btn" aria-label="Buscar">
            <IconSearch />
          </button>
        </form>

        {/* Acciones — carrito */}
        <nav className="p3-topbar__actions" aria-label="Acciones de la tienda">
          <div className="p3-topbar__cart">
            <button
              type="button"
              className="p3-topbar__action-btn"
              aria-label={`Carrito, ${cantidadCarrito} productos`}
              onClick={abrirBolsa}
            >
              <span className="p3-topbar__action-icon">
                <IconCart />
                {cantidadCarrito > 0 && (
                  <span className="p3-topbar__cart-badge" aria-hidden="true">
                    {cantidadCarrito}
                  </span>
                )}
              </span>
              <span className="p3-topbar__action-label p3-topbar__cart-price">
                Mi bolsa
              </span>
            </button>

            {bolsaAbierta && (
              <CarritoPanel
                estilos={estilos}
                items={itemsBolsa}
                onClose={(nuevaBolsa) => {
                  if (nuevaBolsa !== null) onActualizarBolsa(nuevaBolsa);
                  setBolsaAbierta(false);
                }}
                onAbrirModal={() => {
                  setBolsaAbierta(false);
                  onAbrirCarritoModal();
                }}
              />
            )}
          </div>
        </nav>
      </div>

      {/* ── Barra de subcategorías ── */}
      <nav className="p3-subcats" aria-label="Subcategorías">
        {subcats.map((cat) => {
          const coleccion = colecciones.find(
            (item) =>
              String(item.id ?? item.titulo ?? item.coleccion_nombre ?? item.nombre) === cat.id,
          );
          return (
            <button
              key={cat.id}
              type="button"
              className={`p3-subcats__item${subcatActiva === cat.id ? " p3-subcats__item--active" : ""}`}
              onClick={() => {
                setSubcatActiva(cat.id === subcatActiva ? null : cat.id);
                if (coleccion) irAColeccion(coleccion);
              }}
            >
              <span className="p3-subcats__item-icon" aria-hidden="true">
                {cat.icon}
              </span>
              {cat.label}
            </button>
          );
        })}
        <button type="button" className="p3-subcats__more" aria-label="Ver más categorías">
          ⋯
        </button>
      </nav>
    </header>
  );
}
