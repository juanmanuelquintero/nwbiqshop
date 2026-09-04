import { useState } from "react";
import Busquedainput from "../components/busquedainput";
import Navbar from "../components/Navbar";
import "../styles/crearcuenta.css";
import { Crearcuenta } from "../api/axios";
import { mostrarAlerta } from "../utils/alerts";
import { useNavigate } from "react-router-dom";
import ModalInfomacionInputs from "../components/InformacionInputs";
import ModalSuscripcion from "../components/ModalSuscripcion";

const STEPS = ["Sobre ti", "Tu tienda"];

function StepIndicator({ current, total }) {
  return (
    <div className="cc-step-indicator">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`cc-step-dot ${i + 1 === current ? "cc-step-dot--active" : i + 1 < current ? "cc-step-dot--done" : ""}`}
        />
      ))}
    </div>
  );
}

function CrearCuenta() {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));
  const navigate = useNavigate();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [cedula, setCedula] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setciudad] = useState("");

  const [nombreTienda, setNombreTienda] = useState("");
  const [dominio, setDominio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [actividad, setActividad] = useState("");
  const [telefonoTienda, setTelefonoTienda] = useState("");
  const [direccionTienda, setDireccionTienda] = useState("");
  const [modalinfo, setmodalinfo] = useState(false);
  const [informacion, setinformacion] = useState("");

  const cambiarinformacion = (id) => {
    switch (id) {
      case 1:
        return setinformacion(
          "La descripción será visible para los visitantes de tu tienda pública. Puedes utilizar este espacio para presentar tu negocio, contar qué productos o servicios ofreces y compartir información relevante que ayude a tus clientes a conocer mejor tu tienda. Este campo se puede actualizar en cualquier momento dentro de tu tienda.",
        );
      case 2:
        return setinformacion(
          "Este es el enlace público de tu tienda. Se genera automáticamente cuando creas tu cuenta y podrás compartirlo con tus clientes para que visiten tu tienda en cualquier momento.",
        );

      default:
        return setinformacion("");
    }
  };

  const limpiar = () => {
    setNombres("");
    setApellidos("");
    setCedula("");
    setDireccion("");
    setFechaNacimiento("");
    setCorreo("");
    setContraseña("");
    setConfirmarContraseña("");
    setTelefono("");
    setciudad("");
    setNombreTienda("");
    setDominio("");
    setDescripcion("");
    setActividad("");
    setTelefonoTienda("");
    setDireccionTienda("");
  };

  const Crear_cuenta = async () => {
    if (
      !nombres ||
      !apellidos ||
      !cedula ||
      !direccion ||
      !fechaNacimiento ||
      !correo ||
      !contraseña ||
      !confirmarContraseña ||
      !telefono ||
      !ciudad ||
      !nombreTienda ||
      !dominio ||
      !descripcion ||
      !actividad
    ) {
      return mostrarAlerta("info", "Llene todos los campos obligatorios");
    }

    if (contraseña != confirmarContraseña) {
      return mostrarAlerta(
        "info",
        "La contraseña debe coincidir en los dos campos",
      );
    }

    if (contraseña.length < 8 || contraseña.length > 15) {
      return mostrarAlerta(
        "info",
        "La contraseña debe tener minimo 8 caracteres y maximo 15",
      );
    }

    if (dominio.includes(" ")) {
      return mostrarAlerta(
        "info",
        "El dominio de su tienda no contener espacios",
      );
    }

    try {
      const res = await Crearcuenta({
        cedula: cedula,
        nombres: nombres,
        apellidos: apellidos,
        ciudad: ciudad,
        direccion: direccion,
        fecha_nacimieno: fechaNacimiento,
        correo: correo,
        telefono: telefono,
        contraseña: contraseña,
        nombre: nombreTienda,
        dominio: dominio,
        descripcion: descripcion,
        actividad: actividad,
        direccion_tienda: direccionTienda,
        telefono_tienda: telefonoTienda,
      });
      mostrarAlerta(
        "success",
        "Cuenta creada con exito, ya puedes iniciar sesion",
      );
      limpiar();
      navigate("/login");
    } catch (err) {
      mostrarAlerta(
        "error",
        err.response?.data?.detail ||
          "Hubo un error al intentar crear la cuenta, intentalo mas tarde",
      );
    }
  };

  return (
    <>
      <Navbar id={2} />
      <main className="cc-page">
        {/* ── Lado izquierdo – beneficios ── */}
        <aside className="cc-aside">
          <div className="cc-aside__decoration cc-aside__decoration--one" />
          <div className="cc-aside__decoration cc-aside__decoration--two" />

          <p className="eyebrow">Tu mejor opción</p>
          <h1>
            NWBIQ<span>Shop</span>
          </h1>
          <p className="cc-aside__desc">
            Crea tu cuenta gratis y administra tu emprendimiento desde cualquier
            lugar sin preocupaciones.
          </p>

          <ul className="cc-feature-list">
            {[
              {
                icon: "✦",
                title: "Gestión remota",
                sub: "Administra tu tienda desde cualquier sitio",
              },
              {
                icon: "✦",
                title: "Cuenta gratuita",
                sub: "Sin costos ocultos, comienza hoy mismo",
              },
              {
                icon: "✦",
                title: "Productos flexibles",
                sub: "Crea y modifica tu catálogo fácilmente",
              },
              {
                icon: "✦",
                title: "Personalización",
                sub: "Tu tienda con tu propio estilo",
              },
            ].map(({ icon, title, sub }) => (
              <li key={title}>
                <span>{icon}</span>
                <p>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </p>
              </li>
            ))}
          </ul>

          <div className="cc-badge">
            <div className="cc-badge__dot" />
            <div>
              <small>Únete a miles de</small>
              <strong>emprendedores activos</strong>
            </div>
            <b>🚀</b>
          </div>
        </aside>

        {/* ── Lado derecho – formulario ── */}
        <div className="cc-form-area">
          <div className="cc-card">
            {/* Cabecera */}
            <div className="cc-card__header">
              <div className="cc-auth-badge">N</div>
              <div>
                <p>Registro</p>
                <h2>
                  Tu <span>Cuenta</span>
                </h2>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="cc-progress-bar">
              <div
                className="cc-progress-bar__fill"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            <p className="cc-step-label">
              Paso {step} de {totalSteps}: <strong>{STEPS[step - 1]}</strong>
            </p>

            {/* Campos paso 1 */}
            {step === 1 && (
              <div className="cc-fields">
                <p className="cc-fields__hint">
                  Campos con <span className="cc-required">*</span> son
                  obligatorios
                </p>
                <div className="cc-grid">
                  <section className="cc-field">
                    <label>
                      Nombres completos <span className="cc-required">*</span>
                    </label>
                    <input
                      placeholder="Ej: Juan Esteban"
                      className="cc-field-input"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Apellidos completos <span className="cc-required">*</span>
                    </label>
                    <input
                      placeholder="Ej: Pineda García"
                      className="cc-field-input"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Cédula <span className="cc-required">*</span>
                    </label>
                    <input
                      placeholder="Ej: 1115115115"
                      className="cc-field-input"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Ciudad <span className="cc-required">*</span>
                    </label>
                    <Busquedainput
                      text="Ej: Armenia"
                      ciudad={ciudad}
                      setciudad={setciudad}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Dirección <span className="cc-required">*</span>
                    </label>
                    <input
                      placeholder="Ej: Calle 21 #17-9"
                      className="cc-field-input"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Fecha de nacimiento <span className="cc-required">*</span>
                    </label>
                    <input
                      type="date"
                      className="cc-field-input"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Correo electrónico <span className="cc-required">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Ej: juan@gmail.com"
                      className="cc-field-input"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Contraseña <span className="cc-required">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="cc-field-input"
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Confirmar contraseña{" "}
                      <span className="cc-required">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Repite tu contraseña"
                      className="cc-field-input"
                      value={confirmarContraseña}
                      onChange={(e) => setConfirmarContraseña(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Telefono <span className="cc-required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 3116726512"
                      className="cc-field-input"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </section>
                </div>
              </div>
            )}

            {/* Campos paso 2 */}
            {step === 2 && (
              <div className="cc-fields">
                <p className="cc-fields__hint">
                  Campos con <span className="cc-required">*</span> son
                  obligatorios
                </p>
                <div className="cc-grid">
                  <section className="cc-field">
                    <label>
                      Nombre de la tienda <span className="cc-required">*</span>
                    </label>
                    <input
                      placeholder="Ej: Mi Tienda Online"
                      className="cc-field-input"
                      value={nombreTienda}
                      onChange={(e) => setNombreTienda(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>
                      Dominio <span className="cc-required">*</span>
                      <span
                        className="informacion-sobre-los-datos"
                        onClick={() => {
                          cambiarinformacion(2);
                          setmodalinfo(true);
                        }}
                      >
                        ¡
                      </span>
                    </label>
                    <input
                      placeholder="Ej: Calzado-2026"
                      className="cc-field-input"
                      value={dominio}
                      onChange={(e) => setDominio(e.target.value)}
                    />
                  </section>
                  <section className="cc-field cc-field--full">
                    <label>
                      Descripción de la tienda
                      <span className="cc-required">*</span>
                      <span
                        className="informacion-sobre-los-datos"
                        onClick={() => {
                          cambiarinformacion(1);
                          setmodalinfo(true);
                        }}
                      >
                        ¡
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Cuéntanos brevemente sobre tu tienda..."
                      className="cc-field-input"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </section>
                  <section className="cc-field cc-field--full">
                    <label>
                      Actividad que se dedica la tienda
                      <span className="cc-required">*</span>
                    </label>
                    <select
                      className="cc-field-input"
                      value={actividad}
                      onChange={(e) => setActividad(e.target.value)}
                    >
                      <option hidden>Seleccione uno</option>
                      <option>Venta de calzado</option>
                      <option>Venta de ropa</option>
                      <option>Venta de lociones y perfumes</option>
                      <option>Venta de gafas y accesorios</option>
                      <option>Venta de joyería</option>
                      <option>Venta de accesorios</option>
                      <option>Venta de maquillaje</option>
                      <option>Venta de productos para el cuidado</option>
                      <option>Venta de artículos para el hogar</option>
                      <option>Venta de muebles</option>
                      <option>Venta de dispositivos tecnologicos</option>
                      <option>Venta de videojuegos</option>
                      <option>Venta de libros</option>
                      <option>Venta de alimentos</option>
                      <option>Otros</option>
                    </select>
                  </section>
                  <section className="cc-field">
                    <label>
                      Telefono tienda<span className="cc-required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 3116726512"
                      className="cc-field-input"
                      value={telefonoTienda}
                      onChange={(e) => setTelefonoTienda(e.target.value)}
                    />
                  </section>
                  <section className="cc-field">
                    <label>Direccion tienda (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 21 #17-9"
                      className="cc-field-input"
                      value={direccionTienda}
                      onChange={(e) => setDireccionTienda(e.target.value)}
                    />
                  </section>
                </div>
              </div>
            )}

            {/* Navegación */}
            <div className="cc-nav">
              <button
                className="cc-btn cc-btn--ghost"
                onClick={goPrev}
                disabled={step === 1}
              >
                ← Atrás
              </button>

              <StepIndicator current={step} total={totalSteps} />

              {step < totalSteps ? (
                <button className="cc-btn cc-btn--primary" onClick={goNext}>
                  Siguiente →
                </button>
              ) : (
                <button
                  className="cc-btn cc-btn--submit"
                  onClick={() => Crear_cuenta()}
                >
                  Crear cuenta ✦
                </button>
              )}
            </div>

            <p className="cc-login-hint">
              ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
            </p>
          </div>
        </div>
      </main>
      {modalinfo && (
        <ModalInfomacionInputs text={informacion} setmodal={setmodalinfo} />
      )}
    </>
  );
}

export default CrearCuenta;
