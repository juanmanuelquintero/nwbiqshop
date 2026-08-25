from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from schemas.collections import ColeccionCreate, TraerProductosColeccion, ColeccionProductosCreate, ColeccionUpdate, ColeccionProductoDelete, ColeccionEstadoUpdate, ColeccionDelete
from services.collections import crearcoleccion, traercolecciones, traerproductoscoleccion, agregarproductoscoleccion, modificarcoleccion, eliminarproductoColeccion, cambiarestadocoleccion, eliminarcoleccion

router = APIRouter()

@router.post("/crear-coleccion")
def Crear_Coleccion(datos: ColeccionCreate, db: Session = Depends(get_db)):
    return crearcoleccion(db, datos)

@router.get("/traer-coleccion/{id_usuario}")
def Traer_Coleccion(id_usuario: int, db: Session = Depends(get_db)):
    return traercolecciones(db, id_usuario)

@router.post("/productos-coleccion")
def Traer_Productos_Coleccion(datos: TraerProductosColeccion, db: Session = Depends(get_db)):
    return traerproductoscoleccion(db, datos)

@router.post("/agregar-coleccion")
def Agregar_Coleccion(datos: ColeccionProductosCreate, db: Session = Depends(get_db)):
    return agregarproductoscoleccion(db, datos)

@router.patch("/modificar-coleccion")
def Modificar_Coleccion(datos: ColeccionUpdate, db: Session = Depends(get_db)):
    return modificarcoleccion(db, datos)

@router.delete("/eliminar-coleccion")
def Eliminar_Producto_Coleccion(datos: ColeccionProductoDelete, db: Session = Depends(get_db)):
    return eliminarproductoColeccion(db, datos)

@router.patch("/cambiar-estado-coleccion")
def Cambiar_Estado_Coleccion(datos: ColeccionEstadoUpdate, db: Session = Depends(get_db)):
    return cambiarestadocoleccion(db, datos)

@router.delete("/eliminar-las-colecciones")
def eliminar(datos: ColeccionDelete, db: Session = Depends(get_db)):
    return eliminarcoleccion(db, datos)

