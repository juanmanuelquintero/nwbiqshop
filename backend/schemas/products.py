from pydantic import BaseModel


# ── Producto base ────────────────────────────────────────────────────────────

class ProductoCreate(BaseModel):
    """Crear un producto nuevo. Si es 'variantes' se crea con su primer color."""
    id_usuario:  int
    nombre:      str
    descripcion: str | None = None
    precio:      int
    tipo:        str           # "simple" | "variantes"
    cantidad:    int
    precio_alpormayor: int | None = None
    # Para tipo "simple"
    marca:       str | None = None
    referencia:  str | None = None
    imagen:      str | None = None
    # Para tipo "variantes" — primer color + primera talla
    color:       str | None = None
    talla:       str | None = None


class ProductoUpdate(BaseModel):
    id_usuario:        int
    nombre:            str | None = None
    descripcion:       str | None = None
    precio:            int | None = None
    precio_alpormayor: int | None = None
    estado:            bool | None = None


class ProductoEstadoUpdate(BaseModel):
    id_usuario: int


# ── Color (agregar/modificar colores de un producto con variantes) ───────────

class ColorCreate(BaseModel):
    """Agregar un nuevo color a un producto existente de tipo 'variantes'."""
    id_usuario:  int
    producto_id: int
    color:       str | None = None
    marca:       str | None = None
    referencia:  str | None = None
    imagen:      str | None = None


class ColorUpdate(BaseModel):
    """Modificar los datos de un ProductoColores."""
    id_usuario:  int
    id_color:    int
    color:       str | None = None
    marca:       str | None = None
    referencia:  str | None = None
    imagen:      str | None = None


# ── Variante (talla dentro de un color) ─────────────────────────────────────

class VarianteCreate(BaseModel):
    """Agregar una talla a un color existente."""
    id_usuario:     int
    id_color:       int        # ProductoColores.id
    talla:          str | None = None
    cantidad:       int


class VarianteUpdate(BaseModel):
    """Modificar talla o cantidad de una variante."""
    id_usuario: int
    id:         int            # ProductoVariante.id
    talla:      str | None = None
    cantidad:   int | None = None


# ── Update genérico para simple (stock/imagen/marca/referencia) ──────────────

class SimpleUpdate(BaseModel):
    id_usuario: int
    id:         int            # ProductoSimple.id
    cantidad:   int | None = None
    marca:      str | None = None
    referencia: str | None = None
    imagen:     str | None = None
