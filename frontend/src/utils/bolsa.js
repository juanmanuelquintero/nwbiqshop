export function consolidarBolsa(items) {
  if (!Array.isArray(items)) return [];

  const mapa = new Map();

  items.forEach((item) => {
    const clave = [
      item.producto_id,
      item.variante_id ?? null,
      item.talla_id ?? null,
    ].join(":");
    const existente = mapa.get(clave);

    if (existente) {
      existente.cantidad += Number(item.cantidad ?? 1);
      existente.precio_final =
        Number(existente.precio_unitario ?? 0) * existente.cantidad;
    } else {
      mapa.set(clave, {
        ...item,
        cantidad: Number(item.cantidad ?? 1),
        precio_final:
          Number(item.precio_unitario ?? 0) * Number(item.cantidad ?? 1),
      });
    }
  });

  return Array.from(mapa.values());
}
