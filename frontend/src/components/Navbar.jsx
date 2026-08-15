import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar({ id, userName }) {
  const navigate = useNavigate();
  const salir = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };
  switch (id) {
    case 1:
      return (
        <header className="navbar">
          <NavLink
            className="brand"
            to="/"
            aria-label="NWBIQShop, ir al inicio"
          >
            <span className="brand-mark">N</span>
            <span>
              NWBIQ<span>Shop</span>
            </span>
          </NavLink>
          <nav
            className="navbar-links"
            aria-label={"Navegaci\u00f3n principal"}
          >
            <a href="#beneficios">Beneficios</a>
            <a href="#como-funciona">{"C\u00f3mo funciona"}</a>
            <NavLink to="/login">{"Iniciar sesi\u00f3n"}</NavLink>
            <NavLink className="button button--navbar" to="/registro">
              Crear cuenta
            </NavLink>
          </nav>
        </header>
      );
    case 2:
      return (
        <header className="navbar">
          <NavLink
            className="brand"
            to="/"
            aria-label="NWBIQShop, ir al inicio"
          >
            <span className="brand-mark">N</span>
            <span>
              NWBIQ<span>Shop</span>
            </span>
          </NavLink>
          <nav
            className="navbar-links"
            aria-label={"Navegaci\u00f3n principal"}
          >
            <NavLink to="/login">{"Iniciar sesion"}</NavLink>
            <NavLink className="button button--navbar" to="/registro">
              Crear cuenta
            </NavLink>
          </nav>
        </header>
      );

    case 3:
      return (
        <header className="navbar navbar--dashboard">
          {/* Marca */}
          <NavLink
            className="brand brand--dashboard"
            to="/dashboard"
            aria-label="NWBIQShop, ir al panel"
          >
            <span className="brand-mark">N</span>
            <span className="brand-text">
              NWBIQ<span className="brand-shop">Shop</span>
            </span>
          </NavLink>

          {/* Centro vacío — espacio flexible */}
          <div className="navbar-spacer" />

          {/* Lado derecho */}
          <div className="navbar-dashboard-right">
            <div className="navbar-welcome">
              <span className="navbar-welcome__avatar">
                {userName ? userName[0].toUpperCase() : "U"}
              </span>
              <div className="navbar-welcome__text">
                <small>Bienvenido de vuelta</small>
                <strong>{userName ?? "Usuario"}</strong>
              </div>
            </div>
            <div className="navbar-divider" />
            <div className="button button--logout" onClick={() => salir()}>
              <span className="logout-icon">↪</span>
              Cerrar sesión
            </div>
          </div>
        </header>
      );
  }
}

export default Navbar;
