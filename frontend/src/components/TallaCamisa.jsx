import { useState } from "react";
import "../styles/componentes.css";

/*
|--------------------------------------------------------------------------
| TALLAS ADULTO
|--------------------------------------------------------------------------
*/

const TABLA_ADULTO = [
  { talla: "XS", pecho: [76, 80], cintura: [58, 62], cadera: [84, 88] },
  { talla: "S", pecho: [81, 85], cintura: [63, 67], cadera: [89, 93] },
  { talla: "M", pecho: [86, 90], cintura: [68, 72], cadera: [94, 98] },
  { talla: "L", pecho: [91, 96], cintura: [73, 78], cadera: [99, 104] },
  { talla: "XL", pecho: [97, 102], cintura: [79, 84], cadera: [105, 110] },
  { talla: "2XL", pecho: [103, 109], cintura: [85, 91], cadera: [111, 117] },
  { talla: "3XL", pecho: [110, 116], cintura: [92, 98], cadera: [118, 124] },
];

/*
|--------------------------------------------------------------------------
| TALLAS NIÑOS
|--------------------------------------------------------------------------
| Medidas aproximadas en centímetros.
|
| En niños usamos principalmente la edad/talla como referencia,
| pero la recomendación se calcula con las medidas corporales.
|--------------------------------------------------------------------------
*/

const TABLA_NINOS = [
  {
    talla: "2",
    edad: "2 años",
    pecho: [51, 53],
    cintura: [49, 51],
    cadera: [52, 54],
  },

  {
    talla: "3-4",
    edad: "3–4 años",
    pecho: [54, 57],
    cintura: [51, 53],
    cadera: [55, 59],
  },

  {
    talla: "5-6",
    edad: "5–6 años",
    pecho: [58, 61],
    cintura: [53, 56],
    cadera: [60, 64],
  },

  {
    talla: "7-8",
    edad: "7–8 años",
    pecho: [62, 66],
    cintura: [57, 60],
    cadera: [65, 69],
  },

  {
    talla: "9-10",
    edad: "9–10 años",
    pecho: [67, 71],
    cintura: [61, 64],
    cadera: [70, 74],
  },

  {
    talla: "11-12",
    edad: "11–12 años",
    pecho: [72, 76],
    cintura: [65, 68],
    cadera: [75, 80],
  },

  {
    talla: "13-14",
    edad: "13–14 años",
    pecho: [77, 82],
    cintura: [69, 73],
    cadera: [81, 86],
  },
];

/*
|--------------------------------------------------------------------------
| VALORES INICIALES
|--------------------------------------------------------------------------
*/

const DEFAULTS_ADULTO = {
  pecho: 88,
  cintura: 70,
  cadera: 96,
};

const DEFAULTS_NINOS = {
  pecho: 62,
  cintura: 57,
  cadera: 65,
};

/*
|--------------------------------------------------------------------------
| RANGOS DE LOS SLIDERS
|--------------------------------------------------------------------------
*/

const RANGOS_ADULTO = {
  min: 55,
  max: 130,
};

const RANGOS_NINOS = {
  min: 45,
  max: 90,
};

/*
|--------------------------------------------------------------------------
| CALCULAR TALLA
|--------------------------------------------------------------------------
*/

function calcularTalla(pecho, cintura, cadera, tabla) {
  const scores = tabla.map((t) => ({
    talla: t.talla,

    dif:
      Math.abs(pecho - (t.pecho[0] + t.pecho[1]) / 2) +
      Math.abs(cintura - (t.cintura[0] + t.cintura[1]) / 2) +
      Math.abs(cadera - (t.cadera[0] + t.cadera[1]) / 2),
  }));

  return scores.sort((a, b) => a.dif - b.dif)[0].talla;
}

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

