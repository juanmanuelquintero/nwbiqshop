function formatPrice(n) {
  if (n == null) return "";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

function ProductCard({ producto, estilos, abrirmodal }) {
  const btn = estilos?.color_botones ?? "#35a4ec";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";
  const sec = estilos?.color_secundario ?? "#2259d7";
  const bg = estilos?.color_principal ?? "#ffffff";

  const descuento = Number(producto.descuento ?? 0);
  const precio = Number(producto.precio ?? 0);
  const precioFinal =
    descuento > 0 ? precio - precio * (descuento / 100) : precio;

  const productoModal =
    descuento > 0
      ? {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          imagen: producto.imagen,
          tipo: producto.tipo,
          precio_original: precio,
          precio_final: precioFinal,
          descuento,
        }
      : {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          imagen: producto.imagen,
          tipo: producto.tipo,
          precio,
        };

  return (
    <div
      className="p1-card"
      onClick={() => abrirmodal(productoModal)}
      style={{
        "--c-btn": btn,
        "--c-sec": sec,
        "--c-bg": bg,
        borderTop: `5px solid ${sec}`,
      }}
    >
      <div
        className="p1-card__decoration"
        style={{
          border: `3px solid ${sec}`,
          boxShadow: `0px 0px 10px ${sec + "90"}`,
        }}
      />
      {/* Imagen */}
      <div
        className="p1-card__img-wrap"
        style={{
          background: `linear-gradient(160deg, ${sec}28 0%, ${sec + "40"} 100%)`,
        }}
      >
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="p1-card__img"
          />
        ) : (
          <div className="p1-card__img-ph">
            <span
              style={{ color: `${sec}60`, fontSize: "4rem", fontWeight: 900 }}
            >
              {producto.nombre?.[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {descuento > 0 && (
          <div className="p1-card__badge-desc">-{descuento}%</div>
        )}

        <div
          className="p1-card__img-overlay"
          style={{
            background: `linear-gradient(to top, ${sec + "70"} 0%, transparent 40%)`,
          }}
        />
        <div className="p1-card__img-overlay-decoration" />
        <div className="p1-card__img-bottom">
          <h3 className="p1-card__name-float" style={{ color: bg }}>
            {producto.nombre}
          </h3>
        </div>
      </div>

      {/* Descripción */}
      {producto.descripcion && (
        <div
          className="p1-card__desc-wrap"
          style={{ background: `${sec}10`, borderLeft: `3px solid ${sec}50` }}
        >
          <p className="p1-card__desc-text" style={{ color: txt }}>
            {producto.descripcion}
          </p>
        </div>
      )}

      {/* Precio + botón */}
      <div className="p1-card__footer">
        <div
          className="p1-card__precio-chip"
          style={{
            background: `linear-gradient(135deg, ${titl}, ${sec})`,
            boxShadow: `0 4px 16px ${sec}40`,
          }}
        >
          {descuento > 0 ? (
            <div className="p1-card__precio-inner">
              <span
                className="p1-card__precio-old"
                style={{ color: `${bg}70` }}
              >
                {formatPrice(precio)}
              </span>
              <span className="p1-card__precio-final" style={{ color: bg }}>
                {formatPrice(precioFinal)}
              </span>
            </div>
          ) : (
            <span className="p1-card__precio-final" style={{ color: bg }}>
              {formatPrice(precio)}
            </span>
          )}
        </div>

        <button
          className="p1-card__ver-btn"
          style={{ borderColor: "#00d719ff50", color: "#008102ff" }}
          onClick={(e) => {
            e.stopPropagation();
            abrirmodal(productoModal);
          }}
        >
          Ver detalle
          <span
            className="p1-card__ver-arrow"
            style={{ background: "#00df04ff", color: "white" }}
          >
            ›
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
