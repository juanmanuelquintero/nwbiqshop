from models.shop import Shop
from fastapi import HTTPException
from models.styles import Estilos
from models.promociones import Promocion, PromocionProducto, PromocionUnitaria
from models.products import Producto, ProductoSimple, ProductoColores, ProductoVariante
from models.collections import Coleccion, ColeccionProducto


def _primera_imagen(db, producto: Producto) -> str | None:
    """Devuelve la URL de la primera imagen disponible del producto."""
    if producto.tipo == "variantes":
        # La imagen ahora vive en ProductoColores, no en ProductoVariante
        c = db.query(ProductoColores).filter(
            ProductoColores.producto_id == producto.id,
            ProductoColores.imagen.isnot(None)
        ).first()
        return c.imagen if c else None
    else:
        s = db.query(ProductoSimple).filter(
            ProductoSimple.producto_id == producto.id
        ).first()
        return s.imagen if s else None

def crear_tienda(db, datos):

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

    crearestilos = Estilos(
        id_tienda = nueva_tienda.id
    )

    crearpromocion = Promocion(
          id_tienda = nueva_tienda.id
    )
    db.add(crearestilos)
    db.add(crearpromocion)
    db.commit()

    return nueva_tienda


def traer_tienda(db, user):
    treardatostienda = db.query(Shop).filter(
        Shop.usuario_id == user
    ).first()

    if not treardatostienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    return {
        "id": treardatostienda.id,
        "nombre": treardatostienda.nombre,
        "dominio": treardatostienda.dominio,
        "descripcion": treardatostienda.descripcion,
        "sueldo_mensual": treardatostienda.sueldo_mensual,
        "actividad": treardatostienda.actividad,
        "pasarela_pagos": treardatostienda.pasarela_pagos,
        "estado": treardatostienda.estado,
        "logo": treardatostienda.logo,
        "direccion": treardatostienda.direccion,
        "telefono": treardatostienda.telefono,
        "fecha_creacion": str(treardatostienda.fecha_creacion),
    }

def modificartienda(db, datos):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no se encontro ninguna tienda asociada")

    if datos.nombre is not None:
        buscartienda.nombre = datos.nombre

    if datos.dominio is not None:
            if buscartienda.dominio != datos.dominio:
                buscardominio = db.query(Shop).filter(
                    Shop.dominio == datos.dominio
                ).first()
                if buscardominio:
                    raise HTTPException(status_code=400, detail="error el dominio ya existe")
            buscartienda.dominio = datos.dominio

    if datos.descripcion is not None:
            buscartienda.descripcion = datos.descripcion

    if datos.sueldo_mensual is not None:
            buscartienda.sueldo_mensual = datos.sueldo_mensual

    if datos.actividad is not None:
            buscartienda.actividad = datos.actividad

    if datos.pasarela_pagos is not None:
            buscartienda.pasarela_pagos = datos.pasarela_pagos

    if datos.logo is not None:
            buscartienda.logo = datos.logo

    if datos.direccion is not None:
            buscartienda.direccion = datos.direccion

    if datos.telefono is not None:
            buscartienda.telefono = datos.telefono

    db.commit()
    db.refresh(buscartienda)

    return "tienda modificada"


