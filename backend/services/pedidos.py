from models.pedidos import Pedido, PedidoProducto
from models.shop import Shop
from models.products import Producto, ProductoSimple, ProductoVariante, ProductoColores
from models.promociones import Promocion, PromocionProducto, PromocionUnitaria
from fastapi import HTTPException


# ── Helpers ─────────────────────────────────────────────────────────────────

def _buscar_tienda_por_dominio(db, dominio: str) -> Shop:
    tienda = db.query(Shop).filter(Shop.dominio == dominio).first()
    if not tienda:
        raise HTTPException(status_code=404, detail="No se encontró una tienda con ese dominio.")
    if not tienda.estado:
        raise HTTPException(status_code=403, detail="Esta tienda no está disponible.")
    return tienda


def _precio_con_descuento(db, tienda_id: int, producto_id: int, precio_base: int) -> int:
    """Devuelve el precio final aplicando promo general o unitaria si existe."""
    promo = db.query(Promocion).filter(
        Promocion.id_tienda == tienda_id,
        Promocion.estado == True
    ).first()

    if promo:
        en_promo = db.query(PromocionProducto).filter(
            PromocionProducto.promocion_id == promo.id,
            PromocionProducto.producto_id == producto_id
        ).first()
        if en_promo:
            return round(precio_base * (1 - promo.descuento / 100))

    promo_unit = db.query(PromocionUnitaria).filter(
        PromocionUnitaria.id_producto == producto_id,
        PromocionUnitaria.estado == True
    ).first()
    if promo_unit:
        return round(precio_base * (1 - promo_unit.descuento / 100))

    return precio_base


# ── Crear pedido ─────────────────────────────────────────────────────────────

def hacerpedido(db, datos):
    # 1. Localizar la tienda por dominio
    tienda = _buscar_tienda_por_dominio(db, datos.dominio)

    # 2. Crear la cabecera del pedido
    pedido = Pedido(
        id_tienda=tienda.id,
        estado="pendiente",
        correocliente=datos.correo,
        totalcompra=0,
    )
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    total = 0
    no_agregados = []

    for item in datos.productos:
        # 3. Verificar que el producto pertenece a la tienda y está activo
        producto = db.query(Producto).filter(
            Producto.id == item.producto_id,
            Producto.id_tienda == tienda.id,
            Producto.estado == True,
        ).first()

        if not producto:
            no_agregados.append(item.producto_id)
            continue

        # 4. Verificar que la variante/simple existe y tiene stock suficiente
        if item.tipo == "variantes":
            # Nueva cadena: ProductoVariante → ProductoColores → Producto
            variante = db.query(ProductoVariante).filter(
                ProductoVariante.id == item.id_variante,
            ).first()
            if not variante:
                no_agregados.append(item.producto_id)
                continue
            # Verificar que pertenece al producto via ProductoColores
            color = db.query(ProductoColores).filter(
                ProductoColores.id == variante.producto_idcolor,
                ProductoColores.producto_id == producto.id,
            ).first()
            if not color:
                no_agregados.append(item.producto_id)
                continue
            if variante.cantidad < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{producto.nombre}' "
                           f"(talla {variante.talla} / color {color.color}). "
                           f"Disponible: {variante.cantidad}."
                )
        else:
            simple = db.query(ProductoSimple).filter(
                ProductoSimple.id == item.id_variante,
                ProductoSimple.producto_id == producto.id,
            ).first()
            if not simple:
                no_agregados.append(item.producto_id)
                continue
            if simple.cantidad < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{producto.nombre}'. "
                           f"Disponible: {simple.cantidad}."
                )

        # 5. Calcular precio con descuento y acumular total
        precio_unit = _precio_con_descuento(db, tienda.id, producto.id, producto.precio)
        total += precio_unit * item.cantidad

        # 6. Registrar línea de pedido
        linea = PedidoProducto(
            pedido_id=pedido.id,
            producto_id=producto.id,
            id_variante=item.id_variante,
            cantidad=item.cantidad,
            id_tienda=tienda.id,
        )
        db.add(linea)

    # 7. Actualizar total en la cabecera
    pedido.totalcompra = round(total)
    db.commit()

    return {
        "mensaje": "Pedido creado correctamente.",
        "pedido_id": pedido.id,
        "total": round(total),
        "productos_no_agregados": no_agregados,
    }


