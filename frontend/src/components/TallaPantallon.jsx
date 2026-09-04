import { useState } from "react";
import "../styles/componentes.css";

/*
  TABLA ADULTOS
  Medidas aproximadas en centímetros.
*/
const TABLA_ADULTO = [
  {
    talla: "28",
    cintura: [68, 72],
    cadera: [86, 90],
    largo: [98, 101],
  },
  {
    talla: "30",
    cintura: [73, 77],
    cadera: [91, 95],
    largo: [100, 103],
  },
  {
    talla: "32",
    cintura: [78, 82],
    cadera: [96, 100],
    largo: [102, 105],
  },
  {
    talla: "34",
    cintura: [83, 87],
    cadera: [101, 105],
    largo: [104, 107],
  },
  {
    talla: "36",
    cintura: [88, 92],
    cadera: [106, 110],
    largo: [106, 109],
  },
  {
    talla: "38",
    cintura: [93, 97],
    cadera: [111, 115],
    largo: [108, 111],
  },
  {
    talla: "40",
    cintura: [98, 102],
    cadera: [116, 120],
    largo: [110, 113],
  },
];

/*
  TABLA NIÑOS

  Tallas infantiles aproximadas.
*/
const TABLA_NINOS = [
  {
    talla: "2",
    edad: "2 años",
    cintura: [49, 51],
    cadera: [52, 55],
    largo: [42, 47],
  },
  {
    talla: "4",
    edad: "4 años",
    cintura: [51, 53],
    cadera: [55, 58],
    largo: [48, 53],
  },
  {
    talla: "6",
    edad: "6 años",
    cintura: [53, 55],
    cadera: [58, 62],
    largo: [54, 59],
  },
  {
    talla: "8",
    edad: "8 años",
    cintura: [55, 58],
    cadera: [62, 66],
    largo: [60, 65],
  },
  {
    talla: "10",
    edad: "10 años",
    cintura: [58, 61],
    cadera: [66, 70],
    largo: [66, 71],
  },
  {
    talla: "12",
    edad: "12 años",
    cintura: [61, 65],
    cadera: [70, 75],
    largo: [72, 77],
  },
  {
    talla: "14",
    edad: "14 años",
    cintura: [65, 69],
    cadera: [75, 80],
    largo: [78, 83],
  },
  {
    talla: "16",
    edad: "16 años",
    cintura: [69, 73],
    cadera: [80, 85],
    largo: [84, 89],
  },
];

const DEFAULTS = {
  adulto: {
    cintura: 80,
    cadera: 98,
    largo: 103,
  },

  nino: {
    cintura: 57,
    cadera: 64,
    largo: 63,
  },
};

function calcularTalla(cintura, cadera, largo, tabla) {
  const scores = tabla.map((t) => ({
    talla: t.talla,

    dif:
      Math.abs(cintura - (t.cintura[0] + t.cintura[1]) / 2) +
      Math.abs(cadera - (t.cadera[0] + t.cadera[1]) / 2) +
      Math.abs(largo - (t.largo[0] + t.largo[1]) / 2),
  }));

  return scores.sort((a, b) => a.dif - b.dif)[0].talla;
}

