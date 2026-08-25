import { useState } from "react";
import "../styles/plantilla2.css";
import BenefitsBarP2 from "../components/p2/BenefitsBarP2";
import CombosSectionP2 from "../components/p2/CombosSectionP2";
import CollectionModalP2 from "../components/p2/CollectionModalP2";
import CouponSectionP2 from "../components/p2/CouponSectionP2";
import DailyPicksSectionP2 from "../components/p2/DailyPicksSectionP2";
import FooterP2 from "../components/p2/FooterP2";
import HeaderP2 from "../components/p2/HeaderP2";
import HeroBannerP2 from "../components/p2/HeroBannerP2";
import MiPointsSectionP2 from "../components/p2/MiPointsSectionP2";
import NewsletterP2 from "../components/p2/NewsletterP2";
import ProductSectionP2 from "../components/p2/ProductSectionP2";
import PromoBadgesP2 from "../components/p2/PromoBadgesP2";
import PromoBannersSectionP2 from "../components/p2/PromoBannersSectionP2";
import RecommendationsSectionP2 from "../components/p2/RecommendationsSectionP2";
import TabletSectionP2 from "../components/p2/TabletSectionP2";

// ============================================================
// PLANTILLA TIPO XIAOMI POCO CARNIVAL - Landing Page de Tienda
// ============================================================

// --- DATOS DE EJEMPLO (reemplazar con los tuyos) ---

const HERO_BANNER = {
  title: "POCO CARNIVAL",
  subtitle: "De 8 a ♾️",
  backgroundImage:
    "https://i02.appmifile.com/16_operator_co/31/07/2026/8a7153143e27ec4d880e1da333b52aaa.jpg?thumb=1&w=2560&f=webp&q=85",
  termsLink: "#",
};

const PROMO_BADGES = [
  {
    icon: "🏷️",
    title: "Cupón 15% OFF",
    description: "Hasta $100K",
  },
  {
    icon: "🛒",
    title: "Compra adicional",
    description: "Ahorra hasta $500K al añadir AIoT",
  },
  {
    icon: "🎁",
    title: "Compra X y llévate Y",
    description: "Regalos con valor de hasta $639.900",
  },
];

const BENEFITS = [
  "Hasta 24 meses sin intereses",
  "Canje de puntos por cupones",
  "Devolución gratuita durante los primeros 8 días",
  "Envíos gratis en compras superiores a $60.000",
];

const COUPON = {
  discount: "15% OFF",
  code: "POCO Carnival-15%OFF",
  minSpend: "$99.900",
  maxSave: "$100.000",
  validity: "07/08 00:00 - 23/08 23:59",
};

const MI_POINTS_COUPONS = [
  { discount: "10% OFF", description: "Válido para Celulares", points: 4000 },
  {
    discount: "$400.000 OFF",
    description: "¡400.000 OFF en Xiaomi 17T serie!",
    points: 6000,
  },
  { discount: "15% OFF", description: "Serie Redmi Note 14", points: 5000 },
  {
    discount: "$50.000 OFF",
    description: "En tablets desde $400.000",
    points: 5000,
  },
  { discount: "15% OFF", description: "Válido para Ecosistema", points: 8000 },
];

