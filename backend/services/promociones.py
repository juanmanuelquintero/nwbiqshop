from models.promociones import Promocion, PromocionProducto, PromocionUnitaria
from models.shop import Shop
from fastapi import HTTPException
from models.products import Producto
from services.notificaciones import Crearnotificaion

def traerpromociontienda(db, id_usuario):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocion = db.query(Promocion).filter(
        Promocion.id_tienda == buscartienda.id
    ).first()

    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    return {
        "id": buscarpromocion.id,
        "nombre": buscarpromocion.nombre,
        "descripcion": buscarpromocion.descripcion,
        "descuento": buscarpromocion.descuento,
        "estado": buscarpromocion.estado,
    }

def modificarpromociontienda(db, datos):
    buscartienda = db.query(Shop).filter(
            Shop.usuario_id == datos.id_usuario
        ).first()
    
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario") 

    buscarpromocion = db.query(Promocion).filter(
            Promocion.id_tienda == buscartienda.id
        ).first()
    
    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    if datos.nombre is not None:
        buscarpromocion.nombre = datos.nombre

    if datos.descripcion is not None:
            buscarpromocion.descripcion = datos.descripcion

    if datos.descuento is not None:
            buscarpromocion.descuento = datos.descuento

    db.commit()
    db.refresh(buscarpromocion)
    Crearnotificaion(db, buscartienda.id, "Se actualizo una promocion", "promociones")

    return "promocion actualizada"

def cambiarestadopromociontienda(db, id_usuario):
    buscartienda = db.query(Shop).filter(
             Shop.usuario_id == id_usuario
         ).first()
     
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocion = db.query(Promocion).filter(
        Promocion.id_tienda == buscartienda.id
    ).first()

    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    buscarpromocion.estado = not buscarpromocion.estado

    db.commit()
    Crearnotificaion(db, buscartienda.id, "Se cambio el estado de una promocion", "promociones")

    return "estado de la promocion cambiado"

def traerproductospromocion(db, id_usuario):
    buscartienda = db.query(Shop).filter(
                 Shop.usuario_id == id_usuario
             ).first()
         
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocion = db.query(Promocion).filter(
        Promocion.id_tienda == buscartienda.id
    ).first()

    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    buscarproductospromocion = db.query(PromocionProducto).filter(
        PromocionProducto.promocion_id == buscarpromocion.id
    ).all()

    return buscarproductospromocion


def asignarproductospromocion(db, datos):
    buscartienda = db.query(Shop).filter(
            Shop.usuario_id == datos.id_usuario
        ).first()
          
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocion = db.query(Promocion).filter(
        Promocion.id_tienda == buscartienda.id
    ).first()

    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    if len(datos.producto_id) == 0:
        raise HTTPException(status_code=400, detail="error se debe por lo menos agregar  un producto")

    for p in datos.producto_id:
        buscarproducto = db.query(PromocionProducto).filter(
                PromocionProducto.producto_id == p,
                PromocionProducto.promocion_id == buscarpromocion.id
            ).first()
        if buscarproducto:
            continue

        buscarproductopromocionunitaria = db.query(PromocionUnitaria).filter(
            PromocionUnitaria.id_tienda == buscartienda.id,
            PromocionUnitaria.id_producto == p,
            PromocionUnitaria.estado == True
        ).first()

        if buscarproductopromocionunitaria:
            continue

        buscarproducto = db.query(Producto).filter(
            Producto.id == p,
            Producto.id_tienda == buscartienda.id
        ).first()

        if not buscarproducto:
            continue

        productonuevo = PromocionProducto(
            promocion_id = buscarpromocion.id,
            producto_id = p
        )

        db.add(productonuevo)

    db.commit()
    Crearnotificaion(db, buscartienda.id, "Se agregaron productos a una promocion", "promociones")

    return "productos agregados"

