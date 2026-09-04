import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Wheel from "@uiw/react-color-wheel";
import { Saturation, Hue } from "@uiw/react-color";
import { hsvaToHex, hexToHsva } from "@uiw/color-convert";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import ModalInformacionInputs from "../components/InformacionInputs";
import {
  TraerEstilos,
  ModificarEstilos,
  TraerPlantillaTienda,
  ActualizarPlantilla,
} from "../api/axios";
import "../styles/estilos.css";
import {
  CarritoCompras,
  Text,
  Lapiz,
  Pintar,
  Brocha,
  Touch,
} from "../utils/icons";

function InfoTrigger({ onClick }) {
  return (
    <button
      type="button"
      className="est-info-trigger"
      onClick={onClick}
      aria-label="Ver información"
    >
      !
    </button>
  );
}

/* ══════════════════════════════════════════
   Definición de los campos de color
   con descripción de su efecto en la tienda
══════════════════════════════════════════ */
const CAMPOS = [
  {
    key: "color_principal",
    label: "Color Principal",
    emoji: "Pintar",
    desc: "Fondo del navbar, encabezados y banners principales de la tienda.",
    preview: "navbar",
  },
  {
    key: "color_secundario",
    label: "Color Secundario",
    emoji: "Brocha",
    desc: "Fondos de secciones, separadores y zonas de contraste.",
    preview: "seccion",
  },
  {
    key: "title_color",
    label: "Color de Títulos",
    emoji: "Lapiz",
    desc: "Todos los h1, h2 y h3 visibles en la tienda pública.",
    preview: "titulo",
  },
  {
    key: "text_color",
    label: "Color de Texto",
    emoji: "Text",
    desc: "Párrafos, descripciones de productos y textos generales.",
    preview: "texto",
  },
  {
    key: "color_carrito",
    label: "Color del Carrito",
    emoji: "Text",
    desc: "Icono del carrito, badge de cantidad y barra lateral de compra.",
    preview: "carrito",
  },
  {
    key: "color_botones",
    label: "Color de Botones",
    emoji: "Touch",
    desc: "Botones de 'Agregar al carrito', 'Comprar' y CTAs.",
    preview: "boton",
  },
];

/* ══════════════════════════════════════════
   Color picker en popover
══════════════════════════════════════════ */
function ColorPickerPopover({ value, onChange, onClose }) {
  const ref = useRef(null);

  const [hsva, setHsva] = useState(hexToHsva(value || "#ffffff"));

  // Cerrar al clicar fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  return (
    <div className="est-picker-popover" ref={ref}>
      {/* Saturación + brillo */}
      <Saturation
        hsva={hsva}
        onChange={(color) => {
          setHsva(color);
          onChange(hsvaToHex(color));
        }}
      />

      <Hue
        hue={hsva.h}
        width={200}
        height={20}
        onChange={(newHue) => {
          const nuevoHsva = {
            ...hsva,
            h: newHue.h,
          };

          setHsva(nuevoHsva);
          onChange(hsvaToHex(nuevoHsva));
        }}
      />
      {/* Input HEX */}
      <div className="est-picker-hex">
        <span>#</span>

        <input
          value={value?.replace("#", "") ?? ""}
          maxLength={6}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9a-fA-F]/g, "");

            if (v.length === 6) {
              const nuevoHsva = hexToHsva(`#${v}`);

              setHsva(nuevoHsva);
              onChange(`#${v}`);
            }
          }}
        />
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════
   Preview de la tienda
