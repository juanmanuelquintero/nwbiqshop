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

export const TraerProductos = async (user) => {
  const res = await api.get(`/traer-producto/${user}`);
  return res;
};

export const CrearProducto = async (datos) => {
  const res = await api.post("/crear-producto", datos);
  return res;
};

export const ActualizarProducto = async (id, datos) => {
  const res = await api.put(`/actualizar-producto/${id}`, datos);
  return res;
};

export const EliminarProducto = async (id) => {
  const res = await api.delete(`/eliminar-producto/${id}`);
  return res;
};
