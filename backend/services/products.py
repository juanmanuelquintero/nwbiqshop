from models.products import Producto, ProductoSimple, ProductoColores, ProductoVariante
from models.shop import Shop
from fastapi import HTTPException
from sqlalchemy import func


# ── Helpers ──────────────────────────────────────────────────────────────────

def _verificar_propiedad(db, id_usuario: int, producto_id: int) -> Producto:
    """Verifica que el usuario tenga tienda y que el producto le pertenezca."""
    tienda = db.query(Shop).filter(Shop.usuario_id == id_usuario).first()
    if not tienda:
        raise HTTPException(status_code=403, detail="No tienes una tienda asociada a tu cuenta.")

    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    if producto.id_tienda != tienda.id:
        raise HTTPException(status_code=403, detail="Este producto no pertenece a tu tienda.")

    return producto


def _verificar_color(db, id_usuario: int, id_color: int) -> ProductoColores:
    """Verifica que el color exista y pertenezca a una tienda del usuario."""
    color = db.query(ProductoColores).filter(ProductoColores.id == id_color).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color no encontrado.")
    _verificar_propiedad(db, id_usuario, color.producto_id)
    return color


def _stock_variantes(db, producto_id: int) -> int:
    """Stock total de un producto con variantes sumando a través de colores."""
    colores = db.query(ProductoColores).filter(
        ProductoColores.producto_id == producto_id
    ).all()
    total = 0
    for c in colores:
        s = db.query(func.sum(ProductoVariante.cantidad)).filter(
            ProductoVariante.producto_idcolor == c.id
        ).scalar() or 0
        total += s
    return total


def _primera_imagen_variante(db, producto_id: int) -> str | None:
    """Devuelve la primera imagen disponible entre todos los colores del producto."""
    color = db.query(ProductoColores).filter(
        ProductoColores.producto_id == producto_id,
        ProductoColores.imagen.isnot(None)
    ).first()
    return color.imagen if color else None


# ── Crear producto ────────────────────────────────────────────────────────────

