import { useState } from "react";
import "../styles/plantilla2.css";
import PromocionesTargetaP2 from "../components/p2/PromocionesTaregetaP2";
import CollectionModalP2 from "../components/p2/CollectionModalP2";
import PromocionesP2 from "../components/p2/PromocionesP2";
import DailyPicksSectionP2 from "../components/p2/DailyPicksSectionP2";
import FooterP2 from "../components/p2/FooterP2";
import HeaderP2 from "../components/p2/HeaderP2";
import HeroBannerP2 from "../components/p2/HeroBannerP2";
import TallaBannerP2 from "../components/p2/TallaBannerP2";
import ProductSectionP2 from "../components/p2/ProductSectionP2";
import ProductModalP2 from "../components/p2/ProductModalP2";
import BarraConfianza from "../components/p2/BarraConfianzaP2";
import FiltroCatalogoP2 from "../components/p2/FiltroCatalogoP2";
import GestionTallas from "../components/GestionTallas";
import { useNavigate } from "react-router-dom";

const COMBOS = [
  {
    name: "Xiaomi 17T Pro(12+512) + Xiaomi Buds 6",
    currentPrice: "5.112.900",
    originalPrice: "5.425.800",
    discount: "312.900",
    link: "#",
  },
  {
    name: "Xiaomi 17T(12+512) + Xiaomi Band 10 Pro",
    currentPrice: "4.192.900",
    originalPrice: "4.385.800",
    discount: "192.900",
    link: "#",
  },
  {
    name: "Xiaomi 17 Ultra + Photography Kit Pro + Scooter 6 Ultra",
    currentPrice: "10.199.900",
    originalPrice: "12.299.700",
    discount: "2.099.800",
    link: "#",
  },
];

export default function Plantilla2({ tienda, dominio }) {
  const estilos = tienda.estilos ?? {};
  const colecciones = tienda.colecciones ?? [];
  const datosAlPorMayor = tienda.datos_alpormayor ?? null;
  const estadoAlPorMayor = datosAlPorMayor?.estado === true;
  const cantidadMinimaMayorista = Number(datosAlPorMayor?.cantidad_minima ?? 6);
  const [coleccionSeleccionada, setColeccionSeleccionada] = useState(null);
  const [modalColeccionAbierto, setModalColeccionAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const navigate = useNavigate();
  const listadeactividades = [
    "Venta de calzado",
    "Venta de ropa",
    "Venta de joyería",
    "Venta de gafas y accesorios",
  ];
  const actividadtienda = tienda.actividad;
  const colores = {
    "--p2-primary": estilos.color_principal ?? "#ffffff",
    "--p2-secondary": estilos.color_secundario ?? "#2259d7",
    "--p2-title": estilos.title_color ?? "#042d78",
    "--p2-text": estilos.text_color ?? "#242f43",
    "--p2-cart": estilos.color_carrito ?? "#2d75e4",
    "--p2-btn": estilos.color_botones ?? "#004cc7",
  };

  return (
    <div className="p2-page" style={colores}>
      <HeaderP2
        tienda={tienda}
        dominio={dominio}
        colecciones={colecciones}
        estadoAlPorMayor={estadoAlPorMayor}
        cantidadMinimaMayorista={cantidadMinimaMayorista}
      />
      <HeroBannerP2 tienda={tienda} />
      <BarraConfianza estilos={estilos} pasarela={tienda.pasarela_pagos} />
      <PromocionesTargetaP2 tienda={tienda} />
      <PromocionesP2
        tienda={tienda}
        estadoAlPorMayor={estadoAlPorMayor}
        cantidadMinimaMayorista={cantidadMinimaMayorista}
      />
      <div className="pedido-consulta">
        <div className="pedido-consulta__info">
          <h3>¿Ya hiciste un pedido?</h3>
          <p>Consulta el estado de tu pedido y revisa cómo va tu compra.</p>
        </div>

        <button
          type="button"
          className="pedido-consulta__button"
          onClick={() => navigate("/buscar-pedidos")}
        >
          Consultar estado
        </button>
      </div>
      {listadeactividades.includes(actividadtienda) ? <TallaBannerP2 /> : <></>}
      <FiltroCatalogoP2
        collections={colecciones}
        selectedCollection={coleccionSeleccionada}
        setSelectedCollection={setColeccionSeleccionada}
        setCollectionModalOpen={setModalColeccionAbierto}
      />
      {modalColeccionAbierto && (
        <CollectionModalP2
          collection={coleccionSeleccionada}
          onClose={() => setModalColeccionAbierto(false)}
          onProductSelect={setProductoSeleccionado}
          estadoAlPorMayor={estadoAlPorMayor}
          cantidadMinimaMayorista={cantidadMinimaMayorista}
        />
      )}
      {productoSeleccionado && (
        <ProductModalP2
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          estadoAlPorMayor={estadoAlPorMayor}
          cantidadMinimaMayorista={cantidadMinimaMayorista}
        />
      )}
      {colecciones
        .filter(
          (collection) =>
            !coleccionSeleccionada ||
            (collection.coleccion_nombre ?? collection.nombre) ===
              (coleccionSeleccionada.coleccion_nombre ??
                coleccionSeleccionada.nombre),
        )
        .map((collection) => (
          <ProductSectionP2
            key={collection.coleccion_nombre}
            collection={collection}
            onProductSelect={setProductoSeleccionado}
            estadoAlPorMayor={estadoAlPorMayor}
            cantidadMinimaMayorista={cantidadMinimaMayorista}
          />
        ))}
      <DailyPicksSectionP2
        dominio={dominio}
        estadoAlPorMayor={estadoAlPorMayor}
        cantidadMinimaMayorista={cantidadMinimaMayorista}
      />
      {listadeactividades.includes(actividadtienda) ? (
        <GestionTallas actividad={actividadtienda} estilos={estilos} />
      ) : (
        <></>
      )}

      <FooterP2 tienda={tienda} />
    </div>
  );
}
