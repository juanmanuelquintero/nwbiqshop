import { useState } from "react";
import CarritoModal from "../CarritoModal";
import CarritoPanel from "../CarritoPanel";
import { consolidarBolsa } from "../../utils/bolsa";

export default function HeaderP2({
  tienda,
  dominio,
  colecciones = [],
  estadoAlPorMayor = false,
  cantidadMinimaMayorista = 6,
}) {
  const inicial = tienda.nombre?.trim()?.charAt(0).toUpperCase() || "T";
  const telefono = tienda.telefono?.replace(/\D/g, "");
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  const [carritoModalAbierto, setCarritoModalAbierto] = useState(false);
  const [itemsBolsa, setItemsBolsa] = useState([]);
  const enlaces = colecciones.length
    ? colecciones.map((coleccion) => ({
        nombre: coleccion.coleccion_nombre,
        destino: `#coleccion-${coleccion.coleccion_nombre.toLowerCase().replace(/\s/g, "-")}`,
      }))
    : [
        { nombre: "Inicio", destino: "#inicio" },
        { nombre: "Productos", destino: "#recomendaciones" },
        { nombre: "Novedades", destino: "#daily-picks" },
      ];

  const abrirBolsa = () => {
    const bolsaGuardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
    const bolsa = consolidarBolsa(bolsaGuardada);
    setItemsBolsa(bolsa);
    localStorage.setItem("bolsa", JSON.stringify(bolsa));
    setBolsaAbierta((abierta) => !abierta);
  };

  return (
    <header className="p2-header" id="inicio">
      <a
        href="#inicio"
        className="p2-header__brand"
        aria-label={`Inicio de ${tienda.nombre}`}
      >
        {tienda.logo ? (
          <img src={tienda.logo} alt="" className="p2-header__logo" />
        ) : (
          <span className="p2-header__logo p2-header__logo--fallback">
            {inicial}
          </span>
        )}
        <span className="p2-header__name">{tienda.nombre || "Tu tienda"}</span>
      </a>

      <nav className="p2-header__nav" aria-label="Navegación principal">
        {enlaces.map((enlace) => (
          <a
            key={enlace.destino}
            href={enlace.destino}
            className="p2-header__link"
          >
            {enlace.nombre}
          </a>
        ))}
      </nav>
      <div className="conetedor__bolsa-y-telefono">
        {telefono && (
          <a
            className="p2-header__contact"
            href={`https://wa.me/57${telefono}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="p2-header__contact-label">Escríbenos</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
        <div className="p2-header__cart">
          <button
            type="button"
            className="p2-header__cart-button"
            onClick={abrirBolsa}
            aria-label="Abrir mi bolsa"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              className="bolsa-header"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 14.3C10.5207 14.7686 10.8126 15.0314 11.3333 15.5L14 12.5"
                stroke="var(--p2-cart)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6"
                stroke="var(--p2-cart)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M20.2235 12.5257C19.6382 9.40452 19.3456 7.84393 18.2347 6.92196C17.1238 6 15.5361 6 12.3605 6H11.6393C8.46374 6 6.87596 6 5.76506 6.92196C4.65416 7.84393 4.36155 9.40452 3.77633 12.5257C2.9534 16.9146 2.54194 19.1091 3.74157 20.5545C4.94119 22 7.17389 22 11.6393 22H12.3605C16.8259 22 19.0586 22 20.2582 20.5545C20.9542 19.7159 21.1079 18.6252 20.9536 17"
                stroke="var(--p2-cart)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {itemsBolsa.length > 0 && (
              <span className="p2-header__cart-count">
                {itemsBolsa.reduce(
                  (total, item) => total + (item.cantidad ?? 1),
                  0,
                )}
              </span>
            )}
          </button>
          {bolsaAbierta && (
            <CarritoPanel
              estilos={tienda.estilos}
              items={itemsBolsa}
              onClose={(nueva) => {
                if (nueva !== null) setItemsBolsa(nueva);
                setBolsaAbierta(false);
              }}
              onAbrirModal={() => {
                setBolsaAbierta(false);
                setCarritoModalAbierto(true);
              }}
              estadoAlPorMayor={estadoAlPorMayor}
              cantidadMinimaMayorista={cantidadMinimaMayorista}
            />
          )}
        </div>
      </div>
      {carritoModalAbierto && (
        <CarritoModal
          estilos={tienda.estilos}
          pasarela={tienda.pasarela_pagos}
          items={itemsBolsa}
          estadoAlPorMayor={estadoAlPorMayor}
          cantidadMinimaMayorista={cantidadMinimaMayorista}
          dominio={dominio}
          telefono={tienda.telefono}
          nombreTienda={tienda.nombre}
          onClose={() => setCarritoModalAbierto(false)}
          onActualizar={setItemsBolsa}
        />
      )}
    </header>
  );
}
