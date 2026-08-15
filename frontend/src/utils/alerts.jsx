import "../styles/alerts.css";

export const mostrarAlerta = (state, text) => {
  const alerta = document.createElement("div");

  alerta.className = `nwbiq-alert nwbiq-alert-${state}`;

  const titulos = {
    success: "Éxito",
    error: "Error",
    info: "Información",
  };

  alerta.innerHTML = `
        <div class="nwbiq-alert-glow"></div>

        <div class="nwbiq-alert-content">

            <div class="nwbiq-alert-title">
                <span class="nwbiq-name">
                    NWBIQ<span>Shop</span>
                </span>

                <span class="nwbiq-alert-label">
                    Alerts
                </span>
            </div>

            <div class="nwbiq-alert-line"></div>

            <div class="nwbiq-alert-message">
                <h4>${titulos[state] || "Notificación"}</h4>
                <p>${text}</p>
            </div>

        </div>
    `;

  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.classList.add("nwbiq-alert-hide");

    setTimeout(() => {
      alerta.remove();
    }, 350);
  }, 3000);
};
