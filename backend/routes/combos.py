from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from schemas.combos import (
    ComboCreate,
    ComboUpdate,
    ComboAgregarAlimentos,
    ComboQuitarAlimento,
    ComboEstado,
    ComboDelete,
    ComboVerAlimentos,
)
from services.combos import (
    crear_combo,
    traer_combos,
    traer_alimentos_combo,
    actualizar_combo,
    agregar_alimentos_combo,
    quitar_alimento_combo,
    cambiar_estado_combo,
    eliminar_combo,
)

router = APIRouter()


@router.post("/combos/crear")
def crear(datos: ComboCreate, db: Session = Depends(get_db)):
    return crear_combo(db, datos)


@router.get("/combos/traer/{id_usuario}")
def traer(id_usuario: int, db: Session = Depends(get_db)):
    return traer_combos(db, id_usuario)


@router.post("/combos/alimentos")
def ver_alimentos(datos: ComboVerAlimentos, db: Session = Depends(get_db)):
    return traer_alimentos_combo(db, datos)


@router.patch("/combos/actualizar")
def actualizar(datos: ComboUpdate, db: Session = Depends(get_db)):
    return actualizar_combo(db, datos)


@router.post("/combos/agregar-alimentos")
def agregar(datos: ComboAgregarAlimentos, db: Session = Depends(get_db)):
    return agregar_alimentos_combo(db, datos)


@router.delete("/combos/quitar-alimento")
def quitar(datos: ComboQuitarAlimento, db: Session = Depends(get_db)):
    return quitar_alimento_combo(db, datos)


@router.patch("/combos/estado")
def estado(datos: ComboEstado, db: Session = Depends(get_db)):
    return cambiar_estado_combo(db, datos)


@router.delete("/combos/eliminar")
def eliminar(datos: ComboDelete, db: Session = Depends(get_db)):
    return eliminar_combo(db, datos)
