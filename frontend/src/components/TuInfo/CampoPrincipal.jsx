import { CAMPOS_TU_INFO } from "./TuInfoConfig";
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

export default function CampoPrincipal({ field, value, onChange }) {
  const [info, setInfo] = useState(null);
  const esTextoLargo = field === "sobre_mi";
  const esCorreo = field === "correo";
  const esTelefono = field === "numero_telefono";
  const label = CAMPOS_TU_INFO.find(([key]) => key === field)?.[1];

  return (
    <div
      className={`tu-info-field ${esTextoLargo ? "tu-info-field--full" : ""}`}
    >
      <label htmlFor={`tu-info-${field}`}>
        {label}
        <span className="tu-info-required">*</span>
        {(field === "nombre_completo" ||
          field === "dedicacion" ||
          esTextoLargo) && (
          <InfoTrigger
            onClick={() =>
              setInfo(
                field === "nombre_completo"
                  ? "Escribe el nombre que quieres mostrar públicamente en tu perfil profesional."
                  : field === "dedicacion"
                    ? "Indica a qué te dedicas o cuál es el servicio principal que ofreces."
                    : "Cuenta quién eres, qué haces y qué pueden esperar tus clientes al trabajar contigo.",
              )
            }
          />
        )}
      </label>
      {esTextoLargo ? (
        <textarea
          id={`tu-info-${field}`}
          value={value ?? ""}
          onChange={(event) => onChange(field, event.target.value)}
          placeholder="Escribe una breve presentación sobre ti..."
          rows={5}
        />
      ) : (
        <input
          id={`tu-info-${field}`}
          type={esCorreo ? "email" : esTelefono ? "tel" : "text"}
          value={value ?? ""}
          onChange={(event) => onChange(field, event.target.value)}
          placeholder={`Ingresa tu ${label.toLowerCase()}`}
        />
      )}
      {info && <ModalInformacionInputs text={info} setmodal={setInfo} />}
    </div>
  );
}
