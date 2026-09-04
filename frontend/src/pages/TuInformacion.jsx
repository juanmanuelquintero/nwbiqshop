import { useParams } from "react-router-dom";
import "../styles/tuinformacion.css";
import { TraerInformacionCliente } from "../api/axios";
import { mostrarAlerta } from "../utils/alerts";
import { useEffect, useState } from "react";

function TuInformacion() {
  const { dominio } = useParams();
  const [cargando, setcargando] = useState(false);
  const [pagina404, setpagina404] = useState(false);
  const [TuInformacion, setTuInformacion] = useState({
    tu_informacion: null,
    que_hago: [],
    mis_especialidades: [],
    como_funciona: [],
    informacion_servicio: [],
    mi_experiencia: [],
    porque_trabajar_conmigo: [],
  });

  const Traerlainformacion = async () => {
    setcargando(true);
    try {
      const res = await TraerInformacionCliente(dominio);
      setTuInformacion(res.data || {});
    } catch (err) {
      mostrarAlerta("error", "no se encontro la informacion");
      setpagina404(true);
    }
    setcargando(false);
  };

  useEffect(() => {
    Traerlainformacion();
  }, [dominio]);

  const perfil = TuInformacion.tu_informacion;
  const elementosActivos = (elementos = []) =>
    elementos.filter((elemento) => elemento.estado !== false);
  const queHago = elementosActivos(TuInformacion.que_hago);
  const especialidades = elementosActivos(TuInformacion.mis_especialidades);
  const comoFunciona = elementosActivos(TuInformacion.como_funciona);
  const informacionServicio = elementosActivos(
    TuInformacion.informacion_servicio,
  );
  const experiencia = elementosActivos(TuInformacion.mi_experiencia)[0];
  const razones = elementosActivos(TuInformacion.porque_trabajar_conmigo);

  if (cargando) {
    return (
      <div>
        <h1>Cargando...</h1>
      </div>
    );
  }

  if (pagina404) {
    return (
      <div>
        <h1>Pagina 404</h1>
      </div>
    );
  }

  return (
    <section className="tu-informacion">
      {/* Encabezado */}
      <div className="tu-informacion__header">
        <div className="tu-informacion__photo">
          <img
            src="https://i.pravatar.cc/500?img=47"
            alt={`Foto de ${perfil?.nombre_completo || "el profesional"}`}
          />
        </div>

        <div className="tu-informacion__identity">
          <span className="tu-informacion__label">{perfil?.dedicacion}</span>

          <h1>{perfil?.nombre_completo}</h1>

          <p className="tu-informacion__profession">
            {perfil?.dedicacion_detallada}
          </p>

          <p className="tu-informacion__location">📍 {perfil?.direccion}</p>

          <div
            className={`tu-informacion__status ${perfil?.disponibilidad ? "active" : "desactive"}`}
          >
            {perfil?.disponibilidad ? (
              <>
                <span className="tu-informacion__status-dot true"></span>
                <label>Disponible</label>
              </>
            ) : (
              <>
                <span className="tu-informacion__status-dot false"></span>
                <label>No disponible</label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Presentación */}
      {perfil?.sobre_mi?.trim() && (
        <div className="tu-informacion__section">
          <h2>Sobre mí</h2>
          <p>{perfil.sobre_mi}</p>
        </div>
      )}

      {/* ¿Qué hago? */}
      {queHago.length > 0 && (
        <div className="tu-informacion__section">
          <h2>¿Qué hago?</h2>

          <div className="tu-informacion__services">
            {queHago.map((elemento) => (
              <div className="tu-informacion__service" key={elemento.id}>
                <span>{elemento.icon}</span>
                <div>
                  <h3>{elemento.titulo}</h3>
                  <p>{elemento.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Especialidades */}
      {especialidades.length > 0 && (
        <div className="tu-informacion__section">
          <h2>Mis especialidades</h2>

          <div className="tu-informacion__tags">
            {especialidades.map((elemento) => (
              <span key={elemento.id}>
                {elemento.icon} {elemento.descripcion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      {comoFunciona.length > 0 && (
        <div className="tu-informacion__section">
          <h2>¿Cómo funciona un pedido por encargo?</h2>

          <div className="tu-informacion__steps">
            {comoFunciona.map((elemento, indice) => (
              <div className="tu-informacion__step" key={elemento.id}>
                <strong>{String(indice + 1).padStart(2, "0")}</strong>
                <div>
                  <h3>{elemento.titulo}</h3>
                  <p>{elemento.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información comercial */}
      {informacionServicio.length > 0 && (
        <div className="tu-informacion__section">
          <h2>Información del servicio</h2>

          <div className="tu-informacion__details">
            {informacionServicio.map((elemento) => (
              <div key={elemento.id}>
                <span>{elemento.titulo}</span>
                <strong>{elemento.descripcion}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiencia */}
      {experiencia && (
        <div className="tu-informacion__section">
          <h2>Mi experiencia</h2>

          <div className="tu-informacion__stats">
            <div>
              <strong>{experiencia.anos_experiencia ?? 0}+</strong>
              <span>Años de experiencia</span>
            </div>

            <div>
              <strong>{experiencia.clientes_atendidos ?? 0}+</strong>
              <span>Clientes atendidos</span>
            </div>

            <div>
              <strong>{experiencia.calificacion_promedio ?? 0}/5</strong>
              <span>Calificación promedio</span>
            </div>
          </div>
        </div>
      )}

      {/* Confianza */}
      {razones.length > 0 && (
        <div className="tu-informacion__section">
          <h2>¿Por qué trabajar conmigo?</h2>

          <div className="tu-informacion__benefits">
            {razones.map((elemento) => (
              <div key={elemento.id}>
                <span>✓</span>
                <p>{elemento.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacto */}
      {(perfil?.numero_telefono || perfil?.correo) && (
        <div className="tu-informacion__contact">
          <div>
            <span className="tu-informacion__contact-label">
              ¿Tienes un producto en mente?
            </span>

            <h2>Hablemos sobre tu pedido</h2>

            <p>
              Cuéntame qué estás buscando y te ayudaré a revisar las opciones
              disponibles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (perfil?.numero_telefono) {
                window.location.href = `tel:${perfil.numero_telefono}`;
              }
            }}
          >
            Contactar a {perfil?.nombre_completo || "este profesional"}
          </button>
        </div>
      )}
    </section>
  );
}

export default TuInformacion;
