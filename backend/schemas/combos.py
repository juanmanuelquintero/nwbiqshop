from pydantic import BaseModel


# ── Ítem de alimento al crear / agregar ──────────────
class ComboAlimentoItem(BaseModel):
    alimento_id: int
    cantidad: int = 1


# ── Crear combo ───────────────────────────────────────
class ComboCreate(BaseModel):
    id_usuario: int
    nombre: str
    descripcion: str | None = None
    precio: int
    # Alimentos opcionales desde la creación
    alimentos: list[ComboAlimentoItem] | None = None


# ── Actualizar datos del combo ────────────────────────
class ComboUpdate(BaseModel):
    id_usuario: int
    id: int
    nombre: str | None = None
    descripcion: str | None = None
    precio: int | None = None


# ── Agregar alimentos a un combo existente ────────────
class ComboAgregarAlimentos(BaseModel):
    id_usuario: int
    combo_id: int
    alimentos: list[ComboAlimentoItem]


# ── Quitar un alimento de un combo ────────────────────
class ComboQuitarAlimento(BaseModel):
    id_usuario: int
    combo_id: int
    alimento_id: int


# ── Cambiar estado (activar / desactivar) ─────────────
class ComboEstado(BaseModel):
    id_usuario: int
    id: int


# ── Eliminar combo ────────────────────────────────────
class ComboDelete(BaseModel):
    id_usuario: int
    id: int


# ── Ver alimentos de un combo ─────────────────────────
class ComboVerAlimentos(BaseModel):
    id_usuario: int
    combo_id: int
