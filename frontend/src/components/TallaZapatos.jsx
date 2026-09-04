import { useState } from "react";
import "../styles/componentes.css";

const TABLA_ADULTO = [
  { talla: 35, pie: [22.0, 22.6] },
  { talla: 36, pie: [22.7, 23.2] },
  { talla: 37, pie: [23.3, 23.9] },
  { talla: 38, pie: [24.0, 24.6] },
  { talla: 39, pie: [24.7, 25.2] },
  { talla: 40, pie: [25.3, 25.9] },
  { talla: 41, pie: [26.0, 26.6] },
  { talla: 42, pie: [26.7, 27.2] },
  { talla: 43, pie: [27.3, 27.9] },
  { talla: 44, pie: [28.0, 28.6] },
  { talla: 45, pie: [28.7, 29.3] },
  { talla: 46, pie: [29.4, 30.0] },
];

const TABLA_NINOS = [
  { talla: 16, pie: [9.5, 10.1] },
  { talla: 17, pie: [10.2, 10.8] },
  { talla: 18, pie: [10.9, 11.5] },
  { talla: 19, pie: [11.6, 12.2] },
  { talla: 20, pie: [12.3, 12.9] },
  { talla: 21, pie: [13.0, 13.6] },
  { talla: 22, pie: [13.7, 14.3] },
  { talla: 23, pie: [14.4, 15.0] },
  { talla: 24, pie: [15.1, 15.7] },
  { talla: 25, pie: [15.8, 16.4] },
  { talla: 26, pie: [16.5, 17.1] },
  { talla: 27, pie: [17.2, 17.8] },
  { talla: 28, pie: [17.9, 18.5] },
  { talla: 29, pie: [18.6, 19.2] },
  { talla: 30, pie: [19.3, 19.9] },
  { talla: 31, pie: [20.0, 20.6] },
  { talla: 32, pie: [20.7, 21.3] },
  { talla: 33, pie: [21.4, 22.0] },
  { talla: 34, pie: [22.1, 22.7] },
];

const DEFAULTS = {
  adulto: 25.0,
  nino: 16.0,
};

function calcularTalla(pie, tabla) {
  return tabla.reduce((mejor, actual) => {
    const centroActual = (actual.pie[0] + actual.pie[1]) / 2;
    const centroMejor = (mejor.pie[0] + mejor.pie[1]) / 2;

    return Math.abs(pie - centroActual) < Math.abs(pie - centroMejor)
      ? actual
      : mejor;
  });
}

