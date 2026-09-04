from fastapi import HTTPException
from models.combos import Combo, ComboAlimento
from models.alimentos import Alimento
from models.shop import Shop
from services.notificaciones import Crearnotificaion


# ─────────────────────────────────────────────────────
#  Helpers privados
# ─────────────────────────────────────────────────────

def _validar_tienda_alimentos(db, id_usuario: int) -> Shop:
    """
    Verifica que el usuario tenga una tienda y que sea de 'Venta de alimentos'.
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


def _validar_combo(db, combo_id: int, tienda_id: int) -> Combo:
    """Verifica que el combo exista y pertenezca a la tienda del usuario."""
    combo = db.query(Combo).filter(
        Combo.id == combo_id,
        Combo.id_tienda == tienda_id
    ).first()

    if not combo:
        raise HTTPException(
            status_code=404,
            detail="Combo no encontrado o no pertenece a tu tienda"
        )

    return combo


def _validar_alimento(db, alimento_id: int, tienda_id: int) -> Alimento:
    """Verifica que el alimento exista y pertenezca a la tienda."""
    alimento = db.query(Alimento).filter(
        Alimento.id == alimento_id,
        Alimento.id_tienda == tienda_id
    ).first()

    if not alimento:
        raise HTTPException(
            status_code=404,
            detail=f"Alimento #{alimento_id} no encontrado o no pertenece a tu tienda"
        )

    return alimento


def _agregar_alimentos_a_combo(db, combo_id: int, tienda_id: int, items: list):
    """
    Agrega alimentos a un combo.
    - Verifica que cada alimento pertenezca a la tienda.
    - Si ya existe la relación actualiza la cantidad.
    - Si cantidad <= 0 la omite.
    """
    for item in items:
        if item.cantidad <= 0:
            continue

        # Validar que el alimento es de esta tienda
        alimento = db.query(Alimento).filter(
            Alimento.id == item.alimento_id,
            Alimento.id_tienda == tienda_id
        ).first()

        if not alimento:
            # Alimento no válido → se ignora silenciosamente
            continue

        relacion = db.query(ComboAlimento).filter(
            ComboAlimento.combo_id == combo_id,
            ComboAlimento.alimento_id == item.alimento_id
        ).first()

        if relacion:
            # Ya existe → actualizar cantidad
            relacion.cantidad = item.cantidad
        else:
            db.add(ComboAlimento(
                combo_id=combo_id,
                alimento_id=item.alimento_id,
                cantidad=item.cantidad
            ))


def _serializar_combo(db, combo: Combo) -> dict:
    """Devuelve un dict con los datos del combo + sus alimentos."""
    relaciones = db.query(ComboAlimento).filter(
        ComboAlimento.combo_id == combo.id
    ).all()

    alimentos = []
    for rel in relaciones:
        ali = db.query(Alimento).filter(Alimento.id == rel.alimento_id).first()
        alimentos.append({
            "relacion_id": rel.id,
            "alimento_id": rel.alimento_id,
            "nombre":      ali.nombre     if ali else None,
            "imagen":      ali.imagen     if ali else None,
            "precio":      ali.precio     if ali else None,
            "cantidad":    rel.cantidad,
        })

    return {
        "id":             combo.id,
        "nombre":         combo.nombre,
        "descripcion":    combo.descripcion,
        "precio":         combo.precio,
        "estado":         combo.estado,
        "fecha_creacion": combo.fecha_creacion,
        "total_alimentos": len(alimentos),
        "alimentos":      alimentos,
    }


# ─────────────────────────────────────────────────────
#  Servicios públicos
# ─────────────────────────────────────────────────────

def crear_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)

    if not datos.nombre or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre del combo es obligatorio")

    if datos.precio < 0:
        raise HTTPException(status_code=400, detail="El precio no puede ser negativo")

    nuevo = Combo(
        id_tienda=tienda.id,
        nombre=datos.nombre.strip(),
        descripcion=datos.descripcion.strip() if datos.descripcion else None,
        precio=datos.precio,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    if datos.alimentos:
        _agregar_alimentos_a_combo(db, nuevo.id, tienda.id, datos.alimentos)
        db.commit()

    Crearnotificaion(db, tienda.id, "Se creo un combo", "promociones")

    return {
        "id":      nuevo.id,
        "nombre":  nuevo.nombre,
        "mensaje": "Combo creado correctamente"
    }


def traer_combos(db, id_usuario: int):
    tienda = _validar_tienda_alimentos(db, id_usuario)

    combos = (
        db.query(Combo)
        .filter(Combo.id_tienda == tienda.id)
        .order_by(Combo.fecha_creacion.desc())
        .all()
    )

    return [_serializar_combo(db, c) for c in combos]


def traer_alimentos_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    combo  = _validar_combo(db, datos.combo_id, tienda.id)
    return _serializar_combo(db, combo)


def actualizar_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    combo  = _validar_combo(db, datos.id, tienda.id)

    if datos.nombre is not None:
        nombre = datos.nombre.strip()
        if not nombre:
            raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
        combo.nombre = nombre

    if datos.descripcion is not None:
        combo.descripcion = datos.descripcion.strip() or None

    if datos.precio is not None:
        if datos.precio < 0:
            raise HTTPException(status_code=400, detail="El precio no puede ser negativo")
        combo.precio = datos.precio

    db.commit()
    db.refresh(combo)
    Crearnotificaion(db, tienda.id, "Se actualizo un combo", "promociones")

    return {
        "id":      combo.id,
        "nombre":  combo.nombre,
        "precio":  combo.precio,
        "mensaje": "Combo actualizado correctamente"
    }


def agregar_alimentos_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    _validar_combo(db, datos.combo_id, tienda.id)

    if not datos.alimentos:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar al menos un alimento para agregar"
        )

    _agregar_alimentos_a_combo(db, datos.combo_id, tienda.id, datos.alimentos)
    db.commit()
    Crearnotificaion(db, tienda.id, "Se agregaron alimentos a un combo", "promociones")

    return {"mensaje": "Alimentos agregados al combo correctamente"}


def quitar_alimento_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    _validar_combo(db, datos.combo_id, tienda.id)

    # Verificar que el alimento también pertenece a la tienda
    _validar_alimento(db, datos.alimento_id, tienda.id)

    relacion = db.query(ComboAlimento).filter(
        ComboAlimento.combo_id == datos.combo_id,
        ComboAlimento.alimento_id == datos.alimento_id
    ).first()

    if not relacion:
        raise HTTPException(
            status_code=404,
            detail="El alimento no pertenece a este combo"
        )

    db.delete(relacion)
    db.commit()
    Crearnotificaion(db, tienda.id, "Se elimino un alimento de un combo", "promociones")

    return {"mensaje": "Alimento quitado del combo correctamente"}


def cambiar_estado_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    combo  = _validar_combo(db, datos.id, tienda.id)

    combo.estado = not combo.estado
    db.commit()
    db.refresh(combo)
    Crearnotificaion(db, tienda.id, "Se cambio el estado de un combo", "promociones")

    texto = "activado" if combo.estado else "desactivado"
    return {
        "id":      combo.id,
        "estado":  combo.estado,
        "mensaje": f"Combo {texto} correctamente"
    }


def eliminar_combo(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    combo  = _validar_combo(db, datos.id, tienda.id)

    # Eliminar primero todas las relaciones
    db.query(ComboAlimento).filter(
        ComboAlimento.combo_id == combo.id
    ).delete()

    db.delete(combo)
    db.commit()
    Crearnotificaion(db, tienda.id, "Se elimino un combo", "promociones")

    return {"mensaje": "Combo eliminado correctamente"}
