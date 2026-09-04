from pydantic import BaseModel

class ActualizarAlPorMayor(BaseModel):
    id_usuario: int
    cantidad_minima: int