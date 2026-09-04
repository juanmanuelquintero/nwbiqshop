import "../styles/componentes.css";

function formatPrice(n) {
  if (n == null) return "";
  return `$ ${Number(n).toLocaleString("es-CO")}`;
}

function CarritoPanel({
  estilos,
  items,
  onClose,
  onAbrirModal,
  estadoAlPorMayor = false,
  cantidadMinimaMayorista = 6,
}) {
  const bg = estilos?.color_principal ?? "#ffffff";
  const sec = estilos?.color_secundario ?? "#2259d7";
  const titl = estilos?.title_color ?? "#042d78";
  const txt = estilos?.text_color ?? "#242f43";
  const btn = estilos?.color_botones ?? "#35a4ec";

  const cantTotal = items.reduce((acc, i) => acc + (i.cantidad ?? 1), 0);
  const aplicaMayorista =
    estadoAlPorMayor && cantTotal >= cantidadMinimaMayorista;
  const itemsConPrecio = items.map((item) => {
    const original = Number(item.precio_original);
    const descuento = Number(item.descuento ?? 0);
    const normal = Number.isFinite(original)
      ? original * (1 - descuento / 100)
      : Number(item.precio_unitario ?? 0);
    const mayorista = Number(item.precio_alpormayor);
    return {
      ...item,
      precio_unitario:
        aplicaMayorista && Number.isFinite(mayorista) ? mayorista : normal,
    };
  });
  const totalActual = itemsConPrecio.reduce(
    (acc, i) => acc + i.precio_unitario * (i.cantidad ?? 1),
    0,
  );

  const eliminar = (idx) => {
    const nueva = items.filter((_, i) => i !== idx);
    localStorage.setItem("bolsa", JSON.stringify(nueva));
    onClose(nueva);
  };

  return (
    <div
      className="p1-cart-panel"
      style={{
        background: bg,
        borderColor: `${sec}30`,
        boxShadow: `0 8px 40px ${sec}30`,
      }}
    >
      <div
        className="p1-cart-panel__header"
        style={{ borderColor: `${sec}18` }}
      >
        <div className="p1-cart-panel__htitle">
          <span className="p1-cart-panel__hicon">🛒</span>
          <span style={{ color: titl, fontWeight: 800, fontSize: "1rem" }}>
            Mi bolsa
          </span>
          {cantTotal > 0 && (
            <span
              className="p1-cart-panel__badge"
              style={{ background: btn, color: titl }}
            >
              {cantTotal}
            </span>
          )}
        </div>
        <button
          className="p1-cart-panel__close"
          style={{ color: `${txt}60` }}
          onClick={() => onClose(null)}
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p1-cart-panel__empty">
          <span style={{ fontSize: "2.4rem" }}>🛍️</span>
          <p style={{ color: `${txt}70`, fontSize: "0.9rem" }}>
            Tu bolsa está vacía
          </p>
          <p style={{ color: `${txt}50`, fontSize: "0.8rem" }}>
            Agrega productos para continuar
          </p>
        </div>
      ) : (
        <>
          <ul className="p1-cart-panel__list">
            {itemsConPrecio.map((item, i) => (
              <li
                key={i}
                className="p1-cart-panel__item"
                style={{ borderColor: `${sec}15` }}
              >
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="p1-cart-panel__img"
                  />
                ) : (
                  <div
                    className="p1-cart-panel__img-ph"
                    style={{ background: `${sec}22`, color: btn }}
                  >
                    {item.nombre?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="p1-cart-panel__info">
                  <span
                    className="p1-cart-panel__nombre"
                    style={{ color: titl }}
                  >
                    {item.nombre}
                  </span>
                  <div className="p1-cart-panel__tags">
                    {item.talla && (
                      <span
                        className="p1-cart-panel__tag"
                        style={{ background: `${btn}18`, color: btn }}
                      >
                        {item.talla}
                      </span>
                    )}
                    {item.color && (
                      <span
                        className="p1-cart-panel__tag"
                        style={{ background: `${btn}18`, color: btn }}
                      >
                        {item.color}
                      </span>
                    )}
                    <span style={{ color: `${txt}60`, fontSize: "0.75rem" }}>
                      x{item.cantidad}
                    </span>
                    {aplicaMayorista && item.precio_alpormayor != null && (
                      <span
                        className="p1-cart-panel__tag"
                        style={{ background: `${btn}18`, color: btn }}
                      >
                        Mayorista
                      </span>
                    )}
                  </div>
                  <span
                    className="p1-cart-panel__subtotal"
                    style={{ color: titl }}
                  >
                    {formatPrice(item.precio_unitario * (item.cantidad ?? 1))}
                  </span>
                </div>
                <button
                  className="p1-cart-panel__del"
                  style={{ color: `${txt}40` }}
                  onClick={() => eliminar(i)}
                  title="Quitar"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div
            className="p1-cart-panel__footer"
            style={{ borderColor: `${sec}18` }}
          >
            <div className="p1-cart-panel__total-row">
              <span style={{ color: `${txt}80`, fontSize: "0.85rem" }}>
                Total ({cantTotal} {cantTotal === 1 ? "producto" : "productos"})
              </span>
              <span
                style={{ color: titl, fontWeight: 900, fontSize: "1.1rem" }}
              >
                {formatPrice(totalActual)}
              </span>
            </div>
            <button
              className="p1-cart-panel__cta"
              style={{
                background: `linear-gradient(135deg, ${btn}, ${sec})`,
                color: titl,
              }}
              onClick={onAbrirModal}
            >
              Ingresar a mi carrito →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CarritoPanel;
