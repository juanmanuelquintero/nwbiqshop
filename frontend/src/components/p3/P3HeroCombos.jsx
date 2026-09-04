import { useState, useEffect, useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "./P3Icons";

/* ════════════════════════════════════════
   P3HeroCombos — slider de combos
   Props:
     combos          — array de combos de la tienda
     formatearPrecio — función de formato de precio
════════════════════════════════════════ */
export default function P3HeroCombos({ combos, formatearPrecio }) {
  const [comboActivo, setComboActivo] = useState(0);
  const intervalRef = useRef(null);

  const avanzar    = () => setComboActivo((p) => (p + 1) % combos.length);
  const retroceder = () => setComboActivo((p) => (p - 1 + combos.length) % combos.length);

  useEffect(() => {
    if (combos.length <= 1) return;
    intervalRef.current = setInterval(avanzar, 5000);
    return () => clearInterval(intervalRef.current);
  }, [combos.length]);

  const irA = (idx) => {
    clearInterval(intervalRef.current);
    setComboActivo(idx);
    if (combos.length > 1)
      intervalRef.current = setInterval(avanzar, 5000);
  };

  if (!combos.length) return null;

  return (
    <section className="p3-hero" aria-label="Combos destacados">
      <div className="p3-hero__slider">

        {combos.map((combo, idx) => {
          const valorNormal = (combo.alimentos ?? []).reduce(
            (total, a) => total + Number(a.precio ?? 0) * Number(a.cantidad ?? 1),
            0,
          );
          const ahorro = valorNormal - Number(combo.precio ?? 0);
          const totalArticulos = (combo.alimentos ?? []).reduce(
            (total, a) => total + Number(a.cantidad ?? 1),
            0,
          );

          return (
            <div
              key={combo.id}
              className={`p3-hero__slide${comboActivo === idx ? " p3-hero__slide--active" : ""}`}
              aria-hidden={comboActivo !== idx}
            >
              <article
                className={`p3-combo-card${combo.alimentos?.length ? "" : " p3-combo-card--without-products"}`}
              >
                {/* Información principal */}
                <div className="p3-combo-card__content">
                  <span className="p3-combo-card__eyebrow">Combo especial</span>
                  <h1 className="p3-combo-card__title">{combo.nombre}</h1>
                  {combo.descripcion && (
                    <p className="p3-combo-card__description">{combo.descripcion}</p>
                  )}
                  <p className="p3-combo-card__price">
                    {formatearPrecio(combo.precio)}
                  </p>
                  <span className="p3-combo-card__items">
                    {totalArticulos} artículos incluidos
                  </span>
                  <button type="button" className="p3-combo-card__details-btn">
                    Ver detalles
                  </button>
                </div>

                {/* Lista de alimentos del combo */}
                {combo.alimentos?.length > 0 && (
                  <div
                    className="p3-combo-card__included"
                    aria-label={`Productos del ${combo.nombre}`}
                  >
                    <span className="p3-combo-card__included-title">
                      Este combo incluye
                    </span>
                    <ul className="p3-combo-card__product-list">
                      {combo.alimentos.map((alimento) => (
                        <li key={alimento.alimento_id}>
                          <span>
                            {alimento.nombre}
                            {Number(alimento.cantidad ?? 1) > 1 &&
                              ` ×${alimento.cantidad}`}
                          </span>
                          <strong>{formatearPrecio(alimento.precio)}</strong>
                        </li>
                      ))}
                    </ul>
                    {ahorro > 0 && (
                      <span className="p3-combo-card__saving">
                        Ahorras {formatearPrecio(ahorro)}
                      </span>
                    )}
                  </div>
                )}
              </article>
            </div>
          );
        })}

        {/* Flechas de navegación */}
        {combos.length > 1 && (
          <>
            <button
              type="button"
              className="p3-hero__arrow p3-hero__arrow--prev"
              onClick={retroceder}
              aria-label="Combo anterior"
            >
              <IconChevronLeft />
            </button>
            <button
              type="button"
              className="p3-hero__arrow p3-hero__arrow--next"
              onClick={avanzar}
              aria-label="Combo siguiente"
            >
              <IconChevronRight />
            </button>
          </>
        )}

        {/* Dots */}
        {combos.length > 1 && (
          <div
            className="p3-hero__dots"
            role="tablist"
            aria-label="Navegación de combos"
          >
            {combos.map((combo, idx) => (
              <button
                key={combo.id}
                type="button"
                role="tab"
                aria-selected={comboActivo === idx}
                aria-label={`Ver ${combo.nombre}`}
                className={`p3-hero__dot${comboActivo === idx ? " p3-hero__dot--active" : ""}`}
                onClick={() => irA(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