function SeccionTallasPantalones({ estilos }) {
  const bg = estilos?.color_principal ?? "#ffffff";

  const sec = estilos?.color_secundario ?? "#2259d7";

  const titl = estilos?.title_color ?? "#042d78";

  const txt = estilos?.text_color ?? "#242f43";

  const btn = estilos?.color_botones ?? "#35a4ec";

  /*
    Adulto / Niño
  */
  const [tipo, setTipo] = useState("adulto");

  /*
    Medidas
  */
  const [cintura, setCintura] = useState(DEFAULTS.adulto.cintura);

  const [cadera, setCadera] = useState(DEFAULTS.adulto.cadera);

  const [largo, setLargo] = useState(DEFAULTS.adulto.largo);

  /*
    Tabla según el tipo
  */
  const tabla = tipo === "adulto" ? TABLA_ADULTO : TABLA_NINOS;

  /*
    Rangos del slider
  */
  const MIN = tipo === "adulto" ? 45 : 45;

  const MAX = tipo === "adulto" ? 125 : 95;

  /*
    Resultado
  */
  const resultado = calcularTalla(cintura, cadera, largo, tabla);

  const tallaidx = tabla.findIndex((t) => t.talla === resultado);

  const pct = (v) => ((v - MIN) / (MAX - MIN)) * 100;

  /*
    Cambiar adulto / niño
  */
  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);

    if (nuevoTipo === "adulto") {
      setCintura(DEFAULTS.adulto.cintura);

      setCadera(DEFAULTS.adulto.cadera);

      setLargo(DEFAULTS.adulto.largo);
    } else {
      setCintura(DEFAULTS.nino.cintura);

      setCadera(DEFAULTS.nino.cadera);

      setLargo(DEFAULTS.nino.largo);
    }
  };

  /*
    Restablecer
  */
  const restablecer = () => {
    const defaults = tipo === "adulto" ? DEFAULTS.adulto : DEFAULTS.nino;

    setCintura(defaults.cintura);
    setCadera(defaults.cadera);
    setLargo(defaults.largo);
  };

  /*
    Sliders
  */
  const sliders = [
    {
      label: "Cintura",
      emoji: "⌛",
      val: cintura,
      set: setCintura,

      hint: "Mide alrededor de la cintura, sin apretar la cinta.",
    },

    {
      label: "Cadera",
      emoji: "🧍",
      val: cadera,
      set: setCadera,

      hint: "Mide alrededor de la parte más ancha de la cadera.",
    },

    {
      label: "Largo de pierna",
      emoji: "📏",
      val: largo,
      set: setLargo,

      hint: "Mide desde la cintura hasta el tobillo.",
    },
  ];

  return (
    <section
      id="guia-tallas-pantalones"
      className="p1-tallas-sec"
      style={{
        background: `linear-gradient(
            160deg,
            ${sec}14 0%,
            ${btn}0d 100%
          )`,
      }}
    >
      {/* HEADER */}

      <div className="p1-tallas-sec__header">
        <span
          className="p1-tallas-sec__tag"
          style={{
            color: titl,
            background: `${btn}18`,
          }}
        >
          👖 Medidas
        </span>

        <h2 className="p1-tallas-sec__titulo" style={{ color: titl }}>
          Guía de tallas para pantalones
        </h2>

        <p className="p1-tallas-sec__sub" style={{ color: `${txt}80` }}>
          Ingresa tus medidas y encuentra la talla de pantalón más adecuada.
        </p>
      </div>

      <div className="p1-tallas-sec__body">
        {/* PANEL IZQUIERDO */}

        <div className="p1-tallas-sec__sliders">
          {/* ADULTO / NIÑO */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "25px",
            }}
          >
            <button
              onClick={() => cambiarTipo("adulto")}
              style={{
                padding: "10px 18px",

                borderRadius: "10px",

                border: `1px solid ${sec}50`,

                background: tipo === "adulto" ? sec : `${sec}12`,

                color: tipo === "adulto" ? bg : sec,

                cursor: "pointer",

                fontWeight: 600,
              }}
            >
              🧑 Adulto
            </button>

            <button
              onClick={() => cambiarTipo("nino")}
              style={{
                padding: "10px 18px",

                borderRadius: "10px",

                border: `1px solid ${sec}50`,

                background: tipo === "nino" ? sec : `${sec}12`,

                color: tipo === "nino" ? bg : sec,

                cursor: "pointer",

                fontWeight: 600,
              }}
            >
              🧒 Niño
            </button>
          </div>

          {/* SLIDERS */}

          {sliders.map(({ label, emoji, val, set, hint }) => (
            <div key={label} className="p1-tallas-slider">
              <div className="p1-tallas-slider__top">
                <span
                  className="p1-tallas-slider__label"
                  style={{
                    color: titl,
                  }}
                >
                  {emoji} {label}
                </span>

                <span
                  className="p1-tallas-slider__val"
                  style={{
                    color: btn,
                  }}
                >
                  {val} cm
                </span>
              </div>

              <span
                className="p1-tallas-slider__hint"
                style={{
                  color: `${txt}55`,
                }}
              >
                {hint}
              </span>

              <div className="p1-tallas-range-wrap">
                <div
                  className="p1-tallas-range-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, pct(val)))}%`,

                    background: `linear-gradient(
                          to right,
                          ${sec},
                          ${btn}
                        )`,
                  }}
                />

                <input
                  type="range"
                  className="p1-tallas-range"
                  min={MIN}
                  max={MAX}
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  style={{
                    "--thumb-color": btn,
                  }}
                />

                <div className="p1-tallas-range-labels">
                  <span
                    style={{
                      color: `${txt}45`,
                    }}
                  >
                    {MIN} cm
                  </span>

                  <span
                    style={{
                      color: `${txt}45`,
                    }}
                  >
                    {MAX} cm
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* RESET */}

          <button
            className="p1-tallas-reset"
            style={{
              borderColor: `${sec}50`,

              color: sec,
            }}
            onClick={restablecer}
          >
            ↺ Restablecer valores
          </button>
        </div>

        {/* PANEL RESULTADO */}

        <div
          className="p1-tallas-sec__resultado"
          style={{
            border: `2px solid ${sec}30`,

            background: `${bg}cc`,
          }}
        >
          <p
            className="p1-tallas-res__pre"
            style={{
              color: `${txt}70`,
            }}
          >
            Tu talla recomendada es
          </p>

          {/* TALLA */}

          <div
            className="p1-tallas-res__talla"
            style={{
              color: titl,
            }}
          >
            {resultado}
          </div>

          {/* ESCALA */}

          <div className="p1-tallas-res__escala">
            {tabla.map((t, i) => (
              <div
                key={t.talla}
                className={`p1-tallas-res__dot ${
                  i === tallaidx ? "active" : ""
                }`}
                style={
                  i === tallaidx
                    ? {
                        background: sec,
                        color: bg,

                        boxShadow: `0 0 0 3px ${sec}40`,
                      }
                    : {
                        background: `${sec}22`,

                        color: `${titl}80`,
                      }
                }
              >
                {t.talla}
              </div>
            ))}
          </div>

          {/* NOTA */}

          <p
            className="p1-tallas-res__nota"
            style={{
              color: `${txt}55`,
            }}
          >
            Resultado basado en las medidas ingresadas.
            <br />
            Las tallas pueden variar ligeramente según la marca y el modelo.
          </p>

          {/* TABLA */}

          <div
            className="p1-tallas-tabla-scroll"
            style={{
              marginTop: "16px",
            }}
          >
            <table className="p1-tallas-tabla">
              <thead>
                <tr
                  style={{
                    background: `${sec}18`,
                  }}
                >
                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Talla
                  </th>

                  {tipo === "nino" && (
                    <th
                      style={{
                        color: titl,
                      }}
                    >
                      Edad aprox.
                    </th>
                  )}

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Cintura
                  </th>

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Cadera
                  </th>

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Largo
                  </th>
                </tr>
              </thead>

              <tbody>
                {tabla.map((t, i) => (
                  <tr
                    key={t.talla}
                    style={
                      i === tallaidx
                        ? {
                            background: `${sec}18`,
                          }
                        : {}
                    }
                  >
                    <td
                      style={{
                        color: titl,

                        fontWeight: i === tallaidx ? 800 : 600,
                      }}
                    >
                      {t.talla}

                      {i === tallaidx && " ✦"}
                    </td>

                    {tipo === "nino" && (
                      <td
                        style={{
                          color: txt,
                        }}
                      >
                        {t.edad}
                      </td>
                    )}

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {t.cintura[0]}–{t.cintura[1]}
                    </td>

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {t.cadera[0]}–{t.cadera[1]}
                    </td>

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {t.largo[0]}–{t.largo[1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeccionTallasPantalones;
