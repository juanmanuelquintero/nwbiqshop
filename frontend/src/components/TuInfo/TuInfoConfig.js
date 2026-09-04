export const LISTAS = [
  {
    key: "que_hago",
    title: "¿Qué hago?",
    description: "Cuenta qué servicios o actividades realizas.",
    icon: "💼",
    fields: ["titulo", "descripcion", "icon", "estado"],
  },
  {
    key: "mis_especialidades",
    title: "Mis especialidades",
    description: "Destaca aquello en lo que tienes experiencia.",
    icon: "⭐",
    fields: ["icon", "descripcion", "estado"],
  },
  {
    key: "como_funciona",
    title: "¿Cómo funciona?",
    description: "Explica de forma sencilla cómo trabajan contigo.",
    icon: "⚙️",
    fields: ["titulo", "descripcion", "estado"],
  },
  {
    key: "informacion_servicio",
    title: "Información del servicio",
    description: "Agrega información importante para tus clientes.",
    icon: "📋",
    fields: ["titulo", "descripcion", "estado"],
  },
  {
    key: "mi_experiencia",
    title: "Mi experiencia",
    description: "Comparte algunos datos que respalden tu experiencia.",
    icon: "🏆",
    optional: true,
    fields: [
      "anos_experiencia",
      "clientes_atendidos",
      "calificacion_promedio",
      "estado",
    ],
  },
  {
    key: "porque_trabajar_conmigo",
    title: "¿Por qué trabajar conmigo?",
    description: "Explica qué te diferencia y por qué deberían elegirte.",
    icon: "🤝",
    fields: ["descripcion", "estado"],
  },
];

export const CAMPOS_TU_INFO = [
  ["nombre_completo", "Nombre completo"],
  ["dedicacion", "Dedicación"],
  ["dedicacion_detallada", "Dedicación detallada"],
  ["direccion", "Dirección"],
  ["numero_telefono", "Número de teléfono"],
  ["correo", "Correo"],
  ["sobre_mi", "Sobre mí"],
];

export const ETIQUETAS = {
  titulo: "Título",
  descripcion: "Descripción",
  icon: "Icono",
  estado: "Activo",
  anos_experiencia: "Años de experiencia",
  clientes_atendidos: "Clientes atendidos",
  calificacion_promedio: "Calificación promedio",
};

export const CAMPOS_NUMERICOS = [
  "anos_experiencia",
  "clientes_atendidos",
  "calificacion_promedio",
];

export const objetoVacio = (fields) =>
  Object.fromEntries(
    fields.map((field) => [field, field === "estado" ? true : ""]),
  );
