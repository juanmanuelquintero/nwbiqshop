from pydantic import BaseModel, Field


class ItemPedido(BaseModel):
    """Un producto dentro del carrito del cliente."""
    producto_id: int
    id_variante: int          # ID de ProductoVariante o ProductoSimple
    tipo: str                 # "variantes" | "simple"
    cantidad: int = Field(default=1, ge=1)


class PedidoCreate(BaseModel):
    """Payload que envía el cliente para crear un pedido."""
    dominio: str              # dominio de la tienda
    productos: list[ItemPedido]
    correo: str 
    nombresyapellidos: str 
    telefono: str 
    ciudad: str 
    direccion: str 


class PedidoEstadoUpdate(BaseModel):
    id_usuario: int
    id_pedido: int
    estado: str


class VerDetallePedido(BaseModel):
    id_usuario: int
    id_pedido: int


class BuscarPedidos(BaseModel):
    correo: str | None = None
    telefono: str | None = None 

class AsignarNumeroGuia(BaseModel):
    id_usuario: int
    id_pedido: int
    numeroguia: str