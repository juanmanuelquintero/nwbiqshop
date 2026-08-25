from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.pedidos import traerpedidos, verdetalledelpedidotendero, hacerpedido, cambiarestadopedido
from schemas.pedidos import PedidoCreate, VerDetallePedido, PedidoEstadoUpdate

router = APIRouter()

@router.get("/traer-pedidos/{id_usuario}")
def TraerPedidos(id_usuario: int, db: Session = Depends(get_db)):
    return traerpedidos(db, id_usuario)

@router.post("/ver-detalle-pedido")
def VerADetallePedido(datos: VerDetallePedido, db: Session = Depends(get_db)):
    return verdetalledelpedidotendero(db, datos)

@router.post("/cambiar-estado-pedido")
def CambiarEstadoPedido(datos: PedidoEstadoUpdate, db: Session = Depends(get_db)):
    return cambiarestadopedido(db, datos)

@router.post("/hacer-pedido")
def HacerPedido(datos: PedidoCreate, db: Session = Depends(get_db)):
    return hacerpedido(db, datos)


