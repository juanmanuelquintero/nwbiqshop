from pydantic import BaseModel


class PromocionUpdate(BaseModel):
    id_usuario: int
    nombre: str | None = None
    descripcion: str | None = None
    descuento: int | None = None

class PromocionProductosCreate(BaseModel):
    id_usuario: int
    producto_id: list[int]

class PromocionProductoDelete(BaseModel):
    id_usuario: int
    producto_id: int

class PromocionUnitariaCreate(BaseModel):
    id_usuario: int
    producto_id: int
    descuento: int

class PromocionUnitariaUpdate(BaseModel):
    id_usuario: int
    id: int
    descuento: int | None = None

class PromocionUnitariaEstado(BaseModel):
    id_usuario: int
    id: int