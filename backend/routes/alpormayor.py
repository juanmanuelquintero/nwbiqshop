from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.alpormayor import cambiarestado, actualizaralpormayor, traeralpormayor
from schemas.alpormayor import ActualizarAlPorMayor

router = APIRouter()

@router.post("/cambiar-estado-alpormayor/{id_usuario}")
def Cambiar_Estado_Alpormayor(id_usuario, db: Session = Depends(get_db)):
    return cambiarestado(db, id_usuario)

@router.get("/traer-alpormayor/{id_usuario}")
def Traer_Alpormayor(id_usuario, db: Session = Depends(get_db)):
    return traeralpormayor(db, id_usuario)

@router.patch("/actualizar-alpormayor")
def Actualizar_Alpormayor(datos: ActualizarAlPorMayor, db: Session = Depends(get_db)):
    return actualizaralpormayor(db, datos)

