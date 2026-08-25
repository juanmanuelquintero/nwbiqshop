import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import PaginaInicio from "./pages/PaginaInicio.jsx";
import PaginaLogin from "./pages/PaginaLogin.jsx";
import CrearCuenta from "./pages/PaginaCrearCuenta.jsx";
import PaginaDashboard from "./pages/PaginaDashboard.jsx";
import PaginaGestionProductos from "./pages/PaginaGestionProductos.jsx";
import PaginaInventario from "./pages/PaginaInventario.jsx";
import PaginaColecciones from "./pages/PaginaColecciones.jsx";
import PaginaEstilos from "./pages/PaginaEstilos.jsx";
import PaginaOpciones from "./pages/PaginaOpciones.jsx";
import PaginaPromociones from "./pages/PaginaPromociones.jsx";
import PaginaPedidos from "./pages/PaginaPedidos.jsx";
import "./App.css";
import Protedrouter from "./protedrouter.jsx";
import Tienda from "./pages/Tienda.jsx";
import Catalogosplantillas from "./pages/Catalogoplantillas.jsx";
import Plantilla2 from "./themes/Plantilla2.jsx";

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
    <>
      {/* Rutas con layout principal (Footer de NWBIQShop) */}
      <Routes>
        <Route
          path="/*"
          element={
            <div className="app-shell">
              <main>
                <Routes>
                  <Route path="/" element={<PaginaInicio />} />
                  <Route path="/login" element={<PaginaLogin />} />
                  <Route path="/registro" element={<CrearCuenta />} />
                  <Route
                    path="/dashboard"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaDashboard />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/productos"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaGestionProductos />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/inventario"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaInventario />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/colecciones"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaColecciones />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/estilos"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaEstilos />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/opciones"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaOpciones />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/promociones"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaPromociones />
                      </Protedrouter>
                    }
                  />
                  <Route
                    path="/dashboard/pedidos"
                    element={
                      <Protedrouter roles={["admin", "tendero"]}>
                        <PaginaPedidos />
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
          }
        />
        {/* La tienda pública tiene su propio navbar y footer — sin layout de NWBIQShop */}
        <Route path="/tienda/:busqueda" element={<Tienda />} />
        <Route path="/tienda2/:tienda" element={<Catalogosplantillas />} />
        <Route path="/plantilla" element={<Plantilla2 />} />
      </Routes>
    </>
  );
}

export default App;