# ── Traer pedidos (panel vendedor) ───────────────────────────────────────────

def traerpedidos(db, id_usuario):
    tienda = db.query(Shop).filter(Shop.usuario_id == id_usuario).first()
    if not tienda:
        raise HTTPException(status_code=400, detail="El usuario no tiene una tienda asociada.")

    pedidos = db.query(Pedido).filter(
        Pedido.id_tienda == tienda.id
    ).order_by(Pedido.fecha_creacion.desc()).all()

    return pedidos


# ── Ver detalle de un pedido ─────────────────────────────────────────────────

def verdetalledelpedidotendero(db, datos):
    tienda = db.query(Shop).filter(Shop.usuario_id == datos.id_usuario).first()
    if not tienda:
        raise HTTPException(status_code=400, detail="El usuario no tiene una tienda asociada.")

    pedido = db.query(Pedido).filter(
        Pedido.id_tienda == tienda.id,
        Pedido.id == datos.id_pedido
    ).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")

    lineas = db.query(PedidoProducto).filter(
        PedidoProducto.pedido_id == pedido.id
    ).all()

    # Enriquecer cada línea con datos del producto y la variante
    detalle = []
    for linea in lineas:
        prod = db.query(Producto).filter(Producto.id == linea.producto_id).first()

        info_variante = None
        if prod and prod.tipo == "variantes":
            # Nueva cadena: id_variante = ProductoVariante.id
            v = db.query(ProductoVariante).filter(
                ProductoVariante.id == linea.id_variante
            ).first()
            if v:
                # Subir a ProductoColores para obtener color e imagen
                c = db.query(ProductoColores).filter(
                    ProductoColores.id == v.producto_idcolor
                ).first()
                info_variante = {
                    "id_variante":  v.id,
                    "talla":        v.talla,
                    "color":        c.color        if c else None,
                    "imagen":       c.imagen       if c else None,
                    "marca":        c.marca        if c else None,
                    "referencia":   c.referencia   if c else None,
                    "id_color":     c.id           if c else None,
                }
        elif prod:
            s = db.query(ProductoSimple).filter(
                ProductoSimple.id == linea.id_variante
            ).first()
            if s:
                info_variante = {
                    "id":         s.id,
                    "referencia": s.referencia,
                    "imagen":     s.imagen,
                }

        detalle.append({
            "linea_id": linea.id,
            "producto_id": linea.producto_id,
            "nombre": prod.nombre if prod else None,
            "precio_unitario": prod.precio if prod else None,
            "cantidad": linea.cantidad,
            "subtotal": (prod.precio * linea.cantidad) if prod else None,
            "variante": info_variante,
        })

    return {
        "pedido_id": pedido.id,
        "estado": pedido.estado,
        "total": pedido.totalcompra,
        "correo": pedido.correocliente,
        "fecha": str(pedido.fecha_creacion),
        "productos": detalle,
    }


# ── Cambiar estado ───────────────────────────────────────────────────────────

def cambiarestadopedido(db, datos):
    tienda = db.query(Shop).filter(Shop.usuario_id == datos.id_usuario).first()
    if not tienda:
        raise HTTPException(status_code=400, detail="El usuario no tiene una tienda asociada.")

    pedido = db.query(Pedido).filter(
        Pedido.id_tienda == tienda.id,
        Pedido.id == datos.id_pedido
    ).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")

    pedido.estado = datos.estado
    db.commit()
    db.refresh(pedido)

    return {"mensaje": "Estado del pedido actualizado.", "estado": pedido.estado}
