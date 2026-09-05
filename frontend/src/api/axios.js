import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const TraerEstilosDominio = async (dominio) => {
  const res = await api.get(`/traer-estilos-dominio/${dominio}`);
  return res;
};

export const validarUsuario = async (correo, contraseña) => {
  const response = await api.post("/validar-usuario", {
    correo: correo,
    contraseña: contraseña,
  });

  return response;
};

export default api;

export const Crearcuenta = async (datos) => {
  const res = await api.post("/crear-cuenta", datos);

  return res;
};

export const TraerTienda = async (user) => {
  const res = await api.get(`/traer-tienda/${user}`);
  return res;
};

export const TraerNotificaciones = async (id_usuario) => {
  const res = await api.get("/traer-notificaciones", {
    params: { id_usuario },
  });
  return res;
};

export const TraerTiendaCliente = async (dominio) => {
  const res = await api.get(`/traer-tienda-dominio/${dominio}`);
  return res;
};

export const TraerProductos = async (user) => {
  const res = await api.get(`/traer-producto/${user}`);
  return res;
};

export const TraerVariantes = async (id_producto, id_usuario) => {
  const res = await api.get(`/traer-variantes/${id_producto}/${id_usuario}`);
  return res;
};

export const CrearProducto = async (datos) => {
  // datos es un FormData con los campos + imagen opcional
  const res = await api.post("/crear-producto", datos, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const AgregarVariante = async (producto_id, datos) => {
  // datos es un FormData — agrega un nuevo COLOR al producto
  const res = await api.post(`/agregar-color/${producto_id}`, datos, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const AgregarTalla = async (datos) => {
  // datos: { id_usuario, id_color, talla, cantidad }
  const res = await api.post("/agregar-talla", datos);
  return res;
};

export const ModificarColor = async (datos) => {
  // datos es un FormData — modifica color/marca/referencia/imagen de un ProductoColores
  const res = await api.post("/modificar-color", datos, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const ModificarVariante = async (datos) => {
  // datos: { id_usuario, id, talla?, cantidad? }
  const res = await api.post("/modificar-variante", datos);
  return res;
};

export const ModificarSimple = async (datos) => {
  // datos es un FormData
  const res = await api.post("/modificar-simple", datos, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const EliminarColor = async (id_color, id_usuario) => {
  const res = await api.delete(`/eliminar-color/${id_color}`, {
    params: { id_usuario },
  });
  return res;
};

export const ActualizarProducto = async (id, datos) => {
  // datos debe incluir id_usuario
  const res = await api.put(`/actualizar-producto/${id}`, datos);
  return res;
};

export const CambiarEstadoProducto = async (id, id_usuario) => {
  const res = await api.patch(`/cambiar-estado-producto/${id}`, { id_usuario });
  return res;
};

/* ══════════════════════════════════════════
   Colecciones
══════════════════════════════════════════ */
export const TraerColecciones = async (id_usuario) => {
  const res = await api.get(`/traer-coleccion/${id_usuario}`);
  return res;
};

export const CrearColeccion = async (datos) => {
  const res = await api.post("/crear-coleccion", datos);
  return res;
};

export const ModificarColeccion = async (datos) => {
  const res = await api.patch("/modificar-coleccion", datos);
  return res;
};

export const TraerProductosColeccion = async (datos) => {
  const res = await api.post("/productos-coleccion", datos);
  return res;
};

export const AgregarProductosColeccion = async (datos) => {
  const res = await api.post("/agregar-coleccion", datos);
  return res;
};

export const EliminarProductoColeccion = async (datos) => {
  const res = await api.delete("/eliminar-coleccion", { data: datos });
  return res;
};

export const CambiarEstadoColeccion = async (datos) => {
  const res = await api.patch("/cambiar-estado-coleccion", datos);
  return res;
};

export const EliminarColeccion = async (datos) => {
  const res = await api.delete("/eliminar-las-colecciones", {
    data: datos,
  });

  return res;
};

/* ══════════════════════════════════════════
   Estilos de la tienda
══════════════════════════════════════════ */ export const TraerEstilos =
  async (id_usuario) => {
    const res = await api.get(`/traer-estilos/${id_usuario}`);
    return res;
  };

export const ModificarEstilos = async (datos) => {
  // datos debe incluir id_usuario + campos opcionales de color
  const res = await api.post("/modificar-estilos", datos);
  return res;
};

/* ══════════════════════════════════════════
   Opciones — Usuario y Tienda
══════════════════════════════════════════ */
export const TraerUsuario = async (cedula) => {
  const res = await api.get(`/traer-usuario/${cedula}`);
  return res;
};

export const ModificarUsuario = async (datos) => {
  // datos: { id_usuario, nombres?, apellidos?, ciudad?, direccion?, correo?, telefono?, fecha_nacimieno? }
  const res = await api.patch("/modificar-usuario", datos);
  return res;
};

export const CambiarContrasena = async (datos) => {
  // datos: { id_usuario, contraseña, contraseñanueva }
  const res = await api.post("/cambiar-contraseña", datos);
  return res;
};

export const ModificarTienda = async (datos) => {
  // datos: { id_usuario, nombre?, dominio?, descripcion?, ... }
  const res = await api.patch("/modificar-tienda", datos);
  return res;
};

/* ══════════════════════════════════════════
   Promociones
══════════════════════════════════════════ */
export const TraerPromocion = async (id_usuario) => {
  const res = await api.get(`/traer-promocion/${id_usuario}`);
  return res;
};

export const TraerProductosPromocion = async (id_usuario) => {
  const res = await api.get(`/traer-productos-promocion/${id_usuario}`);
  return res;
};

export const TraerPromocionUnitaria = async (id_usuario) => {
  const res = await api.get(`/traer-promocion-unitaria/${id_usuario}`);
  return res;
};

export const ModificarPromocion = async (datos) => {
  const res = await api.patch("/modificar-promocion", datos);
  return res;
};

export const ModificarPromocionUnitaria = async (datos) => {
  const res = await api.patch("/modificar-promocion-unitaria", datos);
  return res;
};

export const AsignarProductosPromocion = async (datos) => {
  const res = await api.post("/asignar-productos-promocion", datos);
  return res;
};

export const EliminarProductoPromocion = async (datos) => {
  const res = await api.delete("/eliminar-productos-promocion", {
    data: datos,
  });
  return res;
};

export const CambiarEstadoPromocion = async (id_usuario) => {
  const res = await api.post(`/cambiar-estado-promocion/${id_usuario}`);
  return res;
};

export const CambiarEstadoPromocionUnitaria = async (datos) => {
  const res = await api.post("/cambiar-estado-promocion-unitaria", datos);
  return res;
};

export const CrearPromocionUnitaria = async (datos) => {
  const res = await api.post("/crear-promocion-unitaria", datos);
  return res;
};

/* ══════════════════════════════════════════
   Pedidos
══════════════════════════════════════════ */
export const TraerPedidos = async (id_usuario) => {
  const res = await api.get(`/traer-pedidos/${id_usuario}`);
  return res;
};

export const VerDetallePedido = async (datos) => {
  // datos: { id_usuario, id_pedido }
  const res = await api.post("/ver-detalle-pedido", datos);
  return res;
};

export const CambiarEstadoPedido = async (datos) => {
  // datos: { id_usuario, id_pedido, estado }
  const res = await api.post("/cambiar-estado-pedido", datos);
  return res;
};

export const AsignarNumeroGuia = async (datos) => {
  // datos: { id_usuario, id_pedido, numeroguia }
  const res = await api.post("/asignar-guia", datos);
  return res;
};

export const BuscarPedidos = async (datos) => {
  // datos: { correo: str | None, telefono: str | None }
  const res = await api.post("/buscar-pedidos", datos);
  return res;
};

export const BuscarPedidosCliente = async (datos) => {
  // datos: { correo: str | None, telefono: str | None }
  const res = await api.post("/buscar-pedidos", datos);
  return res;
};

export const TraerProductosPedido = async (id_pedido) => {
  const res = await api.get(`/traer-productos-pedido/${id_pedido}`);
  return res;
};

/*══════════════════════════════════════════
  Productos cliente
  ══════════════════════════════════════════*/

export const MirarVariantes = async (idproducto) => {
  const res = await api.get(`/mirar-producto-variantes/${idproducto}`);
  return res;
};

export const TraerProductosDominio = async (dominio) => {
  const res = await api.get(`/traer-productos-dominio/${dominio}`);
  return res;
};

export const EliminarVariante = async (variante_id, id_usuario) => {
  const res = await api.delete(`/eliminar-variante/${variante_id}`, {
    params: { id_usuario },
  });
  return res;
};

export const HacerPedido = async (datos) => {
  // datos: { dominio, productos: [{producto_id, id_variante, tipo, cantidad}], correo }
  const res = await api.post("/hacer-pedido", datos);
  return res;
};

/* ══════════════════════════════════════════
   Alimentos
══════════════════════════════════════════ */
export const CrearAlimento = async (datos) => {
  // datos puede incluir: id_usuario, nombre, precio, descripcion,
  // tiempo_preparacion, disponible, ingredientes (array), imagenFile (File)
  const fd = new FormData();
  fd.append("id_usuario", datos.id_usuario);
  fd.append("nombre", datos.nombre);
  fd.append("precio", datos.precio);
  if (datos.descripcion != null) fd.append("descripcion", datos.descripcion);
  if (datos.tiempo_preparacion != null)
    fd.append("tiempo_preparacion", datos.tiempo_preparacion);
  fd.append("disponible", datos.disponible ?? true);
  fd.append("ingredientes", JSON.stringify(datos.ingredientes ?? []));
  if (datos.imagenFile instanceof File) fd.append("imagen", datos.imagenFile);
  const res = await api.post("/crear-alimentos", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const TraerAlimentos = async (id_usuario) => {
  const res = await api.get(`/traer-alimentos/${id_usuario}`);
  return res;
};

export const TraerAlimentoPublico = async (id_alimento) => {
  // Endpoint público — retorna el alimento con sus ingredientes
  const res = await api.get(`/alimento/${id_alimento}`);
  return res;
};

export const ModificarAlimento = async (id_alimento, datos) => {
  // datos puede incluir: id_usuario, nombre, precio, descripcion,
  // tiempo_preparacion, disponible, imagenFile (File), imagen_borrada ("1")
  const fd = new FormData();
  fd.append("id_usuario", datos.id_usuario);
  if (datos.nombre != null) fd.append("nombre", datos.nombre);
  if (datos.descripcion != null) fd.append("descripcion", datos.descripcion);
  if (datos.precio != null) fd.append("precio", datos.precio);
  if (datos.tiempo_preparacion != null)
    fd.append("tiempo_preparacion", datos.tiempo_preparacion);
  if (datos.disponible != null) fd.append("disponible", datos.disponible);
  if (datos.imagenFile instanceof File) {
    fd.append("imagen", datos.imagenFile);
  } else if (datos.imagen_borrada === "1") {
    fd.append("imagen_borrada", "1");
  }
  const res = await api.put(`/modificar-alimentos/${id_alimento}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const CambiarEstadoAlimento = async (id_alimento, datos) => {
  // datos: { id_usuario, estado }
  const res = await api.patch(`/estado-alimento/${id_alimento}`, datos);
  return res;
};

export const ModificarIngrediente = async (id_ingrediente, datos) => {
  // datos: IngredienteUpdate — incluye id_usuario + campos opcionales
  const res = await api.patch(`/ingredientes/${id_ingrediente}`, datos);
  return res;
};

/* ══════════════════════════════════════════
   Colecciones de Alimentos
══════════════════════════════════════════ */
export const CrearColeccionAlimentos = async (datos) => {
  // datos: { id_usuario, titulo, descripcion?, alimento_ids? }
  const res = await api.post("/colecciones-alimentos/crear", datos);
  return res;
};

export const TraerColeccionesAlimentos = async (id_usuario) => {
  const res = await api.get(`/colecciones-alimentos/traer/${id_usuario}`);
  return res;
};

export const TraerItemsColeccionAlimentos = async (datos) => {
  // datos: { id_usuario, coleccion_id }
  const res = await api.post("/colecciones-alimentos/items", datos);
  return res;
};

export const AgregarAlimentosColeccion = async (datos) => {
  // datos: { id_usuario, coleccion_id, alimento_ids }
  const res = await api.post("/colecciones-alimentos/agregar-alimentos", datos);
  return res;
};

export const QuitarAlimentoColeccion = async (datos) => {
  // datos: { id_usuario, coleccion_id, alimento_id }
  const res = await api.delete("/colecciones-alimentos/quitar-alimento", {
    data: datos,
  });
  return res;
};

export const ActualizarColeccionAlimentos = async (datos) => {
  // datos: { id_usuario, id, titulo?, descripcion? }
  const res = await api.patch("/colecciones-alimentos/actualizar", datos);
  return res;
};

export const CambiarEstadoColeccionAlimentos = async (datos) => {
  // datos: { id_usuario, id }
  const res = await api.patch("/colecciones-alimentos/estado", datos);
  return res;
};

export const EliminarColeccionAlimentos = async (datos) => {
  // datos: { id_usuario, id }
  const res = await api.delete("/colecciones-alimentos/eliminar", {
    data: datos,
  });
  return res;
};

/* ══════════════════════════════════════════
   Pedidos de Alimentos
══════════════════════════════════════════ */
export const TraerPedidosAlimentos = async (id_usuario) => {
  const res = await api.get(`/pedidos-alimentos/traer/${id_usuario}`);
  return res;
};

export const VerDetallePedidoAlimento = async (datos) => {
  // datos: { id_usuario, pedido_id }
  const res = await api.post("/pedidos-alimentos/detalle", datos);
  return res;
};

export const CambiarEstadoPedidoAlimento = async (datos) => {
  // datos: { id_usuario, pedido_id, estado }
  const res = await api.patch("/pedidos-alimentos/estado", datos);
  return res;
};

/* ══════════════════════════════════════════
   Combos
══════════════════════════════════════════ */
export const CrearCombo = async (datos) => {
  // datos: { id_usuario, nombre, descripcion?, precio, alimentos?: [{alimento_id, cantidad}] }
  const res = await api.post("/combos/crear", datos);
  return res;
};

export const TraerCombos = async (id_usuario) => {
  const res = await api.get(`/combos/traer/${id_usuario}`);
  return res;
};

export const TraerAlimentosCombo = async (datos) => {
  // datos: { id_usuario, combo_id }
  const res = await api.post("/combos/alimentos", datos);
  return res;
};

export const ActualizarCombo = async (datos) => {
  // datos: { id_usuario, id, nombre?, descripcion?, precio? }
  const res = await api.patch("/combos/actualizar", datos);
  return res;
};

export const AgregarAlimentosCombo = async (datos) => {
  // datos: { id_usuario, combo_id, alimentos: [{alimento_id, cantidad}] }
  const res = await api.post("/combos/agregar-alimentos", datos);
  return res;
};

export const QuitarAlimentoCombo = async (datos) => {
  // datos: { id_usuario, combo_id, alimento_id }
  const res = await api.delete("/combos/quitar-alimento", { data: datos });
  return res;
};

export const CambiarEstadoCombo = async (datos) => {
  // datos: { id_usuario, id }
  const res = await api.patch("/combos/estado", datos);
  return res;
};

export const EliminarCombo = async (datos) => {
  // datos: { id_usuario, id }
  const res = await api.delete("/combos/eliminar", { data: datos });
  return res;
};

//==================================================================
// Al por mayor
//==================================================================

export const TraerAlPorMayor = async (id_usuario) => {
  const res = await api.get(`/traer-alpormayor/${id_usuario}`);
  return res;
};

export const ActualizarAlPorMayor = async (datos) => {
  const res = await api.patch(`/actualizar-alpormayor`, datos);
  return res;
};

export const CambiarEstadoAlPorMayor = async (id_usuario) => {
  const res = await api.post(`/cambiar-estado-alpormayor/${id_usuario}`);
  return res;
};
//=======================================================
// Plantilla
//=======================================================
export const TraerPlantillaTienda = async (id_usuario) => {
  const res = await api.get(`/traer-plantilla/${id_usuario}`);
  return res;
};

export const ActualizarPlantilla = async (datos) => {
  const res = await api.patch(`/actualizar-plantilla`, datos);
  return res;
};
//========================================================
// Filtros
//========================================================
export const CantidadProductos = async (id_usuario) => {
  const res = await api.get(`/cantidad-productos/${id_usuario}`);
  return res;
};
export const CantidadPedidos = async (id_usuario) => {
  const res = await api.get(`/cantidad-pedidos/${id_usuario}`);
  return res;
};
//========================================================
// Tu info
//========================================================
export const TraerInformacion = async (id_usuario) => {
  const res = await api.get(`/traer-tu-info/${id_usuario}`);
  return res;
};

export const TraerInformacionCliente = async (dominio) => {
  const res = await api.get(`/traer-la-info/${dominio}`);
  return res;
};

export const ActualizarTuInformacion = async (datos) => {
  const res = await api.patch("/actualizar-tu-informacion", datos);
  return res;
};

export const ActualizarFotoTuInformacion = async (id_usuario, foto) => {
  const datos = new FormData();
  datos.append("id_usuario", id_usuario);
  datos.append("foto", foto);

  const res = await api.post("/actualizar-foto-tu-informacion", datos, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const CrearQueHago = async (datos) => {
  const res = await api.post("/crear-que-hago", datos);
  return res;
};

export const ActualizarQueHago = async (datos) => {
  const res = await api.patch("/actualizar-que-hago", datos);
  return res;
};

export const EliminarQueHago = async (datos) => {
  const res = await api.delete("/eliminar-que-hago", { data: datos });
  return res;
};

export const CrearMisEspecialidades = async (datos) => {
  const res = await api.post("/crear-mis-especialidades", datos);
  return res;
};

export const ActualizarMisEspecialidades = async (datos) => {
  const res = await api.patch("/actualizar-mis-especialidades", datos);
  return res;
};

export const EliminarMisEspecialidades = async (datos) => {
  const res = await api.delete("/eliminar-mis-especialidades", { data: datos });
  return res;
};

export const CrearComoFunciona = async (datos) => {
  const res = await api.post("/crear-como-funciona", datos);
  return res;
};

export const ActualizarComoFunciona = async (datos) => {
  const res = await api.patch("/actualizar-como-funciona", datos);
  return res;
};

export const EliminarComoFunciona = async (datos) => {
  const res = await api.delete("/eliminar-como-funciona", { data: datos });
  return res;
};

export const CrearInformacionServicio = async (datos) => {
  const res = await api.post("/crear-informacion-servicio", datos);
  return res;
};

export const ActualizarInformacionServicio = async (datos) => {
  const res = await api.patch("/actualizar-informacion-servicio", datos);
  return res;
};

export const EliminarInformacionServicio = async (datos) => {
  const res = await api.delete("/eliminar-informacion-servicio", {
    data: datos,
  });
  return res;
};

export const CrearMiExperiencia = async (datos) => {
  const res = await api.post("/crear-mi-experiencia", datos);
  return res;
};

export const ActualizarMiExperiencia = async (datos) => {
  const res = await api.patch("/actualizar-mi-experiencia", datos);
  return res;
};

export const EliminarMiExperiencia = async (datos) => {
  const res = await api.delete("/eliminar-mi-experiencia", { data: datos });
  return res;
};

export const CrearPorqueTrabajarConmigo = async (datos) => {
  const res = await api.post("/crear-porque-trabajar-conmigo", datos);
  return res;
};

export const ActualizarPorqueTrabajarConmigo = async (datos) => {
  const res = await api.patch("/actualizar-porque-trabajar-conmigo", datos);
  return res;
};

export const EliminarPorqueTrabajarConmigo = async (datos) => {
  const res = await api.delete("/eliminar-porque-trabajar-conmigo", {
    data: datos,
  });
  return res;
};
//==============================================================
// suscripciones
//==============================================================
export const VerificarPago = async (id_usuario) => {
  const res = await api.get(`/verificar-pago/${id_usuario}`);
  return res;
};
