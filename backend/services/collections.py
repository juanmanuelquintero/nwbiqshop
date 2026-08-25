from models.collections import ColeccionProducto, Coleccion
from models.shop import Shop
from models.products import Producto
from fastapi import HTTPException

def crearcoleccion(db, datos):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no se encontro una tienda asociada")

    crearcol = Coleccion(
        id_tienda = buscartienda.id,
        nombre = datos.nombre,
        descripcion = datos.descripcion
    )

    db.add(crearcol)
    db.commit()
    db.refresh(crearcol)

    if  datos.producto_id == None:
        return "coleccion creada"

    for p in datos.producto_id:
        mirarproducto = db.query(Producto).filter(
            Producto.id == p
        ).first()

        if not mirarproducto or mirarproducto.id_tienda != buscartienda.id:
            continue

        existe = db.query(ColeccionProducto).filter(
                ColeccionProducto.coleccion_id == crearcol.id,
                ColeccionProducto.producto_id == p
            ).first()
        
        if existe:
            continue

        crearproductos = ColeccionProducto(
            coleccion_id = crearcol.id,
            producto_id = p
        )
        db.add(crearproductos)

    db.commit()

    return "coleccion creada y productos agregados"

def traercolecciones(db, idusuario):
    buscartienda = db.query(Shop).filter(
            Shop.usuario_id == idusuario
        ).first()
    
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no se encontro una tienda asociada")

    colecciones = db.query(Coleccion).filter(
        Coleccion.id_tienda == buscartienda.id
    ).all()

    return colecciones

def traerproductoscoleccion(db, datos):
    usuariocoleccion = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()
    if not usuariocoleccion: 
        raise HTTPException(status_code=400, detail="error el usuario no tiene tienda")
    coleccion = db.query(Coleccion).filter(
        Coleccion.id_tienda == usuariocoleccion.id
    ).first()
    if not coleccion: 
        raise HTTPException(status_code=400, detail="error la coleccion no pertenece a la tienda")

    buscarcoleccion = db.query(ColeccionProducto).filter(
        ColeccionProducto.coleccion_id == datos.coleccion_id
    ).all()

    return buscarcoleccion

def agregarproductoscoleccion(db, datos):
    usuariocoleccion = db.query(Shop).filter(
            Shop.usuario_id == datos.id_usuario
        ).first()
    if not usuariocoleccion: 
        raise HTTPException(status_code=400, detail="error el usuario no tiene tienda")
    coleccion = db.query(Coleccion).filter(
        Coleccion.id == datos.coleccion_id,
        Coleccion.id_tienda == usuariocoleccion.id
    ).first()
    if not coleccion: 
        raise HTTPException(status_code=400, detail="error la coleccion no pertenece a la tienda")

    for p in datos.producto_id:
        mirarproducto = db.query(Producto).filter(
            Producto.id == p
        ).first()

        if not mirarproducto or mirarproducto.id_tienda != usuariocoleccion.id:
            continue
        existe = db.query(ColeccionProducto).filter(
            ColeccionProducto.coleccion_id == coleccion.id,
            ColeccionProducto.producto_id == p
        ).first()

        if existe:
            continue

        crearproductos = ColeccionProducto(
            coleccion_id = coleccion.id,
            producto_id = p
        )
        db.add(crearproductos)

    db.commit()

    return "coleccion creada y productos agregados"

def modificarcoleccion(db, datos):
    usuariocoleccion = db.query(Shop).filter(
            Shop.usuario_id == datos.id_usuario
        ).first()
    if not usuariocoleccion: 
            raise HTTPException(status_code=400, detail="error el usuario no tiene tienda")
    buscarcoleccion = db.query(Coleccion).filter(
        Coleccion.id == datos.id,
        Coleccion.id_tienda == usuariocoleccion.id
    ).first()

    if not buscarcoleccion:
        raise HTTPException(status_code=400, detail="error no se encontro la coleccion")

    if datos.nombre is not None:
        buscarcoleccion.nombre = datos.nombre
    
    if datos.descripcion is not None:
            buscarcoleccion.descripcion = datos.descripcion

    db.commit()
    db.refresh(buscarcoleccion)

    return "coleccion modificada"


def eliminarproductoColeccion(db, datos):

    tienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not tienda:
        raise HTTPException(
            status_code=400,
            detail="El usuario no tiene tienda"
        )
    coleccion = db.query(Coleccion).filter(
        Coleccion.id == datos.coleccion_id,
        Coleccion.id_tienda == tienda.id
    ).first()

    if not coleccion:
        raise HTTPException(
            status_code=400,
            detail="La colección no pertenece a la tienda"
        )

    relacion = db.query(ColeccionProducto).filter(
        ColeccionProducto.coleccion_id == datos.coleccion_id,
        ColeccionProducto.producto_id == datos.producto_id
    ).first()

    if not relacion:
        raise HTTPException(
            status_code=400,
            detail="El producto no pertenece a la colección"
        )

    db.delete(relacion)
    db.commit()

    return "Producto eliminado de la colección"



def cambiarestadocoleccion(db, datos):
    """Alterna el estado activo/inactivo de una colección."""
    tienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not tienda:
        raise HTTPException(status_code=400, detail="El usuario no tiene tienda")

    coleccion = db.query(Coleccion).filter(
        Coleccion.id == datos.id,
        Coleccion.id_tienda == tienda.id
    ).first()

    if not coleccion:
        raise HTTPException(status_code=404, detail="Colección no encontrada")

    coleccion.estado = not coleccion.estado
    db.commit()
    db.refresh(coleccion)

    estado_texto = "activada" if coleccion.estado else "desactivada"
    return {
        "id": coleccion.id,
        "nombre": coleccion.nombre,
        "estado": coleccion.estado,
        "mensaje": f"Colección {estado_texto} correctamente"
    }

def eliminarcoleccion(db, datos):

    tienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not tienda:
        raise HTTPException(
            status_code=400,
            detail="El usuario no tiene tienda"
        )

    coleccion = db.query(Coleccion).filter(
        Coleccion.id == datos.id,
        Coleccion.id_tienda == tienda.id
    ).first()

    if not coleccion:
        raise HTTPException(
            status_code=404,
            detail="Colección no encontrada"
        )

    db.query(ColeccionProducto).filter(
        ColeccionProducto.coleccion_id == coleccion.id
    ).delete()

    db.delete(coleccion)

    db.commit()

    return "Colección eliminada correctamente"