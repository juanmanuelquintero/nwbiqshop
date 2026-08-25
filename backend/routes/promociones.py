from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.promociones import (
    traerpromociontienda,
    traerproductospromocion,
    traerpromocionunitaria,
    modificarpromociontienda,
    modificarpromocionunitaria,
    asignarproductospromocion,
    eliminarpoductospromocion,
    cambiarestadopromociontienda,
    cambiarestadopromocionunitaria,
    crearpromocionunitaria
)

from schemas.promociones import (
    PromocionProductosCreate,
    PromocionProductoDelete,
    PromocionUnitariaCreate,
    PromocionUnitariaEstado,
    PromocionUnitariaUpdate,
    PromocionUpdate
)

router = APIRouter()

@router.get("/traer-promocion/{id_usuario}")
def traer_promocion(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    return traerpromociontienda(db, id_usuario)

@router.get("/traer-productos-promocion/{id_usuario}")
def traer_productos_promocion(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    return traerproductospromocion(db, id_usuario)

@router.get("/traer-promocion-unitaria/{id_usuario}")
def traer_promocion_initaria(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    return traerpromocionunitaria(db, id_usuario)

@router.patch("/modificar-promocion")
def modificar_promocion(
    datos: PromocionUpdate,
    db: Session = Depends(get_db)
):
    return modificarpromociontienda(db, datos)

@router.patch("/modificar-promocion-unitaria")
def modificar_promocion_initaria(
    datos: PromocionUnitariaUpdate,
    db: Session = Depends(get_db)
):
    return modificarpromocionunitaria(db, datos)

@router.post("/asignar-productos-promocion")
def asignar_productos_promocion(
    datos: PromocionProductosCreate,
    db: Session = Depends(get_db)
):
    return asignarproductospromocion(db, datos)

@router.delete("/eliminar-productos-promocion")
def eliminar_productos_promocion(
    datos: PromocionProductoDelete,
    db: Session = Depends(get_db)
):
    return eliminarpoductospromocion(db, datos)

@router.post("/cambiar-estado-promocion/{id_usuario}")
def cambiar_estado_promocion(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    return cambiarestadopromociontienda(db, id_usuario)

@router.post("/cambiar-estado-promocion-unitaria")
def cambiar_estado_promocion_initaria(
    datos: PromocionUnitariaEstado,
    db: Session = Depends(get_db)
):
    return cambiarestadopromocionunitaria(db, datos)

@router.post("/crear-promocion-unitaria")
def crear_promocion_unitaria(
    datos: PromocionUnitariaCreate,
    db: Session = Depends(get_db)
):
    return crearpromocionunitaria(db, datos)