import { useEffect, useState } from "react";
import {
  ActualizarComoFunciona,
  ActualizarInformacionServicio,
  ActualizarMiExperiencia,
  ActualizarMisEspecialidades,
  ActualizarPorqueTrabajarConmigo,
  ActualizarQueHago,
  ActualizarTuInformacion,
  CrearComoFunciona,
  CrearInformacionServicio,
  CrearMiExperiencia,
  CrearMisEspecialidades,
  CrearPorqueTrabajarConmigo,
  CrearQueHago,
  EliminarComoFunciona,
  EliminarInformacionServicio,
  EliminarMiExperiencia,
  EliminarMisEspecialidades,
  EliminarPorqueTrabajarConmigo,
  EliminarQueHago,
  TraerInformacion,
} from "../api/axios";

import { mostrarAlerta } from "../utils/alerts";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import CampoPrincipalNuevo from "../components/TuInfo/CampoPrincipal";
import ElementoDetalleNuevo from "../components/TuInfo/ElementoDetalle";
import Icono from "../components/TuInfo/Icono";
import ListaPerfil from "../components/TuInfo/ListaPerfil";
import "../styles/tuinformacion.css";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const LISTAS = [
  {
    key: "que_hago",
    title: "¿Qué hago?",
    description: "Cuenta qué servicios o actividades realizas.",
    icon: "💼",
    fields: ["titulo", "descripcion", "icon", "estado"],
  },
  {
    key: "mis_especialidades",
    title: "Mis especialidades",
    description: "Destaca aquello en lo que tienes experiencia.",
    icon: "⭐",
    fields: ["icon", "descripcion", "estado"],
  },
  {
    key: "como_funciona",
    title: "¿Cómo funciona?",
    description: "Explica de forma sencilla cómo trabajan contigo.",
    icon: "⚙️",
    fields: ["titulo", "descripcion", "estado"],
  },
  {
    key: "informacion_servicio",
    title: "Información del servicio",
    description: "Agrega información importante para tus clientes.",
    icon: "📋",
    fields: ["titulo", "descripcion", "estado"],
  },
  {
    key: "mi_experiencia",
    title: "Mi experiencia",
    description: "Comparte algunos datos que respalden tu experiencia.",
    icon: "🏆",
    optional: true,
    fields: [
      "anos_experiencia",
      "clientes_atendidos",
      "calificacion_promedio",
      "estado",
    ],
  },
  {
    key: "porque_trabajar_conmigo",
    title: "¿Por qué trabajar conmigo?",
    description: "Explica qué te diferencia y por qué deberían elegirte.",
    icon: "🤝",
    fields: ["descripcion", "estado"],
  },
];

const CAMPOS_TU_INFO = [
  ["nombre_completo", "Nombre completo"],
  ["dedicacion", "Dedicación"],
  ["dedicacion_detallada", "Dedicación detallada"],
  ["direccion", "Dirección"],
  ["numero_telefono", "Número de teléfono"],
  ["correo", "Correo"],
  ["sobre_mi", "Sobre mí"],
];

const APIS_LISTAS = {
  que_hago: {
    crear: CrearQueHago,
    actualizar: ActualizarQueHago,
    eliminar: EliminarQueHago,
  },
  mis_especialidades: {
    crear: CrearMisEspecialidades,
    actualizar: ActualizarMisEspecialidades,
    eliminar: EliminarMisEspecialidades,
  },
  como_funciona: {
    crear: CrearComoFunciona,
    actualizar: ActualizarComoFunciona,
    eliminar: EliminarComoFunciona,
  },
  informacion_servicio: {
    crear: CrearInformacionServicio,
    actualizar: ActualizarInformacionServicio,
    eliminar: EliminarInformacionServicio,
  },
  mi_experiencia: {
    crear: CrearMiExperiencia,
    actualizar: ActualizarMiExperiencia,
    eliminar: EliminarMiExperiencia,
  },
  porque_trabajar_conmigo: {
    crear: CrearPorqueTrabajarConmigo,
    actualizar: ActualizarPorqueTrabajarConmigo,
    eliminar: EliminarPorqueTrabajarConmigo,
  },
};

const CAMPOS_NUMERICOS = [
  "anos_experiencia",
  "clientes_atendidos",
  "calificacion_promedio",
];

/* =========================================================
   HELPERS
========================================================= */

const objetoVacio = (fields) =>
  Object.fromEntries(
    fields.map((field) => [field, field === "estado" ? true : ""]),
  );

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

