from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.styles import traerestilos, modificarestilos, traerestilosdominio
from schemas.styles import EstilosUpdate

router = APIRouter()

@router.get("/traer-estilos/{id_usuario}")
def TraerEstilos(id_usuario, db: Session = Depends(get_db)):
    return traerestilos(db, id_usuario)

@router.post("/modificar-estilos")
def ModificarEstilos(datos: EstilosUpdate, db: Session = Depends(get_db)):
    return modificarestilos(db, datos)

@router.get("/traer-estilos-dominio/{dominio}")
def TraerEstilosDominio(dominio: str, db: Session = Depends(get_db)):
    return traerestilosdominio(db, dominio)
    