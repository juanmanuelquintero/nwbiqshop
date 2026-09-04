from models.pedidos import Pedido, PedidoProducto
from models.shop import Shop
from models.products import Producto, ProductoSimple, ProductoVariante, ProductoColores
from models.promociones import Promocion, PromocionProducto, PromocionUnitaria
from fastapi import HTTPException
from models.alpormayor import AlPorMayor
from services.notificaciones import Crearnotificaion


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

    buscar_alpormayor = db.query(AlPorMayor).filter(AlPorMayor.id_tienda == tienda.id).first()

    # 2. Crear la cabecera del pedido
    pedido = Pedido(
        id_tienda=tienda.id,
        estado="pendiente",
        correocliente=datos.correo,
        totalcompra=0,
        nombresyapellidos=datos.nombresyapellidos,
        telefonocliente=datos.telefono,
        ciudadcliente=datos.ciudad,
        direccioncliente=datos.direccion,
    )
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    total = 0
    no_agregados = []

    # El precio mayorista solo aplica si todo el pedido válido pertenece al
    # mismo tipo de producto y alcanza la cantidad mínima configurada.
    productos_validos = {}
    cantidades_por_tipo = {}
    tipos_validos = set()
    for indice, item in enumerate(datos.productos):
        producto = db.query(Producto).filter(
            Producto.id == item.producto_id,
            Producto.id_tienda == tienda.id,
            Producto.estado == True,
        ).first()
        if producto and producto.tipo == item.tipo:
            productos_validos[indice] = producto
            tipos_validos.add(producto.tipo)
            cantidades_por_tipo[producto.tipo] = (
                cantidades_por_tipo.get(producto.tipo, 0) + item.cantidad
            )

    cantidad_minima = (
        int(buscar_alpormayor.cantidad_minima)
        if buscar_alpormayor and buscar_alpormayor.cantidad_minima is not None
        else 0
    )
    mayorista_activo = (
        buscar_alpormayor is not None
        and buscar_alpormayor.estado is True
        and len(tipos_validos) == 1
        and cantidad_minima > 0
        and cantidades_por_tipo[next(iter(tipos_validos))] >= cantidad_minima
    )

    for indice, item in enumerate(datos.productos):
        # 3. Verificar que el producto pertenece a la tienda y está activo
        producto = productos_validos.get(indice)

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
        precio_base = producto.precio
        if mayorista_activo and producto.precio_alpormayor is not None:
            precio_base = producto.precio_alpormayor

        precio_unit = _precio_con_descuento(
            db, tienda.id, producto.id, precio_base
        )
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

    Crearnotificaion(db, tienda.id, "Se hizo un pedido", "pedidos")
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


def traerproductospedidos(db, id_pedido):
    """Retorna los productos de un pedido con su variante seleccionada."""
    pedido = db.query(Pedido).filter(Pedido.id == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")

    lineas = db.query(PedidoProducto).filter(
        PedidoProducto.pedido_id == pedido.id
    ).all()
    productos = {
        producto.id: producto
        for producto in db.query(Producto).filter(
            Producto.id.in_([linea.producto_id for linea in lineas])
        ).all()
    } if lineas else {}

    ids_variantes = [
        linea.id_variante for linea in lineas
        if productos.get(linea.producto_id)
        and productos[linea.producto_id].tipo == "variantes"
        and linea.id_variante is not None
    ]
    variantes = {
        variante.id: variante
        for variante in db.query(ProductoVariante).filter(
            ProductoVariante.id.in_(ids_variantes)
        ).all()
    } if ids_variantes else {}

    colores = {
        color.id: color
        for color in db.query(ProductoColores).filter(
            ProductoColores.id.in_(
                [variante.producto_idcolor for variante in variantes.values()]
            )
        ).all()
    } if variantes else {}

    ids_simples = [
        linea.id_variante for linea in lineas
        if productos.get(linea.producto_id)
        and productos[linea.producto_id].tipo != "variantes"
        and linea.id_variante is not None
    ]
    simples = {
        simple.id: simple
        for simple in db.query(ProductoSimple).filter(
            ProductoSimple.id.in_(ids_simples)
        ).all()
    } if ids_simples else {}

    detalle = []
    for linea in lineas:
        producto = productos.get(linea.producto_id)
        if not producto:
            detalle.append({
                "linea_id": linea.id,
                "producto_id": linea.producto_id,
                "cantidad": linea.cantidad,
                "variante": None,
            })
            continue

        variante = None
        if producto.tipo == "variantes":
            variante_db = variantes.get(linea.id_variante)
            color = colores.get(variante_db.producto_idcolor) if variante_db else None
            if variante_db:
                variante = {
                    "id": variante_db.id,
                    "talla": variante_db.talla,
                    "color": color.color if color else None,
                    "marca": color.marca if color else None,
                    "referencia": color.referencia if color else None,
                    "imagen": color.imagen if color else None,
                }
        else:
            simple = simples.get(linea.id_variante)
            if simple:
                variante = {
                    "id": simple.id,
                    "marca": simple.marca,
                    "referencia": simple.referencia,
                    "imagen": simple.imagen,
                }

        detalle.append({
            "linea_id": linea.id,
            "producto_id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "tipo": producto.tipo,
            "precio_unitario": producto.precio,
            "cantidad": linea.cantidad,
            "subtotal": producto.precio * linea.cantidad,
            "variante": variante,
        })

    return {
        "pedido_id": pedido.id,
        "estado": pedido.estado,
        "total": pedido.totalcompra,
        "productos": detalle,
    }


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

    estado_anterior = pedido.estado
    if estado_anterior == "cancelado":
        raise HTTPException(
            status_code=400,
            detail="El pedido ya está cancelado y no se puede revertir."
        )

    descontar_stock = estado_anterior != "confirmado" and datos.estado == "confirmado"
    devolver_stock = estado_anterior in ("confirmado", "enviado") and datos.estado == "cancelado"

    if descontar_stock or devolver_stock:
        lineas = db.query(PedidoProducto).filter(
            PedidoProducto.pedido_id == pedido.id
        ).all()

        ajustes_stock = []
        for linea in lineas:
            producto = db.query(Producto).filter(
                Producto.id == linea.producto_id,
                Producto.id_tienda == tienda.id,
            ).first()
            if not producto:
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto {linea.producto_id} del pedido no existe en la tienda."
                )

            if producto.tipo == "variantes":
                stock = db.query(ProductoVariante).join(
                    ProductoColores,
                    ProductoColores.id == ProductoVariante.producto_idcolor,
                ).filter(
                    ProductoVariante.id == linea.id_variante,
                    ProductoColores.producto_id == producto.id,
                ).first()
            else:
                stock = db.query(ProductoSimple).filter(
                    ProductoSimple.id == linea.id_variante,
                    ProductoSimple.producto_id == producto.id,
                ).first()

            if not stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se encontró la variante del producto '{producto.nombre}'."
                )

            if descontar_stock and stock.cantidad < linea.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{producto.nombre}'. "
                           f"Disponible: {stock.cantidad}."
                )

            ajustes_stock.append((stock, linea.cantidad))

        for stock, cantidad in ajustes_stock:
            stock.cantidad += -cantidad if descontar_stock else cantidad

    pedido.estado = datos.estado
    db.commit()
    db.refresh(pedido)
    Crearnotificaion(db, tienda.id, f"Se cambio el estado del pedido a {pedido.estado}", "pedidos")

    return {"mensaje": "Estado del pedido actualizado.", "estado": pedido.estado}

