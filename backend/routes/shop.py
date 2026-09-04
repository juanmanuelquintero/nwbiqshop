from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.shop import traer_tienda, modificartienda, traertiendaclintes, buscarproductossueltos, traerplantillatienda, modificarplantilla
from schemas.shop import ShopUpdate, ShopPlantillaUpdate

router = APIRouter()

@router.get("/traer-tienda/{usuario}")
def Traer_Tienda(usuario: int, db: Session = Depends(get_db)):
    return traer_tienda(db, usuario)

@router.patch("/modificar-tienda")
def ModificarTienda(datos: ShopUpdate, db: Session = Depends(get_db)):
    return modificartienda(db, datos)

@router.get("/traer-tienda-dominio/{dominio}")
def Traer_Tienda_Dominio(dominio: str, db: Session = Depends(get_db)):
    return traertiendaclintes(db, dominio)

@router.get("/traer-productos-dominio/{dominio}")
def Traer_Productos_Dominio(dominio: str, db: Session = Depends(get_db)):
    return buscarproductossueltos(db, dominio)

@router.get("/traer-plantilla/{id_usuario}")
def Traer_Plantilla(id_usuario: int, db: Session = Depends(get_db)):
    return traerplantillatienda(db, id_usuario)

@router.patch("/actualizar-plantilla")
def Actualizar_Plantilla(datos: ShopPlantillaUpdate, db: Session = Depends(get_db)):
    return modificarplantilla(db, datos)
