import { useState } from "react";
import "../styles/filtro.css";

function Busquedainput({ text, ciudad, setciudad }) {
  const [filtro, setfiltro] = useState([]);
  const Ciudades = [
    "Leticia",
    "Medellín",
    "Arauca",
    "Barranquilla",
    "Cartagena",
    "Tunja",
    "Manizales",
    "Florencia",
    "Yopal",
    "Popayán",
    "Valledupar",
    "Quibdó",
    "Montería",
    "Bogotá",
    "Inírida",
    "San José del Guaviare",
    "Neiva",
    "Riohacha",
    "Santa Marta",
    "Villavicencio",
    "Pasto",
    "Cúcuta",
    "Mocoa",
    "Armenia",
    "Pereira",
    "San Andrés",
    "Bucaramanga",
    "Sincelejo",
    "Ibagué",
    "Cali",
    "Mitú",
    "Puerto Carreño",

    "Palmira",
    "Buenaventura",
    "Tuluá",
    "Buga",
    "Cartago",
    "Zarzal",
    "Caicedonia",
    "Jamundí",
    "Roldanillo",
    "Sevilla",

    "Soacha",
    "Zipaquirá",
    "Chía",
    "Facatativá",
    "Girardot",

    "Envigado",
    "Bello",
    "Itagüí",
    "Rionegro",
    "Apartadó",

    "Dosquebradas",
    "Santa Rosa de Cabal",

    "Barrancabermeja",
    "Floridablanca",
    "Girón",
    "Piedecuesta",

    "Soledad",
    "Malambo",

    "Maicao",
    "Uribia",

    "Ipiales",
    "Tumaco",

    "Fusagasugá",
    "Mosquera",
    "Funza",
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
