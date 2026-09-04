from fastapi import HTTPException
from models.colecciones_alimentos import ColeccionAlimentos, ColeccionAlimentoRelacion
from models.shop import Shop
from models.alimentos import Alimento
from services.notificaciones import Crearnotificaion


# ─────────────────────────────────────────────────────
#  Helpers privados
# ─────────────────────────────────────────────────────

def _validar_tienda_alimentos(db, id_usuario: int) -> Shop:
    """
    Verifica que el usuario tenga una tienda y que esa tienda
    sea de actividad 'Venta de alimentos'. Lanza HTTPException si no.
    """
    tienda = db.query(Shop).filter(Shop.usuario_id == id_usuario).first()

    if not tienda:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una tienda asociada a este usuario"
        )

    if tienda.actividad != "Venta de alimentos":
        raise HTTPException(
            status_code=400,
            detail="La tienda no es de alimentos"
        )

    return tienda


def _validar_coleccion(db, coleccion_id: int, tienda_id: int) -> ColeccionAlimentos:
    """Verifica que la colección exista y pertenezca a la tienda."""
    coleccion = db.query(ColeccionAlimentos).filter(
        ColeccionAlimentos.id == coleccion_id,
        ColeccionAlimentos.id_tienda == tienda_id
    ).first()

    if not coleccion:
        raise HTTPException(
            status_code=404,
            detail="Colección no encontrada o no pertenece a tu tienda"
        )

    return coleccion


def _agregar_alimentos(db, coleccion_id: int, tienda_id: int, alimento_ids: list[int]):
    """Agrega alimentos a una colección ignorando duplicados y alimentos ajenos."""
    for alimento_id in alimento_ids:
        alimento = db.query(Alimento).filter(
            Alimento.id == alimento_id,
            Alimento.id_tienda == tienda_id
        ).first()

        # Ignorar alimentos que no existen o no pertenecen a la tienda
        if not alimento:
            continue

        ya_existe = db.query(ColeccionAlimentoRelacion).filter(
            ColeccionAlimentoRelacion.coleccion_id == coleccion_id,
            ColeccionAlimentoRelacion.alimento_id == alimento_id
        ).first()

        if ya_existe:
            continue

        db.add(ColeccionAlimentoRelacion(
            coleccion_id=coleccion_id,
            alimento_id=alimento_id
        ))


# ─────────────────────────────────────────────────────
#  Servicios públicos
# ─────────────────────────────────────────────────────