function PaginaTuInformacion() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);

  const [tuInformacion, setTuInformacion] = useState({});
  const [nameuser, setnameuser] = useState("user");
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const [listas, setListas] = useState(
    Object.fromEntries(
      LISTAS.map(({ key, fields }) => [key, [objetoVacio(fields)]]),
    ),
  );

  /* =======================================================
     HANDLERS ORIGINALES
  ======================================================= */

  const cambiarTuInformacion = (field, value) => {
    setTuInformacion((actual) => ({
      ...actual,
      [field]: value,
    }));
  };

  const cambiarElemento = (listKey, index, field, value) => {
    setListas((actual) => ({
      ...actual,
      [listKey]: actual[listKey].map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const prepararElemento = (item, id_usuario) => {
    const preparado = {
      ...item,
      id_usuario,
    };

    delete preparado.id;
    delete preparado.id_tu_informacion;

    CAMPOS_NUMERICOS.forEach((campo) => {
      if (preparado[campo] === "" || preparado[campo] === undefined) {
        preparado[campo] = null;
      } else {
        preparado[campo] = Number(preparado[campo]);
      }
    });

    return preparado;
  };

  const TraerInfo = async (id_usuario) => {
    try {
      const respuesta = await TraerInformacion(id_usuario);

      if (!respuesta) return;

      const datos = respuesta.data || {};
      setTuInformacion(datos.tu_informacion || {});

      const nuevasListas = {};

      LISTAS.forEach(({ key, fields }) => {
        const elementos = datos[key] || [];

        nuevasListas[key] =
          elementos.length > 0 ? elementos : [objetoVacio(fields)];
      });

      setListas(nuevasListas);
    } catch (error) {
      console.error(error);
    }
  };

  const actualizarTuInformacion = async () => {
    try {
      await ActualizarTuInformacion(tuInformacion);

      mostrarAlerta("success", "Información actualizada correctamente");

      if (userId) {
        await TraerInfo(userId);
      }
    } catch (error) {
      console.error(error.response);

      mostrarAlerta("error", "No fue posible actualizar la información");
    }
  };

  const crearElemento = async (listKey, item) => {
    const config = APIS_LISTAS[listKey];

    if (!config || !userId) return;

    const tieneInformacion = Object.entries(item).some(
      ([key, value]) =>
        key !== "estado" &&
        value !== "" &&
        value !== null &&
        value !== undefined,
    );

    if (!tieneInformacion) {
      mostrarAlerta("info", "No hay información para crear");
      return;
    }

    try {
      await config.crear(prepararElemento(item, userId));

      mostrarAlerta("success", "Elemento creado correctamente");

      await TraerInfo(userId);
    } catch (error) {
      console.error(error);

      mostrarAlerta("error", "No fue posible crear el elemento");
    }
  };

  const actualizarElemento = async (listKey, item) => {
    const config = APIS_LISTAS[listKey];

    if (!config || !item.id) return;

    try {
      await config.actualizar(item.id, prepararElemento(item, userId));

      mostrarAlerta("success", "Elemento actualizado correctamente");

      await TraerInfo(userId);
      setDetalleSeleccionado(null);
    } catch (error) {
      console.error(error.response);

      mostrarAlerta("error", "No fue posible actualizar el elemento");
    }
  };

  const eliminarElemento = async (listKey, index, item) => {
    const config = APIS_LISTAS[listKey];

    if (!item.id) {
      setListas((actual) => ({
        ...actual,
        [listKey]: actual[listKey].filter((_, i) => i !== index),
      }));

      setDetalleSeleccionado(null);

      return;
    }

    try {
      await config.eliminar({
        id_usuario: userId,
        id: item.id,
      });

      mostrarAlerta("success", "Elemento eliminado correctamente");

      await TraerInfo(userId);
      setDetalleSeleccionado(null);
    } catch (error) {
      console.error(error.response);
      mostrarAlerta("error", "No fue posible eliminar el elemento");
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      const id = decoded.id;
      setnameuser(decoded.usuario || "User");

      setUserId(id);

      if (id) {
        TraerInfo(id);
      }
    } catch (error) {
      console.error(error);
      navigate("/login");
    }
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <Navbar id={3} userName={nameuser} />

      <main className="tu-info-editor">
        {/* ================================================
            DECORACIÓN DE FONDO
        ================================================= */}

        <div
          className="tu-info-editor__decoration tu-info-editor__decoration--one"
          aria-hidden="true"
        />

        <div
          className="tu-info-editor__decoration tu-info-editor__decoration--two"
          aria-hidden="true"
        />

        {/* ================================================
            HERO
        ================================================= */}

        <section className="tu-info-hero">
          <div className="tu-info-hero__content">
            <span className="tu-info-hero__eyebrow">
              <Icono tipo="perfil" />
              PERFIL PROFESIONAL
            </span>

            <h1>
              Construye tu
              <span> perfil profesional</span>
            </h1>

            <p>
              Completa tu información para que tus clientes puedan conocerte,
              entender lo que haces y saber cómo trabajar contigo.
            </p>

            <div className="tu-info-hero__status">
              <span className={tuInformacion.estado ? "is-active" : "is-draft"}>
                <span />
                {tuInformacion.estado
                  ? "Perfil publicado"
                  : "Perfil en borrador"}
              </span>
            </div>
          </div>

          <div className="tu-info-hero__visual" aria-hidden="true">
            <div className="tu-info-hero__circle">
              <span>✦</span>
            </div>

            <div className="tu-info-hero__floating-card">
              <strong>Tu perfil</strong>
              <span>Haz que te conozcan</span>
            </div>
          </div>
        </section>

        {/* ================================================
            INFORMACIÓN PERSONAL
        ================================================= */}

        <section className="tu-info-card tu-info-card--main">
          <div className="tu-info-section-header">
            <div className="tu-info-section-title">
              <div className="tu-info-section-number">01</div>

              <div>
                <span className="tu-info-section-kicker">
                  INFORMACIÓN PRINCIPAL
                </span>

                <h2>Cuéntanos sobre ti</h2>

                <p>
                  Esta será la información principal que aparecerá en tu perfil.
                </p>
              </div>
            </div>

            <div className="tu-info-completion">
              <span>Información personal</span>
              <strong>
                {
                  CAMPOS_TU_INFO.filter(
                    ([field]) =>
                      String(tuInformacion[field] ?? "").trim() !== "",
                  ).length
                }
                /{CAMPOS_TU_INFO.length}
              </strong>
            </div>
          </div>

          <div className="tu-info-divider" />

          <div className="tu-info-form-grid">
            {CAMPOS_TU_INFO.map(([field]) => (
              <CampoPrincipalNuevo
                key={field}
                field={field}
                value={tuInformacion[field]}
                onChange={cambiarTuInformacion}
              />
            ))}

            <div className="tu-info-option-card">
              <div className="tu-info-option-icon">◷</div>

              <div>
                <strong>Disponibilidad</strong>
                <span>
                  Indica si actualmente estás disponible para recibir
                  solicitudes.
                </span>
              </div>

              <label className="tu-info-status">
                <input
                  type="checkbox"
                  checked={Boolean(tuInformacion.disponibilidad)}
                  onChange={(e) =>
                    cambiarTuInformacion("disponibilidad", e.target.checked)
                  }
                />

                <span className="tu-info-status__switch">
                  <span />
                </span>
              </label>
            </div>

            <div className="tu-info-option-card tu-info-option-card--publication">
              <div className="tu-info-option-icon">✓</div>

              <div>
                <strong>Visibilidad del perfil</strong>
                <span>
                  Controla si tu perfil puede ser mostrado públicamente.
                </span>
              </div>

              <label className="tu-info-status">
                <input
                  type="checkbox"
                  checked={Boolean(tuInformacion.estado)}
                  onChange={(e) =>
                    cambiarTuInformacion("estado", e.target.checked)
                  }
                />

                <span className="tu-info-status__switch">
                  <span />
                </span>
              </label>
            </div>
          </div>

          <div className="tu-info-card-footer">
            <div className="tu-info-footer-message">
              <span>i</span>
              <p>
                Puedes guardar tu información aunque todavía no hayas terminado
                tu perfil.
              </p>
            </div>

            <button
              type="button"
              className="tu-info-btn tu-info-btn--primary"
              onClick={actualizarTuInformacion}
            >
              <Icono tipo="guardar" />
              Guardar información
            </button>
          </div>
        </section>

        {/* ================================================
            CONTENIDO DEL PERFIL
        ================================================= */}

        <section className="tu-info-content">
          <div className="tu-info-content-heading">
            <div>
              <span className="tu-info-section-kicker">
                PERSONALIZA TU PERFIL
              </span>

              <h2>Dale contenido a tu perfil</h2>

              <p>
                Agrega información que ayude a tus clientes a conocerte mejor y
                entender tus servicios.
              </p>
            </div>

            <div className="tu-info-content-badge">
              <strong>{LISTAS.length}</strong>
              <span>secciones</span>
            </div>
          </div>

          <div className="tu-info-sections">
            {LISTAS.map((config) => (
              <ListaPerfil
                key={config.key}
                config={config}
                items={listas[config.key]}
                onAgregar={() =>
                  setListas((actual) => ({
                    ...actual,
                    [config.key]: [
                      ...actual[config.key],
                      objetoVacio(config.fields),
                    ],
                  }))
                }
                onCambiar={(index, field, value) =>
                  cambiarElemento(config.key, index, field, value)
                }
                onVerDetalle={setDetalleSeleccionado}
                onCrear={(index) =>
                  crearElemento(config.key, listas[config.key][index])
                }
              />
            ))}
          </div>
        </section>

        <ElementoDetalleNuevo
          selected={detalleSeleccionado}
          onClose={() => setDetalleSeleccionado(null)}
          onActualizar={actualizarElemento}
          onEliminar={eliminarElemento}
        />

        {/* ================================================
            CIERRE / AYUDA
        ================================================= */}

        <section className="tu-info-help">
          <div className="tu-info-help__icon">✦</div>

          <div>
            <span>UN ÚLTIMO CONSEJO</span>

            <h3>Tu información habla por ti</h3>

            <p>
              Mientras más clara y completa sea la información de tu perfil, más
              fácil será para tus clientes entender lo que haces y decidir
              trabajar contigo.
            </p>
          </div>

          <div className="tu-info-help__arrow">→</div>
        </section>
      </main>
    </>
  );
}

export default PaginaTuInformacion;
