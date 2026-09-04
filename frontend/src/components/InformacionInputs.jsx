import "../styles/modalinputs.css";

function ModalInformacionInputs({ text, setmodal }) {
  return (
    <div
      className="contenedor-modal-informacion-inputs"
      onClick={() => setmodal(false)}
    >
      <div className="modal-informacion" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn-cerrar-modal-info"
          onClick={() => setmodal(false)}
        >
          ×
        </button>

        <div className="icono-informacion">i</div>

        <h3>Información</h3>

        <p>{text}</p>

        <button className="btn-entendido" onClick={() => setmodal(false)}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export default ModalInformacionInputs;
