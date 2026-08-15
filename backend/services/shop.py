from models.shop import Shop
from fastapi import HTTPException

def crear_tienda(db, datos):
    buscardominio = db.query(Shop).filter(
        Shop.dominio == datos["dominio"]
    ).first()

    if buscardominio:
        raise HTTPException(status=400, detail="error el dominio ya existe")

    nueva_tienda = Shop(
        usuario_id=datos["usuario_id"],
        nombre=datos["nombre"],
        dominio=datos["dominio"],
        descripcion=datos["descripcion"],
        sueldo_mensual=datos["sueldo_mensual"],
        actividad=datos["actividad"],
        pasarela_pagos=datos["pasarela_pagos"],
        logo=None,
        direccion=datos["direccion"],
        telefono=datos["telefono"]
    )

    db.add(nueva_tienda)
    db.commit()
    db.refresh(nueva_tienda)

    return nueva_tienda


def traer_tienda(db, user):
    treardatostienda = db.query(Shop).filter(
        Shop.usuario_id == user
    ).first()

    return{
        "tienda": treardatostienda.nombre,
        "dominio": treardatostienda.dominio,
        "estado": treardatostienda.estado
    }