function SeccionTallas({ estilos }) {
  const bg = estilos?.color_principal ?? "#ffffff";

  const sec = estilos?.color_secundario ?? "#2259d7";

  const titl = estilos?.title_color ?? "#042d78";

  const txt = estilos?.text_color ?? "#242f43";

  const btn = estilos?.color_botones ?? "#35a4ec";

  /*
  |--------------------------------------------------------------------------
  | ADULTO / NIÑO
  |--------------------------------------------------------------------------
  */

  const [tipo, setTipo] = useState("adulto");

  /*
  |--------------------------------------------------------------------------
  | MEDIDAS
  |--------------------------------------------------------------------------
  */

  const [pecho, setPecho] = useState(DEFAULTS_ADULTO.pecho);

  const [cintura, setCintura] = useState(DEFAULTS_ADULTO.cintura);

  const [cadera, setCadera] = useState(DEFAULTS_ADULTO.cadera);

  /*
  |--------------------------------------------------------------------------
  | TABLA ACTUAL
  |--------------------------------------------------------------------------
  */

  const tabla = tipo === "adulto" ? TABLA_ADULTO : TABLA_NINOS;

  /*
  |--------------------------------------------------------------------------
  | RANGO ACTUAL
  |--------------------------------------------------------------------------
  */

  const rango = tipo === "adulto" ? RANGOS_ADULTO : RANGOS_NINOS;

  /*
  |--------------------------------------------------------------------------
  | RESULTADO
  |--------------------------------------------------------------------------
  */

  const resultado = calcularTalla(pecho, cintura, cadera, tabla);

  const tallaidx = tabla.findIndex((t) => t.talla === resultado);

  /*
  |--------------------------------------------------------------------------
  | PORCENTAJE SLIDER
  |--------------------------------------------------------------------------
  */

  const pct = (v) => {
    const porcentaje = ((v - rango.min) / (rango.max - rango.min)) * 100;

    return Math.min(100, Math.max(0, porcentaje));
  };

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR ADULTO / NIÑO
  |--------------------------------------------------------------------------
  */

  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);

    if (nuevoTipo === "adulto") {
      setPecho(DEFAULTS_ADULTO.pecho);

      setCintura(DEFAULTS_ADULTO.cintura);

      setCadera(DEFAULTS_ADULTO.cadera);
    } else {
      setPecho(DEFAULTS_NINOS.pecho);

      setCintura(DEFAULTS_NINOS.cintura);

      setCadera(DEFAULTS_NINOS.cadera);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESTABLECER
  |--------------------------------------------------------------------------
  */

  const restablecer = () => {
    if (tipo === "adulto") {
      setPecho(DEFAULTS_ADULTO.pecho);

      setCintura(DEFAULTS_ADULTO.cintura);

      setCadera(DEFAULTS_ADULTO.cadera);
    } else {
      setPecho(DEFAULTS_NINOS.pecho);

      setCintura(DEFAULTS_NINOS.cintura);

      setCadera(DEFAULTS_NINOS.cadera);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SLIDERS
  |--------------------------------------------------------------------------
  */

  const sliders = [
    {
      label: "Pecho / Busto",
      emoji: "🫁",
      val: pecho,
      set: setPecho,

      hint: "Mide alrededor de la parte más ancha del pecho",
    },

    {
      label: "Cintura",
      emoji: "⌛",
      val: cintura,
      set: setCintura,

      hint: "Mide alrededor de la parte más estrecha de la cintura",
    },

    {
      label: "Cadera",
      emoji: "🧍",
      val: cadera,
      set: setCadera,

      hint: "Mide alrededor de la parte más ancha de la cadera",
    },
  ];

  return (
    <section
      id="guia-tallas"
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
          📐 Medidas
        </span>

        <h2
          className="p1-tallas-sec__titulo"
          style={{
            color: titl,
          }}
        >
          Guía de tallas interactiva
        </h2>

        <p
          className="p1-tallas-sec__sub"
          style={{
            color: `${txt}80`,
          }}
        >
          Introduce las medidas en centímetros y encuentra la talla recomendada.
        </p>
      </div>

      <div className="p1-tallas-sec__body">
        {/* PANEL SLIDERS */}

        <div className="p1-tallas-sec__sliders">
          {/* SELECTOR ADULTO / NIÑO */}

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
                flex: 1,
                padding: "12px",
                borderRadius: "10px",

                border: `1px solid ${sec}50`,

                background: tipo === "adulto" ? sec : `${sec}12`,

                color: tipo === "adulto" ? bg : sec,

                cursor: "pointer",

                fontWeight: 700,
              }}
            >
              🧑 Adultos
            </button>

            <button
              onClick={() => cambiarTipo("ninos")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",

                border: `1px solid ${sec}50`,

                background: tipo === "ninos" ? sec : `${sec}12`,

                color: tipo === "ninos" ? bg : sec,

                cursor: "pointer",

                fontWeight: 700,
              }}
            >
              🧒 Niños
            </button>
          </div>

          {/* AVISO NIÑOS */}

          {tipo === "ninos" && (
            <div
              style={{
                padding: "12px 15px",
                marginBottom: "20px",

                borderRadius: "10px",

                background: `${sec}10`,

                color: `${txt}70`,

                fontSize: "14px",

                lineHeight: 1.5,
              }}
            >
              🧒 Las edades son una referencia. Para obtener una recomendación
              más precisa, utiliza las medidas del niño.
            </div>
          )}

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
                    width: `${pct(val)}%`,

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
                  min={rango.min}
                  max={rango.max}
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
                    {rango.min} cm
                  </span>

                  <span
                    style={{
                      color: `${txt}45`,
                    }}
                  >
                    {rango.max} cm
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

        {/* RESULTADO */}

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
            {tipo === "adulto"
              ? "Con tus medidas, tu talla es"
              : "Con las medidas del niño, la talla recomendada es"}
          </p>

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
            Resultado en tiempo real basado en medidas de referencia.
            <br />
            Si estás entre dos tallas, recomendamos elegir la mayor.
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

                  {tipo === "ninos" && (
                    <th
                      style={{
                        color: titl,
                      }}
                    >
                      Edad
                    </th>
                  )}

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Pecho
                  </th>

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

                    {tipo === "ninos" && (
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
                      {t.pecho[0]}–{t.pecho[1]}
                    </td>

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

export default SeccionTallas;
