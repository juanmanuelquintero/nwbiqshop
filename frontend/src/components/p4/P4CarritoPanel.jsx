import { useEffect, useState } from "react";

export default function P4CarritoPanel({
  fmtPrecio,
  cantMinima,
  onClose,
  onIrAlCarrito,
  estadoalpormaayor,
}) {
  const [items, setItems] = useState([]);

  // Leer bolsa al abrir
  useEffect(() => {
    try {
      const guardada = JSON.parse(localStorage.getItem("bolsa") ?? "[]");
      setItems(Array.isArray(guardada) ? guardada : []);
    } catch {
      setItems([]);
    }
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const totalUnidades = items.reduce((a, i) => a + Number(i.cantidad ?? 1), 0);
  const totalPrecio = items.reduce(
    (a, i) => a + Number(i.precio_final ?? 0),
    0,
  );

  const eliminarItem = (idx) => {
    setItems((prev) => {
      const nueva = prev.filter((_, i) => i !== idx);
      localStorage.setItem("bolsa", JSON.stringify(nueva));
      return nueva;
    });
  };

  const vaciarBolsa = () => {
    localStorage.setItem("bolsa", "[]");
    setItems([]);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="p4-carrito-overlay"
        role="presentation"
        onMouseDown={onClose}
      />

      {/* Panel lateral */}
      <aside
        className="p4-carrito-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Tu bolsa"
      >
        {/* ── Header ── */}
        <div className="p4-carrito-panel__header">
          <div className="p4-carrito-panel__title-row">
            <h2 className="p4-carrito-panel__title">Tu bolsa</h2>
            {totalUnidades > 0 && (
              <span className="p4-carrito-panel__count">
                {totalUnidades} uds
              </span>
            )}
          </div>
          <button
            type="button"
            className="p4-carrito-panel__close"
            onClick={onClose}
            aria-label="Cerrar bolsa"
          >
            ×
          </button>
        </div>

        {/* ── Lista ── */}
        <div className="p4-carrito-panel__body">
          {items.length === 0 ? (
            <div className="p4-carrito-panel__empty">
              <div className="p4-carrito-panel__empty-icon" aria-hidden="true">
                <div className="p4-carrito-empty-bag" />
              </div>
              <p>Tu bolsa está vacía.</p>
              <span>Agrega productos para verlos aquí.</span>
            </div>
          ) : (
            <ul className="p4-carrito-panel__list">
              {items.map((item, idx) => {
                const aplicaMayorista =
                  item.precio_alpormayor != null && totalUnidades >= cantMinima;
                return (
                  <li key={idx} className="p4-carrito-item">
                    {/* Imagen */}
                    <div className="p4-carrito-item__img-wrap">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="p4-carrito-item__img"
                        />
                      ) : (
                        <div className="p4-carrito-item__img-ph" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p4-carrito-item__info">
                      <span className="p4-carrito-item__nombre">
                        {item.nombre}
                      </span>

                      {/* Color y talla */}
                      <div className="p4-carrito-item__tags">
                        {item.color && (
                          <span className="p4-carrito-item__tag">
                            {item.color}
                          </span>
                        )}
                        {item.talla && (
                          <span className="p4-carrito-item__tag">
                            {item.talla}
                          </span>
                        )}
                        {estadoalpormaayor ? (
                          aplicaMayorista && (
                            <span className="p4-carrito-item__tag p4-carrito-item__tag--mayorista">
                              mayorista
                            </span>
                          )
                        ) : (
                          <></>
                        )}
                      </div>

                      {/* Precio unitario */}
                      <span className="p4-carrito-item__precio-unit">
                        {fmtPrecio(item.precio_unitario)} c/u
                      </span>

                      {/* Cantidad + subtotal */}
                      <div className="p4-carrito-item__qty-row">
                        <div className="p4-carrito-item__qty">
                          <span>{item.cantidad}</span>
                        </div>
                        <strong className="p4-carrito-item__subtotal">
                          {fmtPrecio(item.precio_final)}
                        </strong>
                      </div>
                    </div>

                    {/* Eliminar */}
                    <button
                      type="button"
                      className="p4-carrito-item__remove"
                      onClick={() => eliminarItem(idx)}
                      aria-label="Eliminar"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="p4-carrito-panel__footer">
            {/* Aviso mayorista */}
            {items.some((i) => i.precio_alpormayor != null) &&
              totalUnidades < cantMinima && (
                <div className="p4-carrito-panel__mayorista-hint">
                  <span className="p4-icon-heart-sm" aria-hidden="true" />
                  <span>
                    Agrega <strong>{cantMinima - totalUnidades} uds más</strong>{" "}
                    para activar el precio mayorista en todos los productos.
                  </span>
                </div>
              )}

            {/* Total */}
            <div className="p4-carrito-panel__total-row">
              <span>Total ({totalUnidades} uds)</span>
              <strong>{fmtPrecio(totalPrecio)}</strong>
            </div>

            <button
              type="button"
              className="p4-carrito-panel__ir-al-carrito"
              onClick={onIrAlCarrito}
            >
              Ir al carrito
            </button>

            {/* Botón vaciar */}
            <button
              type="button"
              className="p4-carrito-panel__vaciar"
              onClick={vaciarBolsa}
            >
              Vaciar bolsa
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
