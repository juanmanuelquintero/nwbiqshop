import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
