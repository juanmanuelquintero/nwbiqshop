import { useState } from "react";
import "../styles/filtro.css";

function Busquedainput({ text, ciudad, setciudad }) {
  const [filtro, setfiltro] = useState([]);
  const Ciudades = [
    "caicedonia",
    "cali",
    "armenia",
    "pereira",
    "barrancabermeja",
    "armero",
  ];

  const Busqueda = (e) => {
    const value = e.target.value;
    setciudad(value);
    const filter = Ciudades.filter((ciu) =>
      ciu.toLowerCase().includes(value.toLowerCase()),
    );
    setfiltro(filter);
  };

  const Vaciarfiltro = (item) => {
    setciudad(item);
    setfiltro([]);
  };

  return (
    <div className="contenedor-filtro">
      <input
        placeholder={text}
        value={ciudad}
        onChange={(e) => Busqueda(e)}
        className="cc-field-input"
      />
      {ciudad.length > 2 && (
        <div className="filtro">
          {filtro.map((item, index) => (
            <div
              key={index}
              className="seleccionar-ciudad"
              onClick={() => Vaciarfiltro(item)}
            >
              <label>{item}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Busquedainput;
