from pydantic import BaseModel


class ColeccionCreate(BaseModel):
    id_usuario: int
    nombre: str
    descripcion: str | None = None
    producto_id: list[int] | None = None

class ColeccionUpdate(BaseModel):
    id_usuario: int
    id: int
    nombre: str | None = None
    descripcion: str | None = None

class ColeccionInactivar(BaseModel):
    id: int
    id_tienda: int

class ColeccionProductosCreate(BaseModel):
    id_usuario: int
    coleccion_id: int
    producto_id: list[int]

class TraerProductosColeccion(BaseModel):
    id_usuario: int
    coleccion_id: int

class ColeccionProductoDelete(BaseModel):
    id_usuario: int
    coleccion_id: int
    producto_id: int

class ColeccionEstadoUpdate(BaseModel):
    id_usuario: int
    id: int

class ColeccionDelete(BaseModel):
    id_usuario: int
    id: int