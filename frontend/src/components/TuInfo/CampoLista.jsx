import { CAMPOS_NUMERICOS, ETIQUETAS } from "./TuInfoConfig";
import { useState } from "react";
import ModalInformacionInputs from "../InformacionInputs";

function InfoTrigger({ onClick }) {
  return (
    <button
      type="button"
      className="tu-info-trigger"
      onClick={onClick}
      aria-label="Ver información"
    >
      !
    </button>
  );
}

export default function CampoLista({ field, value, onChange }) {
  const [info, setInfo] = useState(null);
  if (field === "estado") {
    return (
      <label className="tu-info-status">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field, event.target.checked)}
        />
        <span className="tu-info-status__switch">
          <span />
        </span>
        <span>{value ? "Elemento activo" : "Elemento inactivo"}</span>
      </label>
    );
  }

  const esNumerico = CAMPOS_NUMERICOS.includes(field);
  const infoText = {
    descripcion:
      "Describe este aspecto de tu servicio con información clara y útil para tus clientes.",
    anos_experiencia:
      "Indica cuántos años llevas realizando esta actividad o prestando este servicio.",
    clientes_atendidos:
      "Registra una cantidad aproximada de clientes atendidos para respaldar tu experiencia.",
    calificacion_promedio:
      "Escribe tu calificación promedio en una escala de 0 a 5.",
  }[field];
  return (
    <div className="tu-info-list-field">
      <label>
        {ETIQUETAS[field] || field}
        {infoText && <InfoTrigger onClick={() => setInfo(infoText)} />}
      </label>
      {field === "descripcion" ? (
        <textarea
          value={value ?? ""}
          onChange={(event) => onChange(field, event.target.value)}
          placeholder="Escribe la información..."
          rows={4}
        />
      ) : (
        <input
          type={esNumerico ? "number" : "text"}
          value={value ?? ""}
          onChange={(event) => onChange(field, event.target.value)}
          placeholder={
            esNumerico
              ? "0"
              : `Escribe ${(ETIQUETAS[field] || field).toLowerCase()}`
          }
          min={esNumerico ? "0" : undefined}
          max={field === "calificacion_promedio" ? "5" : undefined}
          step={field === "calificacion_promedio" ? "0.1" : "1"}
        />
      )}
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </div>
  );
}
