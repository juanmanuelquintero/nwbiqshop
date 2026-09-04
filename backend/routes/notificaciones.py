from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.notificaciones import traernotificaciones

router = APIRouter()

@router.get("/traer-notificaciones")
def Traer_Notificaciones(id_usuario: int, db: Session = Depends(get_db)):
    return traernotificaciones(db, id_usuario)