def crear_coleccion_alimentos(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)

    if not datos.titulo or not datos.titulo.strip():
        raise HTTPException(
            status_code=400,
            detail="El título de la colección es obligatorio"
        )

    nueva = ColeccionAlimentos(
        id_tienda=tienda.id,
        titulo=datos.titulo.strip(),
        descripcion=datos.descripcion.strip() if datos.descripcion else None
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    if datos.alimento_ids:
        _agregar_alimentos(db, nueva.id, tienda.id, datos.alimento_ids)
        db.commit()

    Crearnotificaion(db, tienda.id, "Se creo una coleccion de alimentos", "colecciones")

    return {
        "id": nueva.id,
        "titulo": nueva.titulo,
        "mensaje": "Colección creada correctamente"
    }


def traer_colecciones_alimentos(db, id_usuario: int):
    tienda = _validar_tienda_alimentos(db, id_usuario)

    colecciones = db.query(ColeccionAlimentos).filter(
        ColeccionAlimentos.id_tienda == tienda.id
    ).order_by(ColeccionAlimentos.fecha_creacion.desc()).all()

    resultado = []
    for col in colecciones:
        relaciones = db.query(ColeccionAlimentoRelacion).filter(
            ColeccionAlimentoRelacion.coleccion_id == col.id
        ).all()
        alimento_ids = [r.alimento_id for r in relaciones]

        resultado.append({
            "id": col.id,
            "titulo": col.titulo,
            "descripcion": col.descripcion,
            "estado": col.estado,
            "fecha_creacion": col.fecha_creacion,
            "total_alimentos": len(alimento_ids),
            "alimento_ids": alimento_ids
        })

    return resultado


def traer_alimentos_coleccion(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    coleccion = _validar_coleccion(db, datos.coleccion_id, tienda.id)

    relaciones = db.query(ColeccionAlimentoRelacion).filter(
        ColeccionAlimentoRelacion.coleccion_id == coleccion.id
    ).all()

    alimento_ids = [r.alimento_id for r in relaciones]

    alimentos = db.query(Alimento).filter(
        Alimento.id.in_(alimento_ids)
    ).all() if alimento_ids else []

    return {
        "coleccion_id": coleccion.id,
        "titulo": coleccion.titulo,
        "alimentos": [
            {
                "id": a.id,
                "nombre": a.nombre,
                "descripcion": a.descripcion,
                "precio": a.precio,
                "imagen": a.imagen,
                "disponible": a.disponible
            }
            for a in alimentos
        ]
    }


def agregar_alimentos_coleccion(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    _validar_coleccion(db, datos.coleccion_id, tienda.id)

    if not datos.alimento_ids:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar al menos un alimento para agregar"
        )

    _agregar_alimentos(db, datos.coleccion_id, tienda.id, datos.alimento_ids)
    db.commit()
    Crearnotificaion(db, tienda.id, "Se agregaron alimentos a una coleccion", "colecciones")

    return {"mensaje": "Alimentos agregados a la colección correctamente"}


def quitar_alimento_coleccion(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    _validar_coleccion(db, datos.coleccion_id, tienda.id)

    relacion = db.query(ColeccionAlimentoRelacion).filter(
        ColeccionAlimentoRelacion.coleccion_id == datos.coleccion_id,
        ColeccionAlimentoRelacion.alimento_id == datos.alimento_id
    ).first()

    if not relacion:
        raise HTTPException(
            status_code=404,
            detail="El alimento no pertenece a esta colección"
        )

    db.delete(relacion)
    db.commit()
    Crearnotificaion(db, tienda.id, "Se elimino un alimento de una coleccion", "colecciones")

    return {"mensaje": "Alimento eliminado de la colección correctamente"}


def actualizar_coleccion_alimentos(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    coleccion = _validar_coleccion(db, datos.id, tienda.id)

    if datos.titulo is not None:
        titulo = datos.titulo.strip()
        if not titulo:
            raise HTTPException(
                status_code=400,
                detail="El título no puede estar vacío"
            )
        coleccion.titulo = titulo

    if datos.descripcion is not None:
        coleccion.descripcion = datos.descripcion.strip() or None

    db.commit()
    db.refresh(coleccion)
    Crearnotificaion(db, tienda.id, "Se actualizo una coleccion de alimentos", "colecciones")

    return {
        "id": coleccion.id,
        "titulo": coleccion.titulo,
        "descripcion": coleccion.descripcion,
        "mensaje": "Colección actualizada correctamente"
    }


def cambiar_estado_coleccion_alimentos(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    coleccion = _validar_coleccion(db, datos.id, tienda.id)

    coleccion.estado = not coleccion.estado
    db.commit()
    db.refresh(coleccion)
    Crearnotificaion(db, tienda.id, "Se cambio el estado de una coleccion de alimentos", "colecciones")

    texto = "activada" if coleccion.estado else "desactivada"
    return {
        "id": coleccion.id,
        "titulo": coleccion.titulo,
        "estado": coleccion.estado,
        "mensaje": f"Colección {texto} correctamente"
    }


def eliminar_coleccion_alimentos(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    coleccion = _validar_coleccion(db, datos.id, tienda.id)

    # Eliminar primero todas las relaciones
    db.query(ColeccionAlimentoRelacion).filter(
        ColeccionAlimentoRelacion.coleccion_id == coleccion.id
    ).delete()

    db.delete(coleccion)
    db.commit()
    Crearnotificaion(db, tienda.id, "Se elimino una coleccion de alimentos", "colecciones")

    return {"mensaje": "Colección eliminada correctamente"}
