from pydantic import BaseModel

# Modificar tienda
class ShopUpdate(BaseModel):
    id_usuario: int
    nombre: str | None = None
    dominio: str | None = None
    descripcion: str | None = None
    pasarela_pagos: bool | None = None
    logo: str | None = None
    direccion: str | None = None
    telefono: str | None = None


# Inactivar tienda
class ShopInactive(BaseModel):
    id: int
    usuario_id: int

class ShopPlantillaUpdate(BaseModel):
    id_usuario: int
    plantilla: int