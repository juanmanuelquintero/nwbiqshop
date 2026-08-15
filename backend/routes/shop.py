from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config_db import get_db
from services.shop import traer_tienda

router = APIRouter()

@router.get("/traer-tienda/{usuario}")
def Traer_Tienda(usuario: int, db: Session = Depends(get_db)):
    return traer_tienda(db, usuario)