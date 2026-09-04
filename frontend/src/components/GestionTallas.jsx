import SeccionTallas from "./TallaCamisa";
import SeccionMedidasGafas from "./TallaGafas";
import SeccionTallasJoyeria from "./TallaJoyas";
import SeccionTallasPantalones from "./TallaPantallon";
import SeccionTallasCalzado from "./TallaZapatos";

function GestionTallas({ actividad, estilos }) {
  switch (actividad) {
    case "Venta de calzado":
      return <SeccionTallasCalzado estilos={estilos} />;
    case "Venta de ropa":
      return (
        <>
          <SeccionTallas estilos={estilos} />
          <SeccionTallasPantalones estilos={estilos} />
        </>
      );
    case "Venta de joyería":
      return <SeccionTallasJoyeria estilos={estilos} />;
    case "Venta de gafas y accesorios":
      return <SeccionMedidasGafas estilos={estilos} />;
  }
}

export default GestionTallas;