def eliminarpoductospromocion(db, datos):
    buscartienda = db.query(Shop).filter(
                Shop.usuario_id == datos.id_usuario
            ).first()
              
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocion = db.query(Promocion).filter(
        Promocion.id_tienda == buscartienda.id
    ).first()

    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    buscarproductopromocion = db.query(PromocionProducto).filter(
        PromocionProducto.promocion_id == buscarpromocion.id,
        PromocionProducto.producto_id == datos.producto_id
    ).first()

    if not buscarproductopromocion:
        raise HTTPException(status_code=400, detail="error no se encontro ningun producto a eliminar")

    db.delete(buscarproductopromocion)
    db.commit()
    Crearnotificaion(db, buscartienda.id, "Se elimino un producto de una promocion", "promociones")

    return "se elimino el producto correctamente"

def traerpromocionunitaria(db, id_usuario):
    buscartienda = db.query(Shop).filter(
                Shop.usuario_id == id_usuario
            ).first()
             
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocionesunitarias = db.query(PromocionUnitaria).filter(
        PromocionUnitaria.id_tienda == buscartienda.id
    ).all()

    return buscarpromocionesunitarias

def crearpromocionunitaria(db, datos):
    buscartienda = db.query(Shop).filter(
                Shop.usuario_id == datos.id_usuario
            ).first()
                
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocion = db.query(Promocion).filter(
            Promocion.id_tienda == buscartienda.id
        ).first()
    
    if not buscarpromocion:
        raise HTTPException(status_code=400, detail="error no se encotro ninguna proocion para su tienda")

    producto = db.query(Producto).filter(
            Producto.id == datos.producto_id,
            Producto.id_tienda == buscartienda.id
        ).first()

    if not producto:
        raise HTTPException(
            status_code=400,
            detail="el producto no pertenece a la tienda"
        )

    buscarpromocionexistente = db.query(PromocionProducto).filter(
        PromocionProducto.producto_id == datos.producto_id,
        PromocionProducto.promocion_id == buscarpromocion.id
    ).first()

    if buscarpromocionexistente:
        raise HTTPException(status_code=400, detail="error el producto ya cuenta con una promocion")

    buscarpromocionexistente2 = db.query(PromocionUnitaria).filter(
        PromocionUnitaria.id_tienda == buscartienda.id,
        PromocionUnitaria.id_producto == datos.producto_id,
    ).first()

    if buscarpromocionexistente2:
        raise HTTPException(status_code=400, detail="error el producto ya cuenta con una promocion")
    
    promocionunitarianueva = PromocionUnitaria(
        id_tienda = buscartienda.id,
        id_producto = datos.producto_id,
        descuento = datos.descuento,
        estado = True
    )

    db.add(promocionunitarianueva)
    db.commit()
    db.refresh(promocionunitarianueva)
    Crearnotificaion(db, buscartienda.id, "Se creo una promocion unitaria", "promociones")

    return "promocion unitaria creada"

def modificarpromocionunitaria(db, datos):
    buscartienda = db.query(Shop).filter(
                Shop.usuario_id == datos.id_usuario
            ).first()
                    
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocionunitaria = db.query(PromocionUnitaria).filter(
        PromocionUnitaria.id_tienda == buscartienda.id,
        PromocionUnitaria.id_producto == datos.id
    ).first()

    if not buscarpromocionunitaria:
        raise HTTPException(status_code=400, detail="error no se encontro la promocion a modificar")

    if datos.descuento is not None:
        buscarpromocionunitaria.descuento = datos.descuento

    db.commit()
    db.refresh(buscarpromocionunitaria)
    Crearnotificaion(db, buscartienda.id, "Se actualizo una promocion unitaria", "promociones")

    return "promocion unitaria modificada"

def cambiarestadopromocionunitaria(db, datos):
    buscartienda = db.query(Shop).filter(
                Shop.usuario_id == datos.id_usuario
            ).first()
                        
    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no encontraron tiendas asociadas al usuario")

    buscarpromocionunitaria = db.query(PromocionUnitaria).filter(
        PromocionUnitaria.id_tienda == buscartienda.id,
        PromocionUnitaria.id_producto == datos.id
    ).first()

    if not buscarpromocionunitaria:
        raise HTTPException(status_code=400, detail="error no se encontro la promocion a modificar")

    buscarpromocionunitaria.estado = not buscarpromocionunitaria.estado

    db.commit()
    db.refresh(buscarpromocionunitaria)
    Crearnotificaion(db, buscartienda.id, "Se cambio el estado de una promocion unitaria", "promociones")

    return "se cambio el estado de la promocion unitaria"