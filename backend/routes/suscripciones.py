from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.suscripciones import yapago

router = APIRouter()

@router.get("/verificar-pago/{id_usuario}")
def YaPago(id_usuario: int, db: Session = Depends(get_db)):
    return yapago(db, id_usuario)