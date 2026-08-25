import { useState } from "react";

const TABLA_TALLAS = [
  { talla: "XS",  pecho: [76, 80],  cintura: [58, 62],  cadera: [84, 88]  },
  { talla: "S",   pecho: [81, 85],  cintura: [63, 67],  cadera: [89, 93]  },
  { talla: "M",   pecho: [86, 90],  cintura: [68, 72],  cadera: [94, 98]  },
  { talla: "L",   pecho: [91, 96],  cintura: [73, 78],  cadera: [99, 104] },
  { talla: "XL",  pecho: [97, 102], cintura: [79, 84],  cadera: [105,110] },
  { talla: "2XL", pecho: [103,109], cintura: [85, 91],  cadera: [111,117] },
  { talla: "3XL", pecho: [110,116], cintura: [92, 98],  cadera: [118,124] },
];

const DEFAULTS = { pecho: 88, cintura: 70, cadera: 96 };
const MIN = 55, MAX = 130;

function calcularTalla(pecho, cintura, cadera) {
  const scores = TABLA_TALLAS.map((t) => ({
    talla: t.talla,
    dif:
      Math.abs(pecho   - (t.pecho[0]   + t.pecho[1])   / 2) +
      Math.abs(cintura - (t.cintura[0] + t.cintura[1]) / 2) +
      Math.abs(cadera  - (t.cadera[0]  + t.cadera[1])  / 2),
  }));
  return scores.sort((a, b) => a.dif - b.dif)[0].talla;
}

function SeccionTallas({ estilos }) {
  const bg   = estilos?.color_principal  ?? "#ffffff";
  const sec  = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color      ?? "#042d78";
  const txt  = estilos?.text_color       ?? "#242f43";
  const btn  = estilos?.color_botones    ?? "#35a4ec";

  const [pecho,   setPecho]   = useState(DEFAULTS.pecho);
  const [cintura, setCintura] = useState(DEFAULTS.cintura);
  const [cadera,  setCadera]  = useState(DEFAULTS.cadera);

  const resultado = calcularTalla(pecho, cintura, cadera);
  const tallaidx  = TABLA_TALLAS.findIndex((t) => t.talla === resultado);
  const pct       = (v) => ((v - MIN) / (MAX - MIN)) * 100;

  const restablecer = () => {
    setPecho(DEFAULTS.pecho);
    setCintura(DEFAULTS.cintura);
    setCadera(DEFAULTS.cadera);
  };

  const sliders = [
    { label: "Pecho / Busto", emoji: "🫁", val: pecho,   set: setPecho,   hint: "La parte más ancha del pecho" },
    { label: "Cintura",       emoji: "⌛", val: cintura, set: setCintura, hint: "La parte más estrecha del torso" },
    { label: "Cadera",        emoji: "🧍", val: cadera,  set: setCadera,  hint: "La parte más ancha de la cadera" },
  ];

  return (
    <section
      id="guia-tallas"
      className="p1-tallas-sec"
      style={{ background: `linear-gradient(160deg, ${sec}14 0%, ${btn}0d 100%)` }}
    >
      <div className="p1-tallas-sec__header">
        <span className="p1-tallas-sec__tag" style={{ color: titl, background: `${btn}18` }}>
          📐 Medidas
        </span>
        <h2 className="p1-tallas-sec__titulo" style={{ color: titl }}>Guía de tallas interactiva</h2>
        <p className="p1-tallas-sec__sub" style={{ color: `${txt}80` }}>
          Mueve los controles con tus medidas en cm y te decimos tu talla al instante.
        </p>
      </div>

      <div className="p1-tallas-sec__body">
        {/* Panel sliders */}
        <div className="p1-tallas-sec__sliders">
          {sliders.map(({ label, emoji, val, set, hint }) => (
            <div key={label} className="p1-tallas-slider">
              <div className="p1-tallas-slider__top">
                <span className="p1-tallas-slider__label" style={{ color: titl }}>{emoji} {label}</span>
                <span className="p1-tallas-slider__val" style={{ color: btn }}>{val} cm</span>
              </div>
              <span className="p1-tallas-slider__hint" style={{ color: `${txt}55` }}>{hint}</span>
              <div className="p1-tallas-range-wrap">
                <div
                  className="p1-tallas-range-fill"
                  style={{ width: `${pct(val)}%`, background: `linear-gradient(to right, ${sec}, ${btn})` }}
                />
                <input
                  type="range"
                  className="p1-tallas-range"
                  min={MIN} max={MAX} value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  style={{ "--thumb-color": btn }}
                />
                <div className="p1-tallas-range-labels">
                  <span style={{ color: `${txt}45` }}>{MIN} cm</span>
                  <span style={{ color: `${txt}45` }}>{MAX} cm</span>
                </div>
              </div>
            </div>
          ))}

          <button className="p1-tallas-reset" style={{ borderColor: `${sec}50`, color: sec }} onClick={restablecer}>
            ↺ Restablecer valores
          </button>
        </div>

        {/* Panel resultado */}
        <div className="p1-tallas-sec__resultado" style={{ border: `2px solid ${sec}30`, background: `${bg}cc` }}>
          <p className="p1-tallas-res__pre" style={{ color: `${txt}70` }}>Con tus medidas, tu talla es</p>
          <div className="p1-tallas-res__talla" style={{ color: titl }}>{resultado}</div>

          <div className="p1-tallas-res__escala">
            {TABLA_TALLAS.map((t, i) => (
              <div
                key={t.talla}
                className={`p1-tallas-res__dot ${i === tallaidx ? "active" : ""}`}
                style={i === tallaidx
                  ? { background: sec, color: bg, boxShadow: `0 0 0 3px ${sec}40` }
                  : { background: `${sec}22`, color: `${titl}80` }}
              >
                {t.talla}
              </div>
            ))}
          </div>

          <p className="p1-tallas-res__nota" style={{ color: `${txt}55` }}>
            Resultado en tiempo real basado en medidas estándar.<br />
            Si estás entre dos tallas, elige la mayor.
          </p>

          <div className="p1-tallas-tabla-scroll" style={{ marginTop: "16px" }}>
            <table className="p1-tallas-tabla">
              <thead>
                <tr style={{ background: `${sec}18` }}>
                  <th style={{ color: titl }}>Talla</th>
                  <th style={{ color: titl }}>Pecho</th>
                  <th style={{ color: titl }}>Cintura</th>
                  <th style={{ color: titl }}>Cadera</th>
                </tr>
              </thead>
              <tbody>
                {TABLA_TALLAS.map((t, i) => (
                  <tr key={t.talla} style={i === tallaidx ? { background: `${sec}18` } : {}}>
                    <td style={{ color: titl, fontWeight: i === tallaidx ? 800 : 600 }}>
                      {t.talla} {i === tallaidx && "✦"}
                    </td>
                    <td style={{ color: txt }}>{t.pecho[0]}–{t.pecho[1]}</td>
                    <td style={{ color: txt }}>{t.cintura[0]}–{t.cintura[1]}</td>
                    <td style={{ color: txt }}>{t.cadera[0]}–{t.cadera[1]}</td>
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
