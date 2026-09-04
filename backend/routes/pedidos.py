from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.pedidos import traerpedidos, traerproductospedidos, verdetalledelpedidotendero, hacerpedido, cambiarestadopedido, buscarpedidos, traerproductospedidos, asignarnumeroguia, cantidadpedidos
from schemas.pedidos import PedidoCreate, VerDetallePedido, PedidoEstadoUpdate, BuscarPedidos, AsignarNumeroGuia

router = APIRouter()

@router.get("/traer-pedidos/{id_usuario}")
def TraerPedidos(id_usuario: int, db: Session = Depends(get_db)):
    return traerpedidos(db, id_usuario)

@router.get("/traer-productos-pedido/{id_pedido}")
def TraerProductosPedido(id_pedido: int, db: Session = Depends(get_db)):
    return traerproductospedidos(db, id_pedido)

@router.post("/ver-detalle-pedido")
def VerADetallePedido(datos: VerDetallePedido, db: Session = Depends(get_db)):
    return verdetalledelpedidotendero(db, datos)

@router.post("/cambiar-estado-pedido")
def CambiarEstadoPedido(datos: PedidoEstadoUpdate, db: Session = Depends(get_db)):
    return cambiarestadopedido(db, datos)

@router.post("/hacer-pedido")
def HacerPedido(datos: PedidoCreate, db: Session = Depends(get_db)):
    return hacerpedido(db, datos)

@router.post("/buscar-pedidos")
def Buscar_Pedidos(datos: BuscarPedidos, db: Session = Depends(get_db)):
    return buscarpedidos(db, datos)

@router.post("/asignar-guia")
def Asignar_Guia(datos: AsignarNumeroGuia, db: Session = Depends(get_db)):
    return asignarnumeroguia(db, datos)

@router.get("/cantidad-pedidos/{id_usuario}")
def CantidadPedidos(id_usuario: int, db: Session = Depends(get_db)):
    return cantidadpedidos(db, id_usuario)

