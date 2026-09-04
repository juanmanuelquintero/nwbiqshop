from models.suscripcion import Suscripciones
from models.users import Users
from datetime import datetime
from dateutil.relativedelta import relativedelta
from fastapi import HTTPException

def crearsuscripcion(db, id_usuario):

    nuevasus = Suscripciones(
        cedula_usuario=id_usuario,
        cantidad_pagar=0,
        fecha_fin=datetime.now() + relativedelta(months=1),
        fecha_pago = datetime.now()
    )

    db.add(nuevasus)
    db.commit()
    db.refresh(nuevasus)

    return nuevasus

def yapago(db, id_usuario):
    buscarsus = db.query(Suscripciones).filter(
        Suscripciones.cedula_usuario == id_usuario
    ).first()

    if not buscarsus:
        return False

    hoy = datetime.now()

    if buscarsus.fecha_fin < hoy:
        buscarsus.estado = "vencida"
        db.commit()
        db.refresh(buscarsus)

        return False

    return True