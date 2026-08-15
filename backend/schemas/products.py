from pydantic import BaseModel


class ProductoCreate(BaseModel):
    id_usuario: int
    nombre: str
    descripcion: str | None = None
    precio: int
    tipo: str
    imagen1: str | None = None
    imagen2: str | None = None
    talla: str | None = None
    color: str | None = None
    cantidad: int

class ProductoSimpleCreate(BaseModel):
    producto_id: int
    cantidad: int 

class ProductoVarianteCreate(BaseModel):
    producto_id: int
    talla: str 
    color: str 
    cantidad: int

class ProductoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: int | None = None
    estado: bool | None = None
