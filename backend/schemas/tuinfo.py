from pydantic import BaseModel


class TuInformacionUpdate(BaseModel):
    id_usuario: int
    nombre_completo: str | None = None
    dedicacion: str | None = None
    dedicacion_detallada: str | None = None
    direccion: str | None = None
    disponibilidad: bool | None = None
    sobre_mi: str | None = None
    numero_telefono: str | None = None
    correo: str | None = None
    estado: bool | None = None


class QueHagoCreate(BaseModel):
    id_usuario: int
    titulo: str
    descripcion: str
    icon: str
    estado: bool = True


class QueHagoUpdate(BaseModel):
    id_usuario: int
    id: int
    titulo: str | None = None
    descripcion: str | None = None
    icon: str | None = None
    estado: bool | None = None


class QueHagoDelete(BaseModel):
    id_usuario: int
    id: int


class MisEspecialidadesCreate(BaseModel):
    id_usuario: int
    icon: str
    descripcion: str
    estado: bool = True


class MisEspecialidadesUpdate(BaseModel):
    id_usuario: int
    id: int
    icon: str | None = None
    descripcion: str | None = None
    estado: bool | None = None


class MisEspecialidadesDelete(BaseModel):
    id_usuario: int
    id: int


class ComoFuncionaCreate(BaseModel):
    id_usuario: int
    titulo: str
    descripcion: str
    estado: bool = True


class ComoFuncionaUpdate(BaseModel):
    id_usuario: int
    id: int
    titulo: str | None = None
    descripcion: str | None = None
    estado: bool | None = None


class ComoFuncionaDelete(BaseModel):
    id_usuario: int
    id: int


class InformacionServicioCreate(BaseModel):
    id_usuario: int
    titulo: str
    descripcion: str
    estado: bool = True


class InformacionServicioUpdate(BaseModel):
    id_usuario: int
    id: int
    titulo: str | None = None
    descripcion: str | None = None
    estado: bool | None = None


class InformacionServicioDelete(BaseModel):
    id_usuario: int
    id: int


class MiExperienciaCreate(BaseModel):
    id_usuario: int
    anos_experiencia: int | None = None
    clientes_atendidos: int | None = None
    calificacion_promedio: float | None = None
    estado: bool = True


class MiExperienciaUpdate(BaseModel):
    id_usuario: int
    id: int
    anos_experiencia: int | None = None
    clientes_atendidos: int | None = None
    calificacion_promedio: float | None = None
    estado: bool | None = None


class MiExperienciaDelete(BaseModel):
    id_usuario: int
    id: int


class PorqueTrabajarConmigoCreate(BaseModel):
    id_usuario: int
    descripcion: str
    estado: bool = True


class PorqueTrabajarConmigoUpdate(BaseModel):
    id_usuario: int
    id: int
    descripcion: str | None = None
    estado: bool | None = None


class PorqueTrabajarConmigoDelete(BaseModel):
    id_usuario: int
    id: int
