import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import PaginaInicio from "./pages/PaginaInicio.jsx";
import PaginaLogin from "./pages/PaginaLogin.jsx";
import CrearCuenta from "./pages/PaginaCrearCuenta.jsx";
import PaginaDashboard from "./pages/PaginaDashboard.jsx";
import PaginaGestionProductos from "./pages/PaginaGestionProductos.jsx";
import "./App.css";
import Protedrouter from "./protedrouter.jsx";

function Page({ title, description }) {
  return (
    <section className="page-placeholder">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function App() {
  return (
    <div className="app-shell">
      <main>
        <Routes>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/registro" element={<CrearCuenta />} />
          <Route path="/dashboard" element={
              <Protedrouter roles={["admin", "tendero"]}>
                <PaginaDashboard />
              </Protedrouter>
            }
          />
          <Route path="/dashboard/productos" element={
              <Protedrouter roles={["admin", "tendero"]}>
                <PaginaGestionProductos />
              </Protedrouter>
            }
          />
          <Route
            path="*"
            element={
              <Page
                title="Página no encontrada"
                description="La dirección que buscas no existe."
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
