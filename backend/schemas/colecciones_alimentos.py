from pydantic import BaseModel


# ── Crear colección ───────────────────────────────────
class ColeccionAlimentosCreate(BaseModel):
    id_usuario: int
    titulo: str
    descripcion: str | None = None
    # IDs de alimentos a asociar desde la creación (opcional)
    alimento_ids: list[int] | None = None


# ── Actualizar colección ──────────────────────────────
class ColeccionAlimentosUpdate(BaseModel):
    id_usuario: int
    id: int
    titulo: str | None = None
    descripcion: str | None = None


# ── Cambiar estado (activar / desactivar) ─────────────
class ColeccionAlimentosEstado(BaseModel):
    id_usuario: int
    id: int


# ── Eliminar colección ────────────────────────────────
class ColeccionAlimentosDelete(BaseModel):
    id_usuario: int
    id: int


# ── Agregar alimentos a una colección ─────────────────
class ColeccionAlimentosAgregar(BaseModel):
    id_usuario: int
    coleccion_id: int
    alimento_ids: list[int]


# ── Eliminar un alimento de una colección ─────────────
class ColeccionAlimentoQuitarItem(BaseModel):
    id_usuario: int
    coleccion_id: int
    alimento_id: int


# ── Traer alimentos de una colección ─────────────────
class ColeccionAlimentosTraerItems(BaseModel):
    id_usuario: int
    coleccion_id: int