def crearproducto(db, datos):
    tienda = db.query(Shop).filter(Shop.usuario_id == datos.id_usuario).first()
    if not tienda:
        raise HTTPException(status_code=403, detail="No tienes una tienda asociada a tu cuenta.")

    nuevo = Producto(
        id_tienda=tienda.id,
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        precio=datos.precio,
        tipo=datos.tipo,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    if datos.tipo == "variantes":
        # Crear el primer color
        nuevo_color = ProductoColores(
            producto_id=nuevo.id,
            color=getattr(datos, "color", None),
            marca=getattr(datos, "marca", None),
            referencia=getattr(datos, "referencia", None),
            imagen=getattr(datos, "imagen", None),
        )
        db.add(nuevo_color)
        db.commit()
        db.refresh(nuevo_color)

        # Crear la primera talla bajo ese color
        nueva_variante = ProductoVariante(
            producto_idcolor=nuevo_color.id,
            talla=getattr(datos, "talla", None),
            cantidad=datos.cantidad,
        )
        db.add(nueva_variante)
        db.commit()
    else:
        ps = ProductoSimple(
            producto_id=nuevo.id,
            cantidad=datos.cantidad,
            marca=getattr(datos, "marca", None),
            referencia=getattr(datos, "referencia", None),
            imagen=getattr(datos, "imagen", None),
        )
        db.add(ps)
        db.commit()

    return {"id": nuevo.id, "mensaje": "Producto creado correctamente"}


# ── Traer productos ───────────────────────────────────────────────────────────

def traerproducto(db, id_usuario: int):
    tienda = db.query(Shop).filter(Shop.usuario_id == id_usuario).first()
    if not tienda:
        raise HTTPException(status_code=403, detail="No tienes una tienda asociada a tu cuenta.")

    productos = db.query(Producto).filter(Producto.id_tienda == tienda.id).all()

    resultado = []
    for p in productos:
        if p.tipo == "simple":
            simple = db.query(ProductoSimple).filter(ProductoSimple.producto_id == p.id).first()
            stock = simple.cantidad if simple else 0
        else:
            stock = _stock_variantes(db, p.id)

        resultado.append({
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "precio": p.precio,
            "tipo": p.tipo,
            "estado": p.estado,
            "stock": stock,
        })

    return resultado


# ── Agregar color a producto existente ────────────────────────────────────────

def agregarcolorexistente(db, datos):
    producto = _verificar_propiedad(db, datos.id_usuario, datos.producto_id)

    if producto.tipo != "variantes":
        raise HTTPException(status_code=400, detail="El producto no es de tipo variantes.")

    # No permitir duplicar el mismo color
    existe = db.query(ProductoColores).filter(
        ProductoColores.producto_id == datos.producto_id,
        ProductoColores.color == datos.color,
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe el color '{datos.color}' en este producto.")

    nuevo_color = ProductoColores(
        producto_id=datos.producto_id,
        color=datos.color,
        marca=datos.marca,
        referencia=datos.referencia,
        imagen=datos.imagen,
    )
    db.add(nuevo_color)
    db.commit()
    db.refresh(nuevo_color)

    return {
        "id": nuevo_color.id,
        "color": nuevo_color.color,
        "marca": nuevo_color.marca,
        "referencia": nuevo_color.referencia,
        "imagen": nuevo_color.imagen,
    }


# ── Agregar talla (variante) a un color existente ────────────────────────────

def agregarvarianteacolor(db, datos):
    color = _verificar_color(db, datos.id_usuario, datos.id_color)

    existe = db.query(ProductoVariante).filter(
        ProductoVariante.producto_idcolor == datos.id_color,
        ProductoVariante.talla == datos.talla,
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe la talla '{datos.talla}' en este color.")

    nueva = ProductoVariante(
        producto_idcolor=datos.id_color,
        talla=datos.talla,
        cantidad=datos.cantidad,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "id": nueva.id,
        "id_color": color.id,
        "color": color.color,
        "talla": nueva.talla,
        "cantidad": nueva.cantidad,
    }


# ── Actualizar producto ───────────────────────────────────────────────────────

def actualizarproducto(db, producto_id: int, datos):
    producto = _verificar_propiedad(db, datos.id_usuario, producto_id)

    if datos.nombre       is not None: producto.nombre       = datos.nombre
    if datos.descripcion  is not None: producto.descripcion  = datos.descripcion
    if datos.precio       is not None: producto.precio       = datos.precio
    if datos.estado       is not None: producto.estado       = datos.estado

    db.commit()
    db.refresh(producto)
    return {"id": producto.id, "nombre": producto.nombre, "descripcion": producto.descripcion,
            "precio": producto.precio, "estado": producto.estado}


# ── Cambiar estado (toggle) ───────────────────────────────────────────────────

def cambiarestadoproducto(db, producto_id: int, datos):
    producto = _verificar_propiedad(db, datos.id_usuario, producto_id)
    producto.estado = not producto.estado
    db.commit()
    db.refresh(producto)
    texto = "activado" if producto.estado else "desactivado"
    return {"id": producto.id, "nombre": producto.nombre, "estado": producto.estado,
            "mensaje": f"Producto {texto} correctamente."}


# ── Traer colores + tallas de un producto (panel admin) ──────────────────────

def TraerVariantesocantidadproductos(db, id_producto: int, id_usuario: int):
    _verificar_propiedad(db, id_usuario, id_producto)
    producto = db.query(Producto).filter(Producto.id == id_producto).first()

    if producto.tipo == "variantes":
        colores = db.query(ProductoColores).filter(
            ProductoColores.producto_id == id_producto
        ).all()
        resultado = []
        for c in colores:
            tallas = db.query(ProductoVariante).filter(
                ProductoVariante.producto_idcolor == c.id
            ).all()
            resultado.append({
                "id_color": c.id,
                "color": c.color,
                "marca": c.marca,
                "referencia": c.referencia,
                "imagen": c.imagen,
                "tallas": [{"id": t.id, "talla": t.talla, "cantidad": t.cantidad} for t in tallas],
            })
        return resultado

    return db.query(ProductoSimple).filter(
        ProductoSimple.producto_id == id_producto
    ).all()


# ── Modificar color ───────────────────────────────────────────────────────────

def modificarcolor(db, datos):
    color = _verificar_color(db, datos.id_usuario, datos.id_color)

    if datos.color      is not None: color.color      = datos.color
    if datos.marca      is not None: color.marca      = datos.marca
    if datos.referencia is not None: color.referencia = datos.referencia
    if datos.imagen is not None:
        color.imagen = None if datos.imagen == "" else datos.imagen

    db.commit()
    db.refresh(color)
    return {"id": color.id, "color": color.color, "marca": color.marca,
            "referencia": color.referencia, "imagen": color.imagen}


# ── Modificar variante (talla/cantidad) ──────────────────────────────────────

def modificarvariante(db, datos):
    variante = db.query(ProductoVariante).filter(ProductoVariante.id == datos.id).first()
    if not variante:
        raise HTTPException(status_code=404, detail="Variante no encontrada.")

    color = db.query(ProductoColores).filter(ProductoColores.id == variante.producto_idcolor).first()
    _verificar_propiedad(db, datos.id_usuario, color.producto_id)

    if datos.talla    is not None: variante.talla    = datos.talla
    if datos.cantidad is not None: variante.cantidad = datos.cantidad

    db.commit()
    db.refresh(variante)
    return {"id": variante.id, "talla": variante.talla, "cantidad": variante.cantidad}


# ── Modificar simple ──────────────────────────────────────────────────────────

def modificarsimple(db, datos):
    simple = db.query(ProductoSimple).filter(ProductoSimple.id == datos.id).first()
    if not simple:
        raise HTTPException(status_code=404, detail="Registro de stock no encontrado.")

    _verificar_propiedad(db, datos.id_usuario, simple.producto_id)

    if datos.cantidad   is not None: simple.cantidad   = datos.cantidad
    if datos.marca      is not None: simple.marca      = datos.marca
    if datos.referencia is not None: simple.referencia = datos.referencia
    if datos.imagen is not None:
        simple.imagen = None if datos.imagen == "" else datos.imagen

    db.commit()
    db.refresh(simple)
    return "Stock del producto simple modificado correctamente."


# ── Mirar colores/tallas (endpoint público del cliente) ──────────────────────

def mirarvariantesproducto(db, idproducto):
    producto = db.query(Producto).filter(Producto.id == idproducto, Producto.estado == True).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado o inactivo.")

    if producto.tipo == "variantes":
        colores = db.query(ProductoColores).filter(
            ProductoColores.producto_id == idproducto
        ).all()
        resultado = []
        for c in colores:
            tallas = db.query(ProductoVariante).filter(
                ProductoVariante.producto_idcolor == c.id
            ).all()
            resultado.append({
                "id": c.id,            # id del color (= id de la "variante" para el carrito)
                "color": c.color,
                "marca": c.marca,
                "referencia": c.referencia,
                "imagen": c.imagen,
                "tallas": [{"id": t.id, "talla": t.talla, "cantidad": t.cantidad} for t in tallas],
            })
        return resultado

    return db.query(ProductoSimple).filter(
        ProductoSimple.producto_id == idproducto
    ).all()


# ── Eliminar variante (talla) ─────────────────────────────────────────────────

def eliminarVariante(db, variante_id: int, id_usuario: int):
    variante = db.query(ProductoVariante).filter(ProductoVariante.id == variante_id).first()
    if not variante:
        raise HTTPException(status_code=404, detail="Variante no encontrada.")

    color = db.query(ProductoColores).filter(ProductoColores.id == variante.producto_idcolor).first()
    _verificar_propiedad(db, id_usuario, color.producto_id)

    total = db.query(ProductoVariante).filter(
        ProductoVariante.producto_idcolor == variante.producto_idcolor
    ).count()
    if total <= 1:
        raise HTTPException(status_code=400, detail="No puedes eliminar la única talla de este color.")

    db.delete(variante)
    db.commit()
    return {"mensaje": "Talla eliminada correctamente."}


# ── Eliminar color completo ────────────────────────────────────────────────────

def eliminarColor(db, id_color: int, id_usuario: int):
    color = _verificar_color(db, id_usuario, id_color)

    # Contar cuántos colores tiene el producto
    total_colores = db.query(ProductoColores).filter(
        ProductoColores.producto_id == color.producto_id
    ).count()
    if total_colores <= 1:
        raise HTTPException(status_code=400, detail="No puedes eliminar el único color del producto.")

    imagen_url = color.imagen
    # Eliminar variantes del color primero
    db.query(ProductoVariante).filter(ProductoVariante.producto_idcolor == id_color).delete()
    db.delete(color)
    db.commit()
    return {"imagen_url": imagen_url, "mensaje": "Color eliminado correctamente."}