def buscarpedidos(db, datos):

    if datos.correo:
        buscarpedidoscorreo = db.query(Pedido).filter(
            Pedido.correocliente == datos.correo
        ).all()
        
        listadepedidoscorreo = []
        for pc in buscarpedidoscorreo:
            buscartelefono = db.query(Shop).filter(
                    Shop.id == pc.id_tienda
                ).first()
            listadepedidoscorreo.append({
                "id": pc.id,
                "estado": pc.estado,
                "numeroguia": pc.numeroguia,
                "totalcompra": pc.totalcompra,
                "nombresyapellidos": pc.nombresyapellidos,
                "telefonocliente": pc.telefonocliente,
                "ciudadcliente": pc.ciudadcliente,
                "direccioncliente": pc.direccioncliente,
                "fecha_creacion": pc.fecha_creacion,
                "telefonotienda": buscartelefono.telefono

            })
        return listadepedidoscorreo

    if datos.telefono:
        buscarpedidostelefono = db.query(Pedido).filter(
            Pedido.telefonocliente == datos.telefono
        ).all()

        listadepedidostelefono = []

        for pt in buscarpedidostelefono:
            buscartelefono = db.query(Shop).filter(
                    Shop.id == pt.id_tienda
                ).first()
            
            listadepedidostelefono.append({
                "id": pt.id,
                "estado": pt.estado,
                "numeroguia": pt.numeroguia,
                "totalcompra": pt.totalcompra,
                "nombresyapellidos": pt.nombresyapellidos,
                "telefonocliente": pt.telefonocliente,
                "ciudadcliente": pt.ciudadcliente,
                "direccioncliente": pt.direccioncliente,
                "fecha_creacion": pt.fecha_creacion,
                "telefonotienda": buscartelefono.telefono

            })
        return listadepedidostelefono


def asignarnumeroguia(db, datos):
    buscratienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscratienda:
            raise HTTPException(status_code=400, detail="error no se tiene ninguna tienda asociada")
    
    buscarpedido = db.query(Pedido).filter(
        Pedido.id == datos.id_pedido,
        Pedido.id_tienda == buscratienda.id
    ).first()

    if not buscarpedido:
        raise HTTPException(status_code=400, detail="error no se puedo encontrar el pedido en la db")

    buscarpedido.numeroguia = datos.numeroguia

    db.commit()
    Crearnotificaion(db, buscratienda.id, "Se asigno un numero de guia", "pedidos")

    return "se asigno un nuero de guia correctamente"

def cantidadpedidos(db, id_usuario):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no se tiene ninguna tienda asociada")

    cantidadpedidos = db.query(Pedido).filter(
        Pedido.id_tienda == buscartienda.id
    ).all()

    return len(cantidadpedidos)
