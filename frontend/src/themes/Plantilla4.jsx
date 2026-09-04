import { useEffect, useState, useCallback } from "react";
import "../styles/plantilla4.css";

import P4Hero from "../components/p4/P4Hero";
import P4NavCats from "../components/p4/P4NavCats";
import P4InfoSection from "../components/p4/P4InfoSection";
import P4Promociones from "../components/p4/P4Promociones";
import P4Catalogo from "../components/p4/P4Catalogo";
import P4Antojate from "../components/p4/P4Antojate";
import P4GuiaTallas from "../components/p4/P4GuiaTallas";
import P4Footer from "../components/p4/P4Footer";
import NavbarInferior from "../components/p4/navbarinferiorp4";
import P4CarritoPanel from "../components/p4/P4CarritoPanel";
import CarritoModal from "../components/CarritoModal";

export default function Plantilla4({ tienda, dominio }) {
  const [cantidadBolsa, setCantidadBolsa] = useState(0);
  const [itemsBolsa, setItemsBolsa] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoModalAbierto, setCarritoModalAbierto] = useState(false);
  const estdodelalpormayor = tienda.datos_alpormayor?.estado;

  // ── Datos derivados ────────────────────────────────
  const telefonoTienda = tienda?.telefono?.replace(/\D/g, "") ?? "";
  const telefonoWhatsApp =
    telefonoTienda.length === 10 ? `57${telefonoTienda}` : telefonoTienda;

  const colecciones = tienda?.colecciones ?? [];
  const alpormayor = tienda?.datos_alpormayor ?? null;
  const cantMinima = alpormayor?.cantidad_minima ?? 6;
  const promocion = tienda?.datospromocion ?? null;
  const productosPromoGeneral = tienda?.productos_promo_general ?? [];
  const productosPromoUnitaria = tienda?.productos_promo_unitaria ?? [];

  const totalProductos = colecciones.reduce(
    (acc, col) => acc + (col.productos?.length ?? 0),
    0,
  );

  // ── Helpers compartidos ────────────────────────────
  const fmtPrecio = (v) => `$${Number(v ?? 0).toLocaleString("es-CO")}`;

  const calcPrecioPromo = (producto, descuentoBase = 0) => {
    if (producto.precio_final != null) return Number(producto.precio_final);
    const precio = Number(producto.precio_original ?? producto.precio ?? 0);
    return precio * (1 - Number(producto.descuento ?? descuentoBase) / 100);
  };

  // ── Leer cantidad de la bolsa ──────────────────────
  const leerCantidadBolsa = useCallback(() => {
    try {
      const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      const items = Array.isArray(guardada) ? guardada : [];
      setItemsBolsa(items);
      const total = Array.isArray(guardada)
        ? items.reduce((a, i) => a + Number(i.cantidad ?? 1), 0)
        : 0;
      setCantidadBolsa(total);
    } catch {
      setItemsBolsa([]);
      setCantidadBolsa(0);
    }
  }, []);

  const estilos = {
    color_principal: "#fffdfe",
    color_secundario: "#b85080",
    title_color: "#570029",
    text_color: "#250011",
    color_botones: "#ec75ad",
  };

  // Sincronizar contador al montar y cada vez que el storage cambie
  useEffect(() => {
    leerCantidadBolsa();
    window.addEventListener("storage", leerCantidadBolsa);
    return () => window.removeEventListener("storage", leerCantidadBolsa);
  }, [leerCantidadBolsa]);

  // Escuchar cambios del modal (el modal guarda en localStorage directamente)
  // Usamos un intervalo corto solo cuando el carrito no está abierto
  useEffect(() => {
    if (carritoAbierto) return;
    const id = setInterval(leerCantidadBolsa, 800);
    return () => clearInterval(id);
  }, [carritoAbierto, leerCantidadBolsa]);

  return (
    <div className="p4-page">
      <P4Hero
        tienda={tienda}
        totalProductos={totalProductos}
        colecciones={colecciones}
        cantMinima={cantMinima}
        telefonoWhatsApp={telefonoWhatsApp}
        estdoalpormayor={estdodelalpormayor}
      />

      <P4NavCats colecciones={colecciones} />

      <P4InfoSection
        cantMinima={cantMinima}
        estadoalpormayor={estdodelalpormayor}
      />

      <P4Promociones
        promocion={promocion}
        productosPromoGeneral={productosPromoGeneral}
        productosPromoUnitaria={productosPromoUnitaria}
        cantMinima={cantMinima}
        fmtPrecio={fmtPrecio}
        calcPrecioPromo={calcPrecioPromo}
        estadoalpormayor={estdodelalpormayor}
      />

      <P4Catalogo
        colecciones={colecciones}
        cantMinima={cantMinima}
        fmtPrecio={fmtPrecio}
        promocion={promocion}
        productosPromoGeneral={productosPromoGeneral}
        productosPromoUnitaria={productosPromoUnitaria}
        estadoalpormayor={estdodelalpormayor}
      />

      <P4Antojate
        dominio={dominio}
        colecciones={colecciones}
        cantMinima={cantMinima}
        fmtPrecio={fmtPrecio}
        estadoalpormayor={estdodelalpormayor}
      />

      <P4GuiaTallas />

      {/* Espaciado inferior para que el navbar no tape el footer */}
      <div style={{ height: "72px" }} aria-hidden="true" />

      <P4Footer tienda={tienda} telefonoWhatsApp={telefonoWhatsApp} />

      {/* ── Navbar inferior fijo ── */}
      <NavbarInferior
        nombre={tienda?.nombre ?? ""}
        cantidadBolsa={cantidadBolsa}
        onAbrirBolsa={() => {
          setCarritoAbierto(true);
          leerCantidadBolsa();
        }}
      />

      {/* ── Panel carrito ── */}
      {carritoAbierto && (
        <P4CarritoPanel
          fmtPrecio={fmtPrecio}
          cantMinima={cantMinima}
          onClose={() => {
            setCarritoAbierto(false);
            leerCantidadBolsa();
          }}
          onIrAlCarrito={() => {
            leerCantidadBolsa();
            setCarritoAbierto(false);
            setCarritoModalAbierto(true);
          }}
          estadoalpormaayor={estdodelalpormayor}
        />
      )}

      {carritoModalAbierto && (
        <CarritoModal
          estilos={estilos}
          pasarela={tienda?.pasarela_pagos}
          items={itemsBolsa}
          dominio={dominio}
          telefono={tienda?.telefono}
          nombreTienda={tienda?.nombre ?? "Mi Tienda"}
          onClose={() => {
            setCarritoModalAbierto(false);
            leerCantidadBolsa();
          }}
          onActualizar={(items) => {
            setItemsBolsa(items);
            leerCantidadBolsa();
          }}
          estadoAlPorMayor={estdodelalpormayor}
          cantidadMinimaMayorista={cantMinima}
        />
      )}
    </div>
  );
}
