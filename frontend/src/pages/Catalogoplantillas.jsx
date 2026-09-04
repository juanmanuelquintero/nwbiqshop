import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TraerTiendaCliente } from "../api/axios";
import { mostrarAlerta } from "../utils/alerts";
import "../styles/catalogoplantillas.css";
import Plantilla2 from "../themes/Plantilla2";
import Plantilla1 from "../themes/Plantilla1";
import Plantilla3 from "../themes/Plantilla3";
import Plantilla4 from "../themes/Plantilla4";

function Tienda404({ dominio }) {
  const nav = useNavigate();
  return (
    <div className="tn-404">
      <div className="tn-404__orb tn-404__orb--one" />
      <div className="tn-404__orb tn-404__orb--two" />
      <div className="tn-404__content">
        <div className="tn-404__code">404</div>
        <h1 className="tn-404__title">Tienda no encontrada</h1>
        <p className="tn-404__desc">
          No existe ninguna tienda con el dominio <strong>"{dominio}"</strong>.
          Es posible que la URL esté incorrecta o que la tienda haya sido
          desactivada.
        </p>
        <div className="tn-404__actions">
          <button
            className="tn-404__btn tn-404__btn--primary"
            onClick={() => nav("/")}
          >
            ← Volver al inicio
          </button>
          <button
            className="tn-404__btn tn-404__btn--ghost"
            onClick={() => nav("/registro")}
          >
            Crear mi tienda gratis
          </button>
        </div>
        <p className="tn-404__hint">
          ¿Eres el dueño de esta tienda? Revisa tu dominio en Opciones.
        </p>
      </div>
    </div>
  );
}

function Catalogosplantillas() {
  const { tienda } = useParams();
  const [tiendaencontrada, settiendacontrada] = useState(null);
  const [plantilla, setplantilla] = useState(1);
  const [cargando, setcargando] = useState(true);
  const buscarplantillatienda = async () => {
    try {
      setcargando(true);
      const res = await TraerTiendaCliente(tienda);
      settiendacontrada(res.data);
      console.log(res.data);
      const bolsa = localStorage.getItem("bolsa");
      if (bolsa) {
        localStorage.removeItem("bolsa");
      }
      setplantilla(res.data?.plantilla || 1);
      setcargando(false);
    } catch (err) {
      mostrarAlerta("error", "no se encontro una tienda");
      setcargando(false);
    }
  };
  useEffect(() => {
    buscarplantillatienda();
  }, []);

  const Buscarplantilla = () => {
    switch (plantilla) {
      case 1:
        return <Plantilla1 tienda={tiendaencontrada} dominio={tienda} />;
      case 2:
        return <Plantilla2 tienda={tiendaencontrada} dominio={tienda} />;
      case 3:
        return <Plantilla3 tienda={tiendaencontrada} dominio={tienda} />;
      case 4:
        return <Plantilla4 tienda={tiendaencontrada} dominio={tienda} />;
      default:
        return <h1>hola5</h1>;
    }
  };

  if (cargando) {
    return (
      <div className="tn-loading">
        <div className="tn-loading__spinner" />
        <p>Cargando tienda…</p>
      </div>
    );
  }

  if (!tiendaencontrada) {
    return <Tienda404 dominio={tienda} />;
  }

  return <Buscarplantilla />;
}

export default Catalogosplantillas;
