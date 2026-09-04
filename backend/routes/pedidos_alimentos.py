from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from schemas.pedidos_alimentos import (
    VerDetallePedidoAlimento,
    CambiarEstadoPedidoAlimento,
)
from services.pedidos_alimentos import (
    traer_pedidos_alimentos,
    ver_detalle_pedido_alimento,
    cambiar_estado_pedido_alimento,
)

router = APIRouter()


@router.get("/pedidos-alimentos/traer/{id_usuario}")
def traer_pedidos(id_usuario: int, db: Session = Depends(get_db)):
    return traer_pedidos_alimentos(db, id_usuario)


@router.post("/pedidos-alimentos/detalle")
def ver_detalle(datos: VerDetallePedidoAlimento, db: Session = Depends(get_db)):
    return ver_detalle_pedido_alimento(db, datos)


@router.patch("/pedidos-alimentos/estado")
def cambiar_estado(datos: CambiarEstadoPedidoAlimento, db: Session = Depends(get_db)):
    return cambiar_estado_pedido_alimento(db, datos)
