import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Wheel from "@uiw/react-color-wheel";
import { Saturation, Hue } from "@uiw/react-color";
import { hsvaToHex, hexToHsva } from "@uiw/color-convert";
import Navbar from "../components/Navbar";
import { mostrarAlerta } from "../utils/alerts";
import { TraerEstilos, ModificarEstilos } from "../api/axios";
import "../styles/estilos.css";
import {
  CarritoCompras,
  Text,
  Lapiz,
  Pintar,
  Brocha,
  Touch,
} from "../utils/icons";

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
function TiendaPreview({ colores }) {
  const {
    color_principal = "#2259d7",
    color_secundario = "#2259d7",
    title_color = "#042d78",
    text_color = "#242f43",
    color_carrito = "#2d75e4",
    color_botones = "#35a4ec",
  } = colores;

  return (
    <div className="est-preview">
      {/* Navbar simulado */}
      <div
        className="est-preview__navbar"
        style={{
          background: `linear-gradient(
          to right,
            ${color_principal} 0%,
            ${color_principal} 25%,
            ${color_secundario + "50"} 100%
          )`,
          boxShadow: `0px 0px 25px ${color_secundario + "95"}`,
        }}
      >
        <span className="est-preview__brand" style={{ color: title_color }}>
          MiTienda
        </span>
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
          style={{
            backgroundColor: color_principal,
          }}
        >
          <h2 style={{ color: title_color }}>Conócenos</h2>

          <p className="est-store-description" style={{ color: text_color }}>
            Somos una tienda comprometida con ofrecer productos de calidad y una
            excelente experiencia para nuestros clientes (esta es la descripcion
            de tu tienda, si gustas puedes cambiar todos estos datos desde
            opciones).
          </p>

          <div className="est-store-info">
            <div>
              <span className="est-store-label" style={{ color: text_color }}>
                Teléfono:
              </span>

              <span className="est-store-value" style={{ color: text_color }}>
                Teléfono de tu tienda (si tu tienda cuenta con un nuemero
                telefonico)
              </span>
            </div>

            <div>
              <span className="est-store-label" style={{ color: text_color }}>
                Nos dedicamos a:
              </span>

              <span className="est-store-value" style={{ color: text_color }}>
                A lo que tu tienda se dedica
              </span>
            </div>

            <div>
              <span className="est-store-label" style={{ color: text_color }}>
                Dirección:
              </span>

              <span className="est-store-value" style={{ color: text_color }}>
                Dirección de tu tienda (si cuentas con una direccion fisica)
              </span>
            </div>
          </div>

          <div className="est-store-about">
            <h3 style={{ color: title_color }}>Nuestra tienda</h3>

            <p style={{ color: text_color }}>
              Encuentra todo lo que necesitas en un solo lugar. Explora nuestro
              catálogo y descubre productos pensados especialmente para ti.
            </p>
          </div>
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
              Producto {n}
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
              VER
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
              <p className="est-section-title">Paleta de colores</p>
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
              <p className="est-section-title">Vista previa de la tienda</p>
              <p className="est-section-hint">
                Así se verá tu tienda con la paleta seleccionada.
              </p>
              <TiendaPreview colores={colores} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PaginaEstilos;