def traertiendaclintes(db, dominio):
    traerdatostienda = db.query(Shop).filter(
        Shop.dominio == dominio
    ).first()

    if not traerdatostienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    if not traerdatostienda.estado:
        raise HTTPException(status_code=403, detail="Esta tienda no está disponible")

    buscarestilos = db.query(Estilos).filter(
        Estilos.id_tienda == traerdatostienda.id
    ).first()

    buscarpromociones = db.query(Promocion).filter(
        Promocion.id_tienda == traerdatostienda.id
    ).first()

    buscarpromocionunitaria = db.query(PromocionUnitaria).filter(
        PromocionUnitaria.id_tienda == traerdatostienda.id
    ).all()

    colecciones = db.query(Coleccion).filter(
        Coleccion.id_tienda == traerdatostienda.id,
        Coleccion.estado == True
    ).all()

    coleccionesactivas = []

    for c in colecciones:
        relaciones_col = db.query(ColeccionProducto).filter(
            ColeccionProducto.coleccion_id == c.id
        ).all()

        buscarpromocionestado = db.query(Promocion).filter(
            Promocion.id_tienda == traerdatostienda.id,
            Promocion.estado == True        
        ).first()

        productos_col = []
        for rel in relaciones_col:
            prod = db.query(Producto).filter(
                Producto.id == rel.producto_id,
                Producto.estado == True
            ).first()

            descuento = 0

            if buscarpromocionestado:
                 productop = db.query(PromocionProducto).filter(
                      PromocionProducto.producto_id == prod.id
                 ).first()
                 if productop:
                      descuento = buscarpromocionestado.descuento
            productopunitaria = db.query(PromocionUnitaria).filter(
                 PromocionUnitaria.id_producto == prod.id,
                 PromocionUnitaria.estado == True
            ).first()

            if productopunitaria:
                 descuento = productopunitaria.descuento

            if prod:
                productos_col.append({
                    "id":          prod.id,
                    "nombre":      prod.nombre,
                    "descripcion": prod.descripcion,
                    "precio":      prod.precio,
                    "imagen":      _primera_imagen(db, prod),
                    "tipo":        prod.tipo,
                    "descuento":   descuento
                })

        coleccionesactivas.append({
            "coleccion_nombre":       c.nombre,
            "coleccion_descripcion":  c.descripcion,
            "productos":              productos_col,
        })

    productos_promo_general = []
    if buscarpromociones and buscarpromociones.estado:
        relaciones = db.query(PromocionProducto).filter(
            PromocionProducto.promocion_id == buscarpromociones.id
        ).all()

        for rel in relaciones:
            producto = db.query(Producto).filter(
                Producto.id == rel.producto_id,
                Producto.estado == True
            ).first()
            if producto:
                precio_con_descuento = round(
                    producto.precio * (1 - buscarpromociones.descuento / 100)
                )
                productos_promo_general.append({
                    "id": producto.id,
                    "nombre": producto.nombre,
                    "descripcion": producto.descripcion,
                    "precio_original": producto.precio,
                    "precio_final": precio_con_descuento,
                    "descuento": buscarpromociones.descuento,
                    "imagen": _primera_imagen(db, producto),
                    "tipo": producto.tipo,
                })

    buscarproductos = db.query(Producto).filter(
         Producto.id_tienda == traerdatostienda.id,
         Producto.estado == True
    ).all()
    if buscarproductos:
        for pro in buscarproductos:
             estaenunacoleccion = db.query(Coleccion)

    productos_promo_unitaria = []
    for pu in buscarpromocionunitaria:
        if not pu.estado:
            continue
        producto = db.query(Producto).filter(
            Producto.id == pu.id_producto,
            Producto.estado == True
        ).first()
        if producto:
            precio_con_descuento = round(
                producto.precio * (1 - pu.descuento / 100)
            )
            productos_promo_unitaria.append({
                "id": producto.id,
                "nombre": producto.nombre,
                "descripcion": producto.descripcion,
                "precio_original": producto.precio,
                "precio_final": precio_con_descuento,
                "descuento": pu.descuento,
                "imagen": _primera_imagen(db, producto),
                "tipo": producto.tipo,
            })

    estilos_data = None
    if buscarestilos:
        estilos_data = {
            "color_principal":  buscarestilos.color_principal,
            "color_secundario": buscarestilos.color_secundario,
            "title_color":      buscarestilos.title_color,
            "text_color":       buscarestilos.text_color,
            "color_carrito":    buscarestilos.color_carrito,
            "color_botones":    buscarestilos.color_botones,
            "fondo":            getattr(buscarestilos, "imagen_fondo", None)
        }

    promo_data = None
    if buscarpromociones:
        promo_data = {
            "id":          buscarpromociones.id,
            "nombre":      buscarpromociones.nombre,
            "descripcion": buscarpromociones.descripcion,
            "descuento":   buscarpromociones.descuento,
            "estado":      buscarpromociones.estado,
        }

    return {
        "nombre":                    traerdatostienda.nombre,
        "descripcion":               traerdatostienda.descripcion,
        "actividad":                 traerdatostienda.actividad,
        "pasarela_pagos":            traerdatostienda.pasarela_pagos,
        "estado":                    traerdatostienda.estado,
        "direccion":                 traerdatostienda.direccion,
        "telefono":                  traerdatostienda.telefono,
        "logo":                      traerdatostienda.logo,
        "plantilla":                 traerdatostienda.plantilla,
        "estilos":                   estilos_data,
        "datospromocion":            promo_data,
        "productos_promo_general":   productos_promo_general,
        "productos_promo_unitaria":  productos_promo_unitaria,
        "colecciones": coleccionesactivas
    }

def buscarproductossueltos(db, dominio):
    buscartienda = db.query(Shop).filter(
        Shop.dominio == dominio
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error ese dominio no existe")

    colecciones = db.query(Coleccion).filter(
            Coleccion.id_tienda == buscartienda.id,
            Coleccion.estado == True
        ).all()


    productossueltos = []
    buscarproductos = db.query(Producto).filter(
        Producto.id_tienda == buscartienda.id,
        Producto.estado == True
    ).all()
    if buscarproductos:
        for pro in buscarproductos:
            if colecciones:
                for c in colecciones:
                    buscarproductopercole = db.query(ColeccionProducto).filter(
                            ColeccionProducto.coleccion_id == c.id,
                            ColeccionProducto.producto_id == pro.id
                        ).first()

                    if buscarproductopercole:
                            continue

            buscarpromocionestado = db.query(Promocion).filter(
                        Promocion.id_tienda == buscartienda.id,
                        Promocion.estado == True        
                    ).first()
        
            
            if buscarpromocionestado:
                    productop = db.query(PromocionProducto).filter(
                        PromocionProducto.producto_id == pro.id
                    ).first()
                    if productop:
                        continue

            productopunitaria = db.query(PromocionUnitaria).filter(
                PromocionUnitaria.id_producto == pro.id,
                PromocionUnitaria.estado == True
            ).first()

            if productopunitaria:
                continue

            productossueltos.append({
                "id":          pro.id,
                "nombre":      pro.nombre,
                "descripcion": pro.descripcion,
                "precio":      pro.precio,
                "imagen":      _primera_imagen(db, pro),
                "tipo":        pro.tipo,
                "descuento":   0,
            })

        return productossueltos


def buscartiendaclientecarrito(db, dominio):
     buscartienda = db.query(Shop).filter(
          Shop.dominio == dominio
     ).first()

     if not buscartienda:
          raise HTTPException(status_code=400, detail="error no se encontro la tienda asociada")

     buscarestilos = db.query(Estilos).filter(
          Estilos.id_tienda == buscartienda.id
     ).first()

     datos = {
        "nombre": buscartienda.nombre,
        "descripcion": buscartienda.descripcion,
        "sueldo_mensual": buscartienda.sueldo_mensual,
        "actividad": buscartienda.actividad,
        "pasarela_pagos": buscartienda.pasarela_pagos,
        "dominio": buscartienda.dominio,
        "estado": buscartienda.estado,
        "logo": buscartienda.logo,
        "direccion": buscartienda.direccion,
        "telefono": buscartienda.telefono,
        "estilos": buscarestilos
     }

     return datos