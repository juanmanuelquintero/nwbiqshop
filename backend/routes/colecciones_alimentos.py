from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from schemas.colecciones_alimentos import (
    ColeccionAlimentosCreate,
    ColeccionAlimentosUpdate,
    ColeccionAlimentosEstado,
    ColeccionAlimentosDelete,
    ColeccionAlimentosAgregar,
    ColeccionAlimentoQuitarItem,
    ColeccionAlimentosTraerItems,
)
from services.colecciones_alimentos import (
    crear_coleccion_alimentos,
    traer_colecciones_alimentos,
    traer_alimentos_coleccion,
    agregar_alimentos_coleccion,
    quitar_alimento_coleccion,
    actualizar_coleccion_alimentos,
    cambiar_estado_coleccion_alimentos,
    eliminar_coleccion_alimentos,
)

router = APIRouter()


@router.post("/colecciones-alimentos/crear")
def crear(datos: ColeccionAlimentosCreate, db: Session = Depends(get_db)):
    return crear_coleccion_alimentos(db, datos)


@router.get("/colecciones-alimentos/traer/{id_usuario}")
def traer(id_usuario: int, db: Session = Depends(get_db)):
    return traer_colecciones_alimentos(db, id_usuario)


@router.post("/colecciones-alimentos/items")
def traer_items(datos: ColeccionAlimentosTraerItems, db: Session = Depends(get_db)):
    return traer_alimentos_coleccion(db, datos)


@router.post("/colecciones-alimentos/agregar-alimentos")
def agregar(datos: ColeccionAlimentosAgregar, db: Session = Depends(get_db)):
    return agregar_alimentos_coleccion(db, datos)


@router.delete("/colecciones-alimentos/quitar-alimento")
def quitar(datos: ColeccionAlimentoQuitarItem, db: Session = Depends(get_db)):
    return quitar_alimento_coleccion(db, datos)


@router.patch("/colecciones-alimentos/actualizar")
def actualizar(datos: ColeccionAlimentosUpdate, db: Session = Depends(get_db)):
    return actualizar_coleccion_alimentos(db, datos)


@router.patch("/colecciones-alimentos/estado")
def estado(datos: ColeccionAlimentosEstado, db: Session = Depends(get_db)):
    return cambiar_estado_coleccion_alimentos(db, datos)


@router.delete("/colecciones-alimentos/eliminar")
def eliminar(datos: ColeccionAlimentosDelete, db: Session = Depends(get_db)):
    return eliminar_coleccion_alimentos(db, datos)
