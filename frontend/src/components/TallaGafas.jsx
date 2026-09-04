import { useState } from "react";
import "../styles/componentes.css";

/*
|--------------------------------------------------------------------------
| TABLA DE TAMAÑOS DE GAFAS
|--------------------------------------------------------------------------
| Medidas aproximadas de montura.
|
| anchoLente = ancho de cada lente
| puente      = distancia entre lentes
| varilla     = longitud de la patilla
|
| Todas las medidas están en milímetros.
*/

const TABLA_GAFAS = [
  {
    talla: "XS",
    anchoCara: [115, 124],
    anchoLente: [45, 48],
    puente: [15, 17],
    varilla: [130, 135],
  },

  {
    talla: "S",
    anchoCara: [125, 132],
    anchoLente: [49, 51],
    puente: [16, 18],
    varilla: [135, 140],
  },

  {
    talla: "M",
    anchoCara: [133, 140],
    anchoLente: [52, 54],
    puente: [17, 19],
    varilla: [138, 142],
  },

  {
    talla: "L",
    anchoCara: [141, 148],
    anchoLente: [55, 57],
    puente: [18, 20],
    varilla: [140, 145],
  },

  {
    talla: "XL",
    anchoCara: [149, 158],
    anchoLente: [58, 61],
    puente: [19, 22],
    varilla: [142, 150],
  },
];

const DEFAULTS = {
  anchoCara: 137,
};

/*
|--------------------------------------------------------------------------
| CALCULAR TALLA
|--------------------------------------------------------------------------
*/

function calcularTalla(anchoCara) {
  const scores = TABLA_GAFAS.map((gafa) => {
    const centro = (gafa.anchoCara[0] + gafa.anchoCara[1]) / 2;

    return {
      talla: gafa.talla,

      dif: Math.abs(anchoCara - centro),
    };
  });

  return scores.sort((a, b) => a.dif - b.dif)[0].talla;
}

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

function SeccionMedidasGafas({ estilos }) {
  const bg = estilos?.color_principal ?? "#ffffff";

  const sec = estilos?.color_secundario ?? "#2259d7";

  const titl = estilos?.title_color ?? "#042d78";

  const txt = estilos?.text_color ?? "#242f43";

  const btn = estilos?.color_botones ?? "#35a4ec";

  /*
  |--------------------------------------------------------------------------
  | ANCHO DE CARA
  |--------------------------------------------------------------------------
  */

  const [anchoCara, setAnchoCara] = useState(DEFAULTS.anchoCara);

  /*
  |--------------------------------------------------------------------------
  | RESULTADO
  |--------------------------------------------------------------------------
  */

  const resultado = calcularTalla(anchoCara);

  const tallaidx = TABLA_GAFAS.findIndex((gafa) => gafa.talla === resultado);

  /*
  |--------------------------------------------------------------------------
  | SLIDER
  |--------------------------------------------------------------------------
  */

  const MIN = 110;
  const MAX = 165;

  const pct = ((anchoCara - MIN) / (MAX - MIN)) * 100;

  /*
  |--------------------------------------------------------------------------
  | RESTABLECER
  |--------------------------------------------------------------------------
  */

  const restablecer = () => {
    setAnchoCara(DEFAULTS.anchoCara);
  };

  return (
    <section
      id="guia-medidas-gafas"
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
          👓 Medidas
        </span>

        <h2
          className="p1-tallas-sec__titulo"
          style={{
            color: titl,
          }}
        >
          Guía de medidas para gafas
        </h2>

        <p
          className="p1-tallas-sec__sub"
          style={{
            color: `${txt}80`,
          }}
        >
          Indica el ancho aproximado de tu cara y te recomendamos el tamaño de
          montura más adecuado.
        </p>
      </div>

      <div className="p1-tallas-sec__body">
        {/* PANEL SLIDER */}

        <div className="p1-tallas-sec__sliders">
          <div className="p1-tallas-slider">
            <div className="p1-tallas-slider__top">
              <span
                className="p1-tallas-slider__label"
                style={{
                  color: titl,
                }}
              >
                📏 Ancho de cara
              </span>

              <span
                className="p1-tallas-slider__val"
                style={{
                  color: btn,
                }}
              >
                {anchoCara} mm
              </span>
            </div>

            <span
              className="p1-tallas-slider__hint"
              style={{
                color: `${txt}55`,
              }}
            >
              Mide la distancia entre los dos lados de tu cara, aproximadamente
              a la altura de los ojos.
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
                min={MIN}
                max={MAX}
                value={anchoCara}
                onChange={(e) => setAnchoCara(Number(e.target.value))}
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
                  {MIN} mm
                </span>

                <span
                  style={{
                    color: `${txt}45`,
                  }}
                >
                  {MAX} mm
                </span>
              </div>
            </div>
          </div>

          {/* CONSEJO */}

          <div
            style={{
              marginTop: "20px",

              padding: "15px",

              borderRadius: "12px",

              background: `${sec}10`,

              color: `${txt}75`,

              lineHeight: 1.5,
            }}
          >
            💡 <strong>Consejo:</strong> Si ya tienes unas gafas que te quedan
            bien, revisa el interior de una de las varillas.
            <br />
            Normalmente encontrarás tres números, por ejemplo:
            <br />
            <strong>52 □ 18 - 140</strong>
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
            Tamaño de montura recomendado
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
            Para un ancho de cara de <strong>{anchoCara} mm</strong>
          </p>

          {/* ESCALA */}

          <div className="p1-tallas-res__escala">
            {TABLA_GAFAS.map((gafa, i) => (
              <div
                key={gafa.talla}
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
                {gafa.talla}
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
            La recomendación es orientativa.
            <br />
            El ajuste puede variar según la forma de la montura y el fabricante.
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
                    Tamaño
                  </th>

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Cara
                  </th>

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Lente
                  </th>

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Puente
                  </th>

                  <th
                    style={{
                      color: titl,
                    }}
                  >
                    Varilla
                  </th>
                </tr>
              </thead>

              <tbody>
                {TABLA_GAFAS.map((gafa, i) => (
                  <tr
                    key={gafa.talla}
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
                      {gafa.talla}

                      {i === tallaidx && " ✦"}
                    </td>

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {gafa.anchoCara[0]}–{gafa.anchoCara[1]} mm
                    </td>

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {gafa.anchoLente[0]}–{gafa.anchoLente[1]} mm
                    </td>

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {gafa.puente[0]}–{gafa.puente[1]} mm
                    </td>

                    <td
                      style={{
                        color: txt,
                      }}
                    >
                      {gafa.varilla[0]}–{gafa.varilla[1]} mm
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

export default SeccionMedidasGafas;
