import { useState } from "react";
import "../styles/componentes.css";

/*
|--------------------------------------------------------------------------
| ANILLOS
|--------------------------------------------------------------------------
| Circunferencia aproximada del dedo en mm.
| La talla corresponde a una referencia de tallaje europeo.
*/

const TABLA_ANILLOS = [
  { talla: "6", dedo: [45.0, 46.5], diametro: 14.3 },
  { talla: "7", dedo: [46.6, 47.8], diametro: 15.0 },
  { talla: "8", dedo: [47.9, 49.0], diametro: 15.6 },
  { talla: "9", dedo: [49.1, 50.3], diametro: 16.0 },
  { talla: "10", dedo: [50.4, 51.5], diametro: 16.5 },
  { talla: "11", dedo: [51.6, 52.8], diametro: 16.9 },
  { talla: "12", dedo: [52.9, 54.0], diametro: 17.2 },
  { talla: "13", dedo: [54.1, 55.3], diametro: 17.8 },
  { talla: "14", dedo: [55.4, 56.6], diametro: 18.1 },
  { talla: "15", dedo: [56.7, 57.8], diametro: 18.5 },
  { talla: "16", dedo: [57.9, 59.1], diametro: 18.9 },
  { talla: "17", dedo: [59.2, 60.3], diametro: 19.4 },
  { talla: "18", dedo: [60.4, 61.6], diametro: 19.8 },
  { talla: "19", dedo: [61.7, 62.8], diametro: 20.1 },
  { talla: "20", dedo: [62.9, 64.0], diametro: 20.4 },
  { talla: "21", dedo: [64.1, 65.3], diametro: 20.8 },
  { talla: "22", dedo: [65.4, 66.5], diametro: 21.2 },
  { talla: "23", dedo: [66.6, 67.8], diametro: 21.6 },
  { talla: "24", dedo: [67.9, 69.0], diametro: 22.0 },
];

/*
|--------------------------------------------------------------------------
| COLLARES
|--------------------------------------------------------------------------
| Longitud total del collar en cm.
*/

const TABLA_COLLARES = [
  { talla: "Choker", longitud: [30, 36] },
  { talla: "Corto", longitud: [37, 42] },
  { talla: "Princesa", longitud: [43, 48] },
  { talla: "Matiné", longitud: [49, 55] },
  { talla: "Ópera", longitud: [56, 75] },
  { talla: "Largo", longitud: [76, 90] },
];

/*
|--------------------------------------------------------------------------
| PULSERAS / MANILLAS
|--------------------------------------------------------------------------
| Circunferencia de la muñeca en cm.
*/

const TABLA_PULSERAS = [
  { talla: "XS", muneca: [13, 14] },
  { talla: "S", muneca: [14, 15] },
  { talla: "M", muneca: [15, 17] },
  { talla: "L", muneca: [17, 19] },
  { talla: "XL", muneca: [19, 21] },
  { talla: "XXL", muneca: [21, 23] },
];

/*
|--------------------------------------------------------------------------
| TOBILLERAS
|--------------------------------------------------------------------------
*/

const TABLA_TOBILLERAS = [
  { talla: "XS", tobillo: [18, 19] },
  { talla: "S", tobillo: [19, 20] },
  { talla: "M", tobillo: [20, 22] },
  { talla: "L", tobillo: [22, 24] },
  { talla: "XL", tobillo: [24, 26] },
];

/*
|--------------------------------------------------------------------------
| VALORES INICIALES
|--------------------------------------------------------------------------
*/

const DEFAULTS = {
  anillo: 54,
  collar: 45,
  pulsera: 16,
  tobillera: 21,
};

/*
|--------------------------------------------------------------------------
| CALCULAR TALLA
|--------------------------------------------------------------------------
*/

function calcularTalla(valor, tabla, propiedad) {
  const scores = tabla.map((t) => {
    const rango = t[propiedad];

    const centro = (rango[0] + rango[1]) / 2;

    return {
      talla: t.talla,
      dif: Math.abs(valor - centro),
    };
  });

  return scores.sort((a, b) => a.dif - b.dif)[0].talla;
}

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

