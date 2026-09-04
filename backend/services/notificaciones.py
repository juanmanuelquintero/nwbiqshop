from models.notificaciones import Notificaciones
from datetime import datetime, timedelta
from models.shop import Shop
from fastapi import HTTPException

def Crearnotificaion(db, id_tienda, accion, lugar):
    nuevanoti = Notificaciones(
        id_tienda = id_tienda,
        accion = accion,
        lugar = lugar
    )

    db.add(nuevanoti)
    db.commit()

    return "notificacion creada"

def traernotificaciones(db, id_usuario):
    hoy = datetime.now()
    hace_tres_semanas = hoy - timedelta(weeks=3)

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == id_usuario,
        Shop.estado == True
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error la tienda no se encontro o no esta activa")

    notificaciones = (
        db.query(Notificaciones)
        .filter(
            Notificaciones.id_tienda == buscartienda.id,
            Notificaciones.fecha >= hace_tres_semanas,
            Notificaciones.fecha <= hoy
        )
        .order_by(Notificaciones.fecha.desc())
        .all()
    )

    return notificaciones