const PRODUCT_SECTIONS = [
  {
    title: "Serie POCO F",
    products: [
      {
        name: "POCO F8 Pro",
        variants: ["12GB + 256GB", "12GB + 512GB"],
        highlight: "Snapdragon® 8 Elite",
        discount: "500.000",
        currentPrice: "2.299.900",
        originalPrice: "2.799.900",
        financing: "0% de interés a 12 meses",
        badge: "Regalo",
        image:
          "https://i02.appmifile.com/114_item_co/24/11/2025/a793b2e2aae0b9153825c1f5a22aa380.png?thumb=1&w=340&f=webp&q=85",
        link: "#",
      },
      {
        name: "POCO F8 Ultra",
        variants: ["12GB + 256GB", "16GB + 512GB"],
        highlight: "Next-gen Snapdragon® 8 Elite Gen 5",
        discount: "500.000",
        currentPrice: "3.299.900",
        originalPrice: "3.799.900",
        financing: "0% de interés a 12 meses",
        badge: null,
        image: "",
        link: "#",
      },
    ],
  },
  {
    title: "Serie POCO X",
    products: [
      {
        name: "POCO X8 Pro",
        variants: ["8GB + 512GB", "12GB + 512GB", "8GB + 256GB"],
        highlight: "Flagship Dimensity 8500-Ultra",
        discount: "450.000",
        currentPrice: "1.649.900",
        originalPrice: "2.099.900",
        financing: "0% de interés a 12 meses",
        badge: null,
        image: "",
        link: "#",
      },
    ],
  },
  {
    title: "Serie POCO M",
    products: [
      {
        name: "POCO M8s 5G",
        variants: ["6GB + 128GB", "8GB + 256GB"],
        highlight: "Batería masiva de 7000mAh (típ)",
        discount: null,
        currentPrice: "999.900",
        originalPrice: null,
        financing: null,
        badge: "Nuevo",
        image: "",
        link: "#",
      },
      {
        name: "POCO M8 Pro 5G",
        variants: ["8GB + 256GB", "12GB + 512GB"],
        highlight: "Batería de 6500mAh (típ)",
        discount: "400.000",
        currentPrice: "1.399.900",
        originalPrice: "1.799.900",
        financing: null,
        badge: null,
        image: "",
        link: "#",
      },
      {
        name: "POCO M7",
        variants: ["8GB + 256GB"],
        highlight: "Batería masiva de 7000 mAh (típ.)",
        discount: "350.000",
        currentPrice: "599.900",
        originalPrice: "949.900",
        financing: "0% de interés a 6 meses",
        badge: null,
        image: "",
        link: "#",
      },
    ],
  },
  {
    title: "Serie POCO C",
    products: [
      {
        name: "POCO C81 Pro",
        variants: ["4GB + 64GB", "4GB + 128GB", "4GB + 256GB"],
        highlight: 'Pantalla inmersiva de 6.9"',
        discount: null,
        currentPrice: "399.900",
        originalPrice: null,
        financing: null,
        badge: "Nuevo",
        image: "",
        link: "#",
      },
      {
        name: "POCO C85",
        variants: ["6GB + 128GB", "8GB + 256GB"],
        highlight: null,
        discount: "70.000",
        currentPrice: "499.900",
        originalPrice: "569.900",
        financing: "0% de interés a 6 meses",
        badge: null,
        image: "",
        link: "#",
      },
    ],
  },
];

const TABLETS = [
  {
    name: "POCO Pad M1",
    variants: ["8GB + 256GB"],
    highlight: 'Pantalla de 12.1" 120Hz 2.5K',
    discount: "250.000",
    currentPrice: "1.149.900",
    originalPrice: "1.399.900",
    image: "",
    link: "#",
  },
  {
    name: "POCO Pad C1",
    variants: ["4GB + 64GB", "6GB + 128GB"],
    highlight: null,
    discount: null,
    currentPrice: "499.900",
    originalPrice: null,
    badge: "Nuevo",
    image: "",
    link: "#",
  },
];

const RECOMMENDATIONS = [
  {
    name: "Xiaomi Buds 5",
    currentPrice: "399.900",
    originalPrice: "445.900",
    discount: "46.000",
    link: "#",
  },
  {
    name: "REDMI Buds 6 Pro",
    currentPrice: "279.900",
    originalPrice: "329.900",
    discount: "50.000",
    link: "#",
  },
  {
    name: "REDMI Buds 6 Lite",
    currentPrice: "109.900",
    originalPrice: "119.900",
    discount: "10.000",
    link: "#",
  },
  {
    name: "REDMI Buds 8 Active",
    currentPrice: "99.900",
    originalPrice: "149.900",
    discount: "50.000",
    link: "#",
  },
  {
    name: 'Xiaomi 4K Monitor A27Ui 27"',
    currentPrice: "1.129.900",
    originalPrice: null,
    discount: null,
    link: "#",
  },
  {
    name: "Xiaomi Tag",
    currentPrice: "79.900",
    originalPrice: "129.900",
    discount: "50.000",
    link: "#",
  },
];

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