function SeccionTallasJoyeria({ estilos }) {
  const bg = estilos?.color_principal ?? "#ffffff";

  const sec = estilos?.color_secundario ?? "#2259d7";

  const titl = estilos?.title_color ?? "#042d78";

  const txt = estilos?.text_color ?? "#242f43";

  const btn = estilos?.color_botones ?? "#35a4ec";

  /*
  |--------------------------------------------------------------------------
  | TIPO DE JOYA
  |--------------------------------------------------------------------------
  */

  const [tipo, setTipo] = useState("anillo");

  /*
  |--------------------------------------------------------------------------
  | VALOR MEDIDO
  |--------------------------------------------------------------------------
  */

  const [valor, setValor] = useState(DEFAULTS.anillo);

  /*
  |--------------------------------------------------------------------------
  | CONFIGURACIÓN SEGÚN JOYA
  |--------------------------------------------------------------------------
  */

  const configuraciones = {
    anillo: {
      nombre: "Anillos",
      emoji: "💍",

      unidad: "mm",

      propiedad: "dedo",

      tabla: TABLA_ANILLOS,

      min: 44,

      max: 70,

      step: 0.1,

      label: "Circunferencia del dedo",

      hint: "Mide alrededor del dedo donde usarás el anillo.",

      descripcion: "Introduce la medida de la circunferencia de tu dedo.",
    },

    collar: {
      nombre: "Collares",
      emoji: "📿",

      unidad: "cm",

      propiedad: "longitud",

      tabla: TABLA_COLLARES,

      min: 28,

      max: 90,

      step: 1,

      label: "Longitud del collar",

      hint: "Mide desde un extremo del collar hasta el otro.",

      descripcion: "Selecciona la longitud aproximada que buscas.",
    },

    pulsera: {
      nombre: "Pulseras / Manillas",
      emoji: "📿",

      unidad: "cm",

      propiedad: "muneca",

      tabla: TABLA_PULSERAS,

      min: 12,

      max: 24,

      step: 0.5,

      label: "Circunferencia de la muñeca",

      hint: "Mide alrededor de tu muñeca sin apretar.",

      descripcion: "Introduce la medida de tu muñeca.",
    },

    tobillera: {
      nombre: "Tobilleras",
      emoji: "🦶",

      unidad: "cm",

      propiedad: "tobillo",

      tabla: TABLA_TOBILLERAS,

      min: 17,

      max: 27,

      step: 0.5,

      label: "Circunferencia del tobillo",

      hint: "Mide alrededor del tobillo donde usarás la joya.",

      descripcion: "Introduce la medida de tu tobillo.",
    },
  };

  const config = configuraciones[tipo];

  /*
  |--------------------------------------------------------------------------
  | TALLA RESULTANTE
  |--------------------------------------------------------------------------
  */

  const resultado = calcularTalla(valor, config.tabla, config.propiedad);

  const tallaidx = config.tabla.findIndex((t) => t.talla === resultado);

  /*
  |--------------------------------------------------------------------------
  | PORCENTAJE DEL SLIDER
  |--------------------------------------------------------------------------
  */

  const pct = ((valor - config.min) / (config.max - config.min)) * 100;

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR TIPO
  |--------------------------------------------------------------------------
  */

  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);

    setValor(DEFAULTS[nuevoTipo]);
  };

  /*
  |--------------------------------------------------------------------------
  | RESTABLECER
  |--------------------------------------------------------------------------
  */

  const restablecer = () => {
    setValor(DEFAULTS[tipo]);
  };

  return (
    <section
      id="guia-tallas-joyeria"
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
          💎 Medidas
        </span>

        <h2
          className="p1-tallas-sec__titulo"
          style={{
            color: titl,
          }}
        >
          Guía de medidas para joyería
        </h2>

        <p
          className="p1-tallas-sec__sub"
          style={{
            color: `${txt}80`,
          }}
        >
          Selecciona el tipo de joya e introduce tu medida para encontrar la
          opción más adecuada.
        </p>
      </div>

      <div className="p1-tallas-sec__body">
        {/* PANEL IZQUIERDO */}

        <div className="p1-tallas-sec__sliders">
          {/* SELECTOR DE JOYA */}

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "25px",
            }}
          >
            {Object.entries(configuraciones).map(([key, item]) => (
              <button
                key={key}
                onClick={() => cambiarTipo(key)}
                style={{
                  padding: "10px 15px",

                  borderRadius: "10px",

                  border: `1px solid ${sec}50`,

                  background: tipo === key ? sec : `${sec}12`,

                  color: tipo === key ? bg : sec,

                  cursor: "pointer",

                  fontWeight: 600,
                }}
              >
                {item.emoji} {item.nombre}
              </button>
            ))}
          </div>

          {/* INFORMACIÓN */}

          <div
            style={{
              marginBottom: "15px",
              color: `${txt}70`,
            }}
          >
            {config.descripcion}
          </div>

          {/* SLIDER */}

          <div className="p1-tallas-slider">
            <div className="p1-tallas-slider__top">
              <span
                className="p1-tallas-slider__label"
                style={{
                  color: titl,
                }}
              >
                📏 {config.label}
              </span>

              <span
                className="p1-tallas-slider__val"
                style={{
                  color: btn,
                }}
              >
                {valor} {config.unidad}
              </span>
            </div>

            <span
              className="p1-tallas-slider__hint"
              style={{
                color: `${txt}55`,
              }}
            >
              {config.hint}
            </span>

            <div className="p1-tallas-range-wrap">
              <div
                className="p1-tallas-range-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, pct))}%`,

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
                min={config.min}
                max={config.max}
                step={config.step}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
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
                  {config.min} {config.unidad}
                </span>

                <span
                  style={{
                    color: `${txt}45`,
                  }}
                >
                  {config.max} {config.unidad}
                </span>
              </div>
            </div>
          </div>

          {/* RESET */}

          <button
            className="p1-tallas-reset"
            style={{
              borderColor: `${sec}50`,

              color: sec,
            }}
            onClick={restablecer}
          >
            ↺ Restablecer valor
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
            Tu medida recomienda
          </p>

          <div
            className="p1-tallas-res__talla"
            style={{
              color: titl,
            }}
          >
            {resultado}
          </div>

          <p
            style={{
              textAlign: "center",
              color: `${txt}70`,
            }}
          >
            {config.nombre}
            {" · "}
            {valor} {config.unidad}
          </p>

          {/* ESCALA */}

          <div className="p1-tallas-res__escala">
            {config.tabla.map((t, i) => (
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
            Esta recomendación es orientativa.
            <br />
            El ajuste puede variar según el diseño y fabricante.
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

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Medida
                  </th>
                </tr>
              </thead>

              <tbody>
                {config.tabla.map((t, i) => {
                  const rango = t[config.propiedad];

                  return (
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

                      <td
                        style={{
                          color: txt,
                        }}
                      >
                        {rango[0]}–{rango[1]} {config.unidad}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeccionTallasJoyeria;