══════════════════════════════════════════ */
function TiendaPreview({ colores, plantilla }) {
  const {
    color_principal = "#2259d7",
    color_secundario = "#2259d7",
    title_color = "#042d78",
    text_color = "#242f43",
    color_carrito = "#2d75e4",
    color_botones = "#35a4ec",
  } = colores;

  const esPlantilla1 = plantilla === "1";

  return (
    <div className={`est-preview est-preview--p${plantilla}`}>
      {/* Navbar simulado */}
      <div
        className="est-preview__navbar"
        style={{
          background: esPlantilla1
            ? color_principal
            : `linear-gradient(to right, ${color_principal} 0%, ${color_secundario + "50"} 100%)`,
          boxShadow: `0px 0px 25px ${color_secundario + "95"}`,
        }}
      >
        <span className="est-preview__brand" style={{ color: title_color }}>
          {esPlantilla1 ? "Mango Shop" : "MiTienda"}
        </span>
        {esPlantilla1 && (
          <span className="est-preview__nav-links">
            INICIO&nbsp;&nbsp; CATÁLOGO
          </span>
        )}
        <div className="est-preview__nav-right">
          <CarritoCompras width="30" height="30" fill={color_carrito} />
        </div>
      </div>

      {/* Hero */}
      <div
        className="est-preview__hero"
        style={{ background: color_secundario + "22" }}
      >
        <div
          className="est-preview__store-card"
          style={{ backgroundColor: color_principal }}
        >
          <span
            className="est-preview__eyebrow"
            style={{ color: color_botones }}
          >
            {esPlantilla1 ? "NUEVA COLECCIÓN" : "LO MEJOR PARA TI"}
          </span>
          <h2 style={{ color: title_color }}>
            {esPlantilla1 ? "Tu estilo, tu historia" : "Tecnología que inspira"}
          </h2>
          <p className="est-store-description" style={{ color: text_color }}>
            {esPlantilla1
              ? "Piezas escogidas para acompañarte todos los días."
              : "Descubre productos pensados para hacer más fácil tu día."}
          </p>
          <button
            className="est-preview__hero-btn"
            style={{ background: color_botones }}
          >
            {esPlantilla1 ? "EXPLORAR" : "VER CATÁLOGO"}
          </button>
        </div>
      </div>

      {/* Productos */}
      <div
        className="est-preview__products"
        style={{ background: color_principal + "95" }}
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="est-preview__card"
            style={{ boxShadow: `0px 0px 15px ${color_secundario + "85"}` }}
          >
            <div
              className="est-preview__card-img"
              style={{
                background: `linear-gradient(
                  to right,
                    ${color_principal + "70"} 0%,
                    ${color_principal} 25%,
                    ${color_secundario + "50"} 100%
                  )`,
              }}
            />
            <p
              className="est-preview__card-name"
              style={{ color: title_color }}
            >
              {esPlantilla1
                ? ["Vestido Aura", "Bolso Siena", "Lentes Sol"][n - 1]
                : `Producto ${n}`}
            </p>
            <p
              className="est-preview__card-price"
              style={{ color: text_color }}
            >
              $ 89.900
            </p>
            <button
              className="est-preview__card-btn"
              style={{
                background: color_botones,
                color: text_color,
                fontWeight: "bold",
              }}
            >
              {esPlantilla1 ? "COMPRAR" : "VER"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TARJETA de color individual
══════════════════════════════════════════ */
function ColorCard({ campo, value, onChange }) {
  const [open, setOpen] = useState(false);

  const Campos = ({ icon }) => {
    switch (icon) {
      case "Pintar":
        return <Pintar width={30} height={30} fill="#2259d7" />;

      case "Brocha":
        return <Brocha width={30} height={30} fill="#2259d7" />;

      case "Lapiz":
        return <Lapiz width={30} height={30} fill="#2259d7" />;

      case "Text":
        return <Text width={30} height={30} fill="#2259d7" />;

      case "Touch":
        return <Touch width={30} height={30} fill="#2259d7" />;

      default:
        return null;
    }
  };
  return (
    <div className="est-color-card">
      <div className="est-color-card__top">
        <span className="est-color-card__emoji">
          <Campos icon={campo.emoji} />
        </span>
        <div className="est-color-card__info">
          <strong className="est-color-card__label">{campo.label}</strong>
          <p className="est-color-card__desc">{campo.desc}</p>
        </div>
      </div>

      <div className="est-color-card__bottom">
        <button
          className="est-color-swatch"
          style={{ background: value }}
          onClick={() => setOpen((v) => !v)}
          title={`Cambiar ${campo.label}`}
          aria-label={`Seleccionar ${campo.label}`}
        >
          <span className="est-color-swatch__hex">{value}</span>
        </button>

        {open && (
          <ColorPickerPopover
            value={value}
            onChange={(hex) => onChange(campo.key, hex)}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
const DEFAULTS = {
  color_principal: "#2259d7",
  color_secundario: "#2259d7",
  title_color: "#042d78",
  text_color: "#242f43",
  color_carrito: "#2d75e4",
  color_botones: "#35a4ec",
};

function PaginaEstilos() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colores, setColores] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS); // para detectar cambios
  const [plantillaPreview, setPlantillaPreview] = useState("1");
  const [plantillaGuardada, setPlantillaGuardada] = useState("1");
  const [actualizandoPlantilla, setActualizandoPlantilla] = useState(false);
  const [info, setInfo] = useState(null);

  const whatsappUrl =
    "https://wa.me/1348756304?text=" +
    encodeURIComponent(
      "hola, quiero cotizar la creacion de una plantilla personalizada",
    );
  const ActualizarP = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      mostrarAlerta("error", "No cuenta con un token válido");
      navigate("/login");
      return;
    }
    const decode = jwtDecode(token);
    setActualizandoPlantilla(true);
    try {
      await ActualizarPlantilla({
        id_usuario: decode.id,
        plantilla: parseInt(plantillaPreview),
      });
      setPlantillaGuardada(plantillaPreview);
      mostrarAlerta("success", "Se actualizo la plantilla");
    } catch {
      mostrarAlerta("error", "no se pudo actualizar la plantilla de la tienda");
    } finally {
      setActualizandoPlantilla(false);
    }
  };
  const TraerPlantilla = async (id_usuario) => {
    try {
      const res = await TraerPlantillaTienda(id_usuario);
      const plantilla = String(res.data);
      setPlantillaPreview(plantilla);
      setPlantillaGuardada(plantilla);
    } catch {
      mostrarAlerta("error", "no se pudo traer la plantilla de la tienda");
    }
  };

  /* ── Auth + carga ── */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      mostrarAlerta("error", "No cuenta con un token válido");
      navigate("/login");
      return;
    }
    const decode = jwtDecode(token);
    setUsername(decode.usuario?.split(" ")[0] ?? "Usuario");
    setUserId(decode.id);
    cargarEstilos(decode.id);
    TraerPlantilla(decode.id);
  }, []);

  const cargarEstilos = async (id) => {
    setLoading(true);
    try {
      const res = await TraerEstilos(id);
      const d = res.data;
      const loaded = {
        color_principal: d.color_principal ?? DEFAULTS.color_principal,
        color_secundario: d.color_secundario ?? DEFAULTS.color_secundario,
        title_color: d.title_color ?? DEFAULTS.title_color,
        text_color: d.text_color ?? DEFAULTS.text_color,
        color_carrito: d.color_carrito ?? DEFAULTS.color_carrito,
        color_botones: d.color_botones ?? DEFAULTS.color_botones,
      };
      setColores(loaded);
      setOriginal(loaded);
    } catch {
      mostrarAlerta("error", "Error al cargar los estilos de tu tienda");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, hex) => {
    setColores((prev) => ({ ...prev, [key]: hex }));
  };

  const handleReset = () => setColores({ ...original });

  const handleSave = async () => {
    setSaving(true);
    try {
      await ModificarEstilos({ id_usuario: userId, ...colores });
      setOriginal({ ...colores });
      mostrarAlerta("success", "Estilos guardados correctamente ✓");
    } catch (err) {
      mostrarAlerta(
        "error",
        err?.response?.data?.detail ?? "Error al guardar los estilos",
      );
    } finally {
      setSaving(false);
    }
  };

  const hayCambios = JSON.stringify(colores) !== JSON.stringify(original);

  return (
    <>
      <Navbar id={3} userName={username} />

      <div className="est-page">
        <span className="est-orb est-orb--one" aria-hidden="true" />
        <span className="est-orb est-orb--two" aria-hidden="true" />

        {/* ── Encabezado ── */}
        <header className="est-header">
          <div>
            <p className="est-eyebrow">🎨 Personalización</p>
            <h1 className="est-title">
              Estilos de <span>tu Tienda</span>
            </h1>
            <p className="est-subtitle">
              Define la identidad visual de tu tienda pública. Los cambios se
              reflejan en tiempo real en la vista previa.
            </p>
          </div>
          <div className="est-header__actions">
            <button
              className="est-btn est-btn--template"
              onClick={() => ActualizarP(userId)}
              disabled={
                actualizandoPlantilla || plantillaPreview === plantillaGuardada
              }
            >
              {actualizandoPlantilla ? "Cambiando..." : "Cambiar plantilla"}
            </button>
            {hayCambios && (
              <button className="est-btn est-btn--ghost" onClick={handleReset}>
                ↺ Restaurar
              </button>
            )}
            <button
              className="est-btn est-btn--primary"
              onClick={handleSave}
              disabled={saving || !hayCambios}
            >
              {saving ? "Guardando…" : "Guardar cambios ✓"}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="est-loading">
            <div className="est-loading__spinner" />
            <p>Cargando estilos…</p>
          </div>
        ) : (
          <div className="est-layout">
            {/* ── Columna izquierda: selectores ── */}
            <div className="est-selectors">
              <p className="est-section-title">
                Paleta de colores
                <InfoTrigger
                  onClick={() =>
                    setInfo(
                      "Personaliza los colores principales de tu tienda. La vista previa se actualiza al instante, pero debes guardar los cambios para aplicarlos públicamente.",
                    )
                  }
                />
              </p>
              <p className="est-section-hint">
                Haz clic en el cuadro de color para abrir la rueda de selección.
              </p>

              <div className="est-cards-grid">
                {CAMPOS.map((campo) => (
                  <ColorCard
                    key={campo.key}
                    campo={campo}
                    value={colores[campo.key]}
                    onChange={handleChange}
                  />
                ))}
              </div>

              {/* Indicador de cambios pendientes */}
              {hayCambios && (
                <div className="est-cambios-banner">
                  <span>⚠️</span>
                  <p>
                    Tienes cambios sin guardar. Recuerda presionar{" "}
                    <strong>Guardar cambios</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* ── Columna derecha: preview ── */}
            <div className="est-preview-col">
              <div className="est-preview-heading">
                <div>
                  <p className="est-section-title">
                    Vista previa de la tienda
                    <InfoTrigger
                      onClick={() =>
                        setInfo(
                          "Esta vista muestra cómo se verá tu tienda con los colores y la plantilla seleccionados. Es solo una previsualización hasta guardar los cambios.",
                        )
                      }
                    />
                  </p>
                  <p className="est-section-hint">
                    Así se verá tu tienda con la paleta seleccionada.
                  </p>
                </div>
                <label className="est-template-select">
                  <span>
                    Plantilla
                    <InfoTrigger
                      onClick={() =>
                        setInfo(
                          "La plantilla define la estructura visual de tu tienda pública. Selecciona una opción para verla en la previsualización y confirma con Cambiar plantilla.",
                        )
                      }
                    />
                  </span>
                  <select
                    value={plantillaPreview}
                    onChange={(e) => setPlantillaPreview(e.target.value)}
                  >
                    <option value="1">Plantilla 1</option>
                    <option value="2">Plantilla 2</option>
                  </select>
                </label>
              </div>
              <TiendaPreview colores={colores} plantilla={plantillaPreview} />
              <div className="est-custom-template">
                <div>
                  <strong>¿Tienes en mente otro estilo?</strong>
                  <p>
                    Contáctate con nosotros para hacerte tu propia tienda a tu
                    gusto y como quieras.
                  </p>
                </div>
                <a
                  className="est-btn est-btn--contact"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contáctanos
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </>
  );
}

export default PaginaEstilos;