const PROMO_BANNERS = [
  {
    title: "Xiaomi Para Estudiantes",
    description: "Verifica tu condición de estudiante y obtén descuento",
    link: "#",
    bgColor: "#FFF3E0",
  },
  {
    title: "Tu IMEI vale dinero: ¡hasta $320K OFF!",
    description:
      "Registra tu IMEI y obtén hasta $320K OFF después de comprar tu smartphone.",
    link: "#",
    bgColor: "#E8F5E9",
  },
  {
    title: "Comparte Xiaomi, gana con tu amig@",
    description: "Invita a tu amig@ y ambos reciben $50K OFF. ¡Todos ganan!",
    link: "#",
    bgColor: "#E3F2FD",
  },
  {
    title: "Celebra tu cumpleaños con Xiaomi",
    description: "Registra tu fecha de cumpleaños y disfruta de 10% OFF.",
    link: "#",
    bgColor: "#FCE4EC",
  },
];

const DAILY_PICKS = [
  {
    name: "REDMI Note 15",
    specs: "8GB + 256GB",
    currentPrice: "899.900",
    originalPrice: "1.049.900",
    discount: "150.000",
    image:
      "https://i02.appmifile.com/320_item_co/14/01/2026/7f2c9f8743af55a3fedf1d6b42fdf0aa.png?thumb=1&w=340&f=webp&q=85",
  },
  {
    name: "POCO M7",
    specs: "8GB + 256GB",
    currentPrice: "599.900",
    originalPrice: "949.900",
    discount: "350.000",
    image:
      "https://i02.appmifile.com/761_item_co/19/08/2025/ad7061eee3a62d4186415f2470ce975c.png?thumb=1&w=340&f=webp&q=85",
  },
  {
    name: "Xiaomi Watch 5",
    specs: "",
    currentPrice: "1.399.900",
    originalPrice: null,
    discount: null,
    image:
      "https://i02.appmifile.com/340_item_co/10/02/2026/b139237d57d6b8be496205dda3e7bea5.png?thumb=1&w=340&f=webp&q=85",
  },
  {
    name: "Xiaomi Robot Vacuum H50",
    specs: "",
    currentPrice: "1.839.900",
    originalPrice: null,
    discount: null,
    image:
      "https://i02.appmifile.com/639_item_co/09/02/2026/6512ead0e8293c0f37331f0d6eacb007.png?thumb=1&w=340&f=webp&q=85",
  },
];

export default function Plantilla2({ tienda, dominio }) {
  const estilos = tienda.estilos ?? {};
  const colecciones = tienda.colecciones ?? [];
  const [coleccionSeleccionada, setColeccionSeleccionada] = useState(null);
  const [modalColeccionAbierto, setModalColeccionAbierto] = useState(false);
  const colores = {
    "--p2-primary": estilos.color_principal ?? "#ffffff",
    "--p2-secondary": estilos.color_secundario ?? "#2259d7",
    "--p2-title": estilos.title_color ?? "#042d78",
    "--p2-text": estilos.text_color ?? "#242f43",
    "--p2-cart": estilos.color_carrito ?? "#2d75e4",
  };

  return (
    <div className="p2-page" style={colores}>
      <HeaderP2 tienda={tienda} colecciones={colecciones} />
      <HeroBannerP2 tienda={tienda} />
      <PromoBadgesP2 estilos={estilos} pasarela={tienda.pasarela_pagos} />
      <BenefitsBarP2 tienda={tienda} />
      <CouponSectionP2 tienda={tienda} />
      <MiPointsSectionP2 />
      <PromoBannersSectionP2
        collections={colecciones}
        selectedCollection={coleccionSeleccionada}
        setSelectedCollection={setColeccionSeleccionada}
        setCollectionModalOpen={setModalColeccionAbierto}
      />
      {modalColeccionAbierto && (
        <CollectionModalP2
          collection={coleccionSeleccionada}
          onClose={() => setModalColeccionAbierto(false)}
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
          />
        ))}
      <DailyPicksSectionP2 picks={DAILY_PICKS} />
      <CombosSectionP2 combos={COMBOS} />
      <NewsletterP2 />
      <FooterP2 />
    </div>
  );
}
