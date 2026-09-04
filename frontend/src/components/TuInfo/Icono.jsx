export default function Icono({ tipo }) {
  const iconos = {
    guardar: "✓",
    editar: "✎",
    eliminar: "×",
    agregar: "+",
    flecha: "→",
    perfil: "◎",
    informacion: "i",
  };

  return (
    <span className={`tu-info-icon tu-info-icon--${tipo}`}>
      {iconos[tipo] || "•"}
    </span>
  );
}
