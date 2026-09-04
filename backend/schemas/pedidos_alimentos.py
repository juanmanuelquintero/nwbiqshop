from pydantic import BaseModel


# ── Traer pedidos ─────────────────────────────────────
# GET /pedidos-alimentos/traer/{id_usuario}  — sin schema, id en la URL

# ── Ver detalle de un pedido ──────────────────────────
class VerDetallePedidoAlimento(BaseModel):
    id_usuario: int
    pedido_id: int


# ── Cambiar estado ────────────────────────────────────
ESTADOS_PERMITIDOS = (
    "en espera",
    "en preparación",
    "listo",
    "en camino",
    "entregado",
    "cancelado",
)

class CambiarEstadoPedidoAlimento(BaseModel):
    id_usuario: int
    pedido_id: int
    estado: str   # debe ser uno de ESTADOS_PERMITIDOS
