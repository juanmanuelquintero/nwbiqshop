from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from schemas.products import ProductoCreate, ProductoVarianteCreate, ProductoUpdate
from services.products import (
    crearproducto,
    traerproducto,
    agregarvariantesexistente,
    actualizarproducto,
    eliminarproducto,
)

router = APIRouter()


@router.post("/crear-producto")
def Crear_Producto(datos: ProductoCreate, db: Session = Depends(get_db)):
    return crearproducto(db, datos)


@router.get("/traer-producto/{id_usuario}")
def Traer_Producto(id_usuario: int, db: Session = Depends(get_db)):
    return traerproducto(db, id_usuario)


@router.post("/agregar-variante/{producto_id}")
def Agregar_Variante(producto_id: int, datos: ProductoVarianteCreate, db: Session = Depends(get_db)):
    return agregarvariantesexistente(db, producto_id, datos)


@router.put("/actualizar-producto/{producto_id}")
def Actualizar_Producto(producto_id: int, datos: ProductoUpdate, db: Session = Depends(get_db)):
    return actualizarproducto(db, producto_id, datos)


@router.delete("/eliminar-producto/{producto_id}")
def Eliminar_Producto(producto_id: int, db: Session = Depends(get_db)):
    return eliminarproducto(db, producto_id)
