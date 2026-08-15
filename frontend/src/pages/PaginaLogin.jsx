import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import Navbar from "../components/Navbar";
import { validarUsuario } from "../api/axios";
import { useState } from "react";
import { mostrarAlerta } from "../utils/alerts";

function PaginaLogin() {
  const [correo, setcorreo] = useState("");
  const [contraseña, setcontraseña] = useState("");
  const navigate = useNavigate();

  const Iniciarsesion = async (e) => {
    e.preventDefault();
    try {
      if (correo && contraseña) {
        const res = await validarUsuario(correo, contraseña);
        mostrarAlerta("success", "sesion iniciada");
        sessionStorage.setItem("token", res.data?.token);
        navigate("/dashboard");
      } else {
        mostrarAlerta("info", "Llene todos los campos");
      }
    } catch (err) {
      const error = err.response?.data?.detail;
      mostrarAlerta("error", error);
    }
  };
  return (
    <>
      <Navbar id={2} />
      <section className="auth-page">
        <div
          className="auth-decoration auth-decoration--one"
          aria-hidden="true"
        />
        <div
          className="auth-decoration auth-decoration--two"
          aria-hidden="true"
        />

        <aside className="auth-aside">
          <p className="eyebrow">NWBIQShop para tu negocio</p>
          <h1>Bienvenido de nuevo.</h1>
          <p>
            Tu tienda sigue trabajando por ti. Administra productos, pedidos y
            colecciones desde donde estés.
          </p>
          <div className="auth-feature-list">
            <div>
              <span>01</span>
              <p>
                <strong>Todo en un solo lugar</strong>
                <small>Organiza tu negocio con claridad y sin enredos.</small>
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>Fácil y rápido</strong>
                <small>Gestiona tu tienda desde casa o desde tu celular.</small>
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>Siempre disponible</strong>
                <small>
                  Tu catálogo está listo cuando tus clientes lo necesiten.
                </small>
              </p>
            </div>
          </div>
          <div className="auth-mini-card" aria-hidden="true">
            <span className="mini-dot" />
            <div>
              <small>Ventas de hoy</small>
              <strong>$ 428.500</strong>
            </div>
            <b>+18%</b>
          </div>
        </aside>

        <div className="auth-form-area">
          <div className="auth-modal">
            <form className="auth-form" onSubmit={Iniciarsesion}>
              <div className="auth-form-heading">
                <span className="auth-badge">N</span>
                <div>
                  <p>Ingresa a tu cuenta</p>
                  <h2>Qué bueno verte otra vez.</h2>
                </div>
              </div>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                required
                value={correo}
                onChange={(e) => setcorreo(e.target.value)}
              />
              <div className="password-label">
                <label htmlFor="password">Contraseña</label>
                <Link to="/recuperar-contrasena">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                required
                value={contraseña}
                onChange={(e) => setcontraseña(e.target.value)}
              />
              <label className="remember">
                <input type="checkbox" name="remember" />{" "}
                <span>Recordarme en este dispositivo</span>
              </label>
              <button
                className="button button--primary auth-submit"
                type="submit"
              >
                Iniciar sesión <span>→</span>
              </button>
              <p className="auth-register">
                ¿Aún no tienes una cuenta?{" "}
                <Link to="/registro">Crea tu cuenta gratis</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default PaginaLogin;