function SeccionTallasCalzado({ estilos }) {
  const bg = estilos?.color_principal ?? "#ffffff";
  const sec = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";
  const btn = estilos?.color_botones ?? "#35a4ec";

  const [tipo, setTipo] = useState("adulto");
  const [pie, setPie] = useState(DEFAULTS.adulto);

  const tabla = tipo === "adulto" ? TABLA_ADULTO : TABLA_NINOS;

  const resultado = calcularTalla(pie, tabla);

  const MIN = tipo === "adulto" ? 21 : 9;
  const MAX = tipo === "adulto" ? 31 : 23;

  const pct = ((pie - MIN) / (MAX - MIN)) * 100;

  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);

    if (nuevoTipo === "adulto") {
      setPie(DEFAULTS.adulto);
    } else {
      setPie(DEFAULTS.nino);
    }
  };

  const restablecer = () => {
    setPie(tipo === "adulto" ? DEFAULTS.adulto : DEFAULTS.nino);
  };

  return (
    <section
      id="guia-tallas-calzado"
      className="p1-tallas-sec"
      style={{
        background: `linear-gradient(
          160deg,
          ${sec}14 0%,
          ${btn}0d 100%
        )`,
      }}
    >
      <div className="p1-tallas-sec__header">
        <span
          className="p1-tallas-sec__tag"
          style={{
            color: titl,
            background: `${btn}18`,
          }}
        >
          👟 Medidas
        </span>

        <h2 className="p1-tallas-sec__titulo" style={{ color: titl }}>
          Guía de tallas para calzado
        </h2>

        <p className="p1-tallas-sec__sub" style={{ color: `${txt}80` }}>
          Indica la longitud de tu pie y te recomendamos la talla más adecuada.
        </p>
      </div>

      <div className="p1-tallas-sec__body">
        {/* Selección adulto / niño */}

        <div className="p1-tallas-sec__sliders">
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
              }}
            >
              🧒 Niño
            </button>
          </div>

          {/* Slider */}

          <div className="p1-tallas-slider">
            <div className="p1-tallas-slider__top">
              <span className="p1-tallas-slider__label" style={{ color: titl }}>
                📏 Longitud del pie
              </span>

              <span className="p1-tallas-slider__val" style={{ color: btn }}>
                {pie.toFixed(1)} cm
              </span>
            </div>

            <span
              className="p1-tallas-slider__hint"
              style={{ color: `${txt}55` }}
            >
              Mide tu pie desde el talón hasta la punta del dedo más largo.
            </span>

            <div className="p1-tallas-range-wrap">
              <div
                className="p1-tallas-range-fill"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(to right, ${sec}, ${btn})`,
                }}
              />

              <input
                type="range"
                className="p1-tallas-range"
                min={MIN}
                max={MAX}
                step="0.1"
                value={pie}
                onChange={(e) => setPie(Number(e.target.value))}
                style={{
                  "--thumb-color": btn,
                }}
              />

              <div className="p1-tallas-range-labels">
                <span style={{ color: `${txt}45` }}>{MIN} cm</span>

                <span style={{ color: `${txt}45` }}>{MAX} cm</span>
              </div>
            </div>
          </div>

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

        {/* Resultado */}

        <div
          className="p1-tallas-sec__resultado"
          style={{
            border: `2px solid ${sec}30`,
            background: `${bg}cc`,
          }}
        >
          <p className="p1-tallas-res__pre" style={{ color: `${txt}70` }}>
            Talla recomendada
          </p>

          <div className="p1-tallas-res__talla" style={{ color: titl }}>
            {resultado.talla}
          </div>

          <p
            style={{
              color: `${txt}70`,
              textAlign: "center",
            }}
          >
            Para un pie de aproximadamente <strong>{pie.toFixed(1)} cm</strong>
          </p>

          <div className="p1-tallas-res__escala">
            {tabla.map((t) => (
              <div
                key={t.talla}
                className={`p1-tallas-res__dot ${
                  t.talla === resultado.talla ? "active" : ""
                }`}
                style={
                  t.talla === resultado.talla
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

          <p className="p1-tallas-res__nota" style={{ color: `${txt}55` }}>
            Esta recomendación es una referencia.
            <br />
            El ajuste puede variar según la marca y el modelo del calzado.
          </p>

          <div className="p1-tallas-tabla-scroll" style={{ marginTop: "16px" }}>
            <table className="p1-tallas-tabla">
              <thead>
                <tr
                  style={{
                    background: `${sec}18`,
                  }}
                >
                  <th style={{ color: titl }}>Talla</th>

                  <th style={{ color: titl }}>Pie</th>
                </tr>
              </thead>

              <tbody>
                {tabla.map((t) => (
                  <tr
                    key={t.talla}
                    style={
                      t.talla === resultado.talla
                        ? {
                            background: `${sec}18`,
                          }
                        : {}
                    }
                  >
                    <td
                      style={{
                        color: titl,
                        fontWeight: t.talla === resultado.talla ? 800 : 600,
                      }}
                    >
                      {t.talla}

                      {t.talla === resultado.talla && " ✦"}
                    </td>

                    <td style={{ color: txt }}>
                      {t.pie[0]}–{t.pie[1]} cm
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

export default SeccionTallasCalzado;
