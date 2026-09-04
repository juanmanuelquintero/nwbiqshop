from models.shop import Shop
from models.alpormayor import AlPorMayor
from fastapi import  HTTPException
from services.notificaciones import Crearnotificaion


def cambiarestado(db, id_usuario):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == id_usuario
    ).first()

    if not buscartienda:
        HTTPException(status_code=400, detail="error no se encontro ninguna tienda asociada")

    buscaralpormayor = db.query(AlPorMayor).filter(
        AlPorMayor.id_tienda == buscartienda.id
    ).first()

    if not buscaralpormayor:
         HTTPException(status_code=400, detail="error no tiene acceso al por mayor")

    buscaralpormayor.estado = not buscaralpormayor.estado

    db.commit()
    Crearnotificaion(db, buscartienda.id, "Se cambio el estado de venta mayorista", "inventario")

    return "se cambio el estado correctaente"

def actualizaralpormayor(db, datos):
    buscartienda = db.query(Shop).filter(
            Shop.usuario_id == datos.id_usuario
        ).first()
    
    if not buscartienda:
        HTTPException(status_code=400, detail="error no se encontro ninguna tienda asociada")

    buscaralpormayor = db.query(AlPorMayor).filter(
        AlPorMayor.id_tienda == buscartienda.id
    ).first()

    if not buscaralpormayor:
             HTTPException(status_code=400, detail="error no tiene acceso al por mayor")

    if datos.cantidad_minima is not None:
         buscaralpormayor.cantidad_minima = datos.cantidad_minima

    db.commit()
    Crearnotificaion(db, buscartienda.id, "Se actualizo la venta mayorista", "inventario")

    return "cantidad minima actualizada"

def traeralpormayor(db, id_usuario):
    buscartienda = db.query(Shop).filter(
            Shop.usuario_id == id_usuario
        ).first()
    
    if not buscartienda:
        HTTPException(status_code=400, detail="error no se encontro ninguna tienda asociada")

    buscaralpormayor = db.query(AlPorMayor).filter(
        AlPorMayor.id_tienda == buscartienda.id
    ).first()

    if not buscaralpormayor:
        HTTPException(status_code=400, detail="error no tiene acceso al por mayor")

    return buscaralpormayor