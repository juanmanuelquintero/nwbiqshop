from models.products import Producto, ProductoSimple, ProductoVariante
from models.shop import Shop
from fastapi import HTTPException
from sqlalchemy import func

def crearproductosimple(db, producto, datos):
    crearps = ProductoSimple(
        producto_id = producto,
        cantidad = datos.cantidad
    )

    db.add(crearps)
    db.commit()

    return "producto simple creado"

def crearproductovariantes(db, producto, datos):
    crearpv = ProductoVariante(
        producto_id = producto,
        cantidad = datos.cantidad,
        talla = datos.talla,
        color = datos.color
    )

    db.add(crearpv)
    db.commit()

    return "producto con variantes creado"


def crearproducto(db, datos):

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="No se encontro ninguna tienda sociada al usuario")

    crearp = Producto(
        id_tienda = buscartienda.id,
        nombre = datos.nombre,
        descripcion = datos.descripcion,
        precio = datos.precio,
        tipo = datos.tipo,
        imagen1 = datos.imagen1,
        imagen2 = datos.imagen2
    )

    db.add(crearp)
    db.commit()
    db.refresh(crearp)

    if datos.tipo == "variantes":
        return crearproductovariantes(db, crearp.id, datos)

    return crearproductosimple(db, crearp.id, datos)

def traerproducto(db, id_usuario):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="No se encontro ninguna tienda sociada al usuario")

    traerp = db.query(Producto).filter(
        Producto.id_tienda == buscartienda.id
    ).all()

    resultado = []

    for producto in traerp:

        if producto.tipo == "simple":
            simple = db.query(ProductoSimple).filter(
                ProductoSimple.producto_id == producto.id
            ).first()

            stock = simple.cantidad if simple else 0

        else:
            stock = db.query(ProductoVariante).filter(
                ProductoVariante.producto_id == producto.id
            ).with_entities(
                func.sum(ProductoVariante.cantidad)
            ).scalar() or 0

        resultado.append({
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": producto.precio,
            "tipo": producto.tipo,
            "imagen1": producto.imagen1,
            "imagen2": producto.imagen2,
            "estado": producto.estado,
            "stock": stock
        })

    return resultado




def agregarvariantesexistente(db, producto_id: int, datos):
    """Agrega una nueva variante a un producto con variantes ya creado."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.tipo != "variantes":
        raise HTTPException(status_code=400, detail="El producto no es de tipo variantes")

    # Verificar que no exista la misma combinación talla/color
    existe = db.query(ProductoVariante).filter(
        ProductoVariante.producto_id == producto_id,
        ProductoVariante.talla == datos.talla,
        ProductoVariante.color == datos.color
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe la variante {datos.talla} / {datos.color}"
        )

    nueva = ProductoVariante(
        producto_id=producto_id,
        talla=datos.talla,
        color=datos.color,
        cantidad=datos.cantidad
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {"id": nueva.id, "talla": nueva.talla, "color": nueva.color, "cantidad": nueva.cantidad}


def actualizarproducto(db, producto_id: int, datos):
    """Actualiza nombre, descripcion, precio y/o estado de un producto."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if datos.nombre is not None:
        producto.nombre = datos.nombre
    if datos.descripcion is not None:
        producto.descripcion = datos.descripcion
    if datos.precio is not None:
        producto.precio = datos.precio
    if datos.estado is not None:
        producto.estado = datos.estado

    db.commit()
    db.refresh(producto)

    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio": producto.precio,
        "estado": producto.estado
    }


def eliminarproducto(db, producto_id: int):
    """Elimina un producto y todo su stock asociado."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Eliminar stock relacionado primero (evita constraint FK)
    if producto.tipo == "simple":
        db.query(ProductoSimple).filter(
            ProductoSimple.producto_id == producto_id
        ).delete()
    else:
        db.query(ProductoVariante).filter(
            ProductoVariante.producto_id == producto_id
        ).delete()

    db.delete(producto)
    db.commit()

    return {"detail": "Producto eliminado correctamente"}
