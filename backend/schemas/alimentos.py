from pydantic import BaseModel
from typing import List

# ==========================================
# CREAR ALIMENTO
# ==========================================

class IngredienteCreate(BaseModel):
    nombre: str
    descripcion: str | None = None
    cantidad: float | None = None
    unidad: str | None = None


class AlimentoCreate(BaseModel):
    id_usuario: int
    nombre: str
    descripcion: str | None = None
    precio: int
    imagen: str | None = None
    tiempo_preparacion: int | None = None
    disponible: bool = True

    ingredientes: List[IngredienteCreate] = []


# ==========================================
# MODIFICAR ALIMENTO
# ==========================================

class AlimentoUpdate(BaseModel):

    id_usuario: int
    nombre: str | None = None
    descripcion: str | None = None
    precio: int | None = None
    imagen: str | None = None
    tiempo_preparacion: int | None = None
    disponible: bool | None = None

# ==========================================
# INHABILITAR / HABILITAR ALIMENTO
# ==========================================

class AlimentoEstado(BaseModel):

    id_usuario: int
    estado: bool

#===========================================
# Ingrediente update
#===========================================

class IngredienteUpdate(BaseModel):
    id_usuario: int

    nombre: str | None = None
    descripcion: str | None = None
    cantidad: float | None = None
    unidad: str | None = None