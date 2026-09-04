from fastapi import HTTPException
from models.pedidos_alimentos import PedidoAlimento, PedidoAlimentoItem
from models.alimentos import Alimento
from models.shop import Shop
from schemas.pedidos_alimentos import ESTADOS_PERMITIDOS
from services.notificaciones import Crearnotificaion


# ─────────────────────────────────────────────────────
#  Helpers privados
# ─────────────────────────────────────────────────────

def _validar_tienda_alimentos(db, id_usuario: int) -> Shop:
    """
    Verifica que el usuario tenga una tienda de alimentos.
    Lanza HTTPException si no existe o si la actividad no corresponde.
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


def _validar_pedido(db, pedido_id: int, tienda_id: int) -> PedidoAlimento:
    """Verifica que el pedido exista y pertenezca a la tienda."""
    pedido = db.query(PedidoAlimento).filter(
        PedidoAlimento.id == pedido_id,
        PedidoAlimento.id_tienda == tienda_id
    ).first()

    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado o no pertenece a tu tienda"
        )

    return pedido


# ─────────────────────────────────────────────────────
#  Traer pedidos
# ─────────────────────────────────────────────────────

def traer_pedidos_alimentos(db, id_usuario: int):
    tienda = _validar_tienda_alimentos(db, id_usuario)

    pedidos = (
        db.query(PedidoAlimento)
        .filter(PedidoAlimento.id_tienda == tienda.id)
        .order_by(PedidoAlimento.fecha_creacion.desc())
        .all()
    )

    resultado = []
    for pedido in pedidos:
        items = db.query(PedidoAlimentoItem).filter(
            PedidoAlimentoItem.pedido_id == pedido.id
        ).all()

        resultado.append({
            "id":             pedido.id,
            "estado":         pedido.estado,
            "nombre":         pedido.nombre,
            "apellidos":      pedido.apellidos,
            "telefono":       pedido.telefono,
            "direccion":      pedido.direccion,
            "domicilio":      pedido.domicilio,
            "total":          pedido.total,
            "fecha_creacion": pedido.fecha_creacion,
            "total_items":    sum(i.cantidad for i in items),
        })

    return resultado


# ─────────────────────────────────────────────────────
#  Ver detalle de un pedido
# ─────────────────────────────────────────────────────

def ver_detalle_pedido_alimento(db, datos):
    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    pedido = _validar_pedido(db, datos.pedido_id, tienda.id)

    items = db.query(PedidoAlimentoItem).filter(
        PedidoAlimentoItem.pedido_id == pedido.id
    ).all()

    lineas = []
    for item in items:
        alimento = db.query(Alimento).filter(Alimento.id == item.alimento_id).first()
        lineas.append({
            "id":              item.id,
            "alimento_id":     item.alimento_id,
            "nombre":          alimento.nombre        if alimento else None,
            "imagen":          alimento.imagen        if alimento else None,
            "cantidad":        item.cantidad,
            "precio_unitario": item.precio_unitario,
            "subtotal":        item.precio_unitario * item.cantidad,
        })

    return {
        "id":             pedido.id,
        "estado":         pedido.estado,
        "nombre":         pedido.nombre,
        "apellidos":      pedido.apellidos,
        "telefono":       pedido.telefono,
        "direccion":      pedido.direccion,
        "domicilio":      pedido.domicilio,
        "total":          pedido.total,
        "fecha_creacion": pedido.fecha_creacion,
        "items":          lineas,
    }


# ─────────────────────────────────────────────────────
#  Cambiar estado del pedido
# ─────────────────────────────────────────────────────

def cambiar_estado_pedido_alimento(db, datos):
    # Validar que el estado sea uno de los permitidos
    if datos.estado not in ESTADOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=f"Estado no válido. Opciones: {', '.join(ESTADOS_PERMITIDOS)}"
        )

    tienda = _validar_tienda_alimentos(db, datos.id_usuario)
    pedido = _validar_pedido(db, datos.pedido_id, tienda.id)

    pedido.estado = datos.estado
    db.commit()
    db.refresh(pedido)
    Crearnotificaion(db, tienda.id, f"Se cambio el estado del pedido a {pedido.estado}", "pedidos")

    return {
        "id":      pedido.id,
        "estado":  pedido.estado,
        "mensaje": f"Estado actualizado a '{pedido.estado}' correctamente"
    }
