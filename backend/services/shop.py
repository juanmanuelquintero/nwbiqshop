from models.shop import Shop
from fastapi import HTTPException
from models.styles import Estilos
from models.promociones import Promocion, PromocionProducto, PromocionUnitaria
from models.products import Producto, ProductoSimple, ProductoColores, ProductoVariante
from models.collections import Coleccion, ColeccionProducto
from models.combos import Combo, ComboAlimento
from models.colecciones_alimentos import ColeccionAlimentos, ColeccionAlimentoRelacion
from models.alimentos import Alimento
from models.alpormayor import AlPorMayor
from services.notificaciones import Crearnotificaion


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
        actividad=datos["actividad"],
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

    if datos["actividad"] == "Venta de alimentos":
        nueva_tienda.plantilla = 3

    if datos["actividad"] != "Venta de alimentos":
        crearpromocion = Promocion(
            id_tienda = nueva_tienda.id
        )

        crearalpormayor = AlPorMayor(
             id_tienda = nueva_tienda.id
        )
        db.add(crearalpormayor)
        db.add(crearpromocion)

    db.add(crearestilos)
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
    Crearnotificaion(db, buscartienda.id, "Se actualizaron los datos de la tienda", "tienda")

    return "tienda modificada"

def traertiendaalimentos(db, dominio):
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

    estilos_data = None
    if buscarestilos:
        estilos_data = {
            "color_principal":  buscarestilos.color_principal,
            "color_secundario": buscarestilos.color_secundario,
            "title_color":      buscarestilos.title_color,
            "text_color":       buscarestilos.text_color,
            "color_carrito":    buscarestilos.color_carrito,
            "color_botones":    buscarestilos.color_botones,
        }

    # ── Combos con alimentos enriquecidos ────────────────
    buscarcombos = db.query(Combo).filter(
        Combo.id_tienda == traerdatostienda.id,
        Combo.estado == True
    ).all()

    combos = []
    for c in buscarcombos:
        relaciones = db.query(ComboAlimento).filter(
            ComboAlimento.combo_id == c.id
        ).all()

        alimentos_combo = []
        for rel in relaciones:
            ali = db.query(Alimento).filter(
                Alimento.id == rel.alimento_id,
                Alimento.estado == True
            ).first()
            if ali:
                alimentos_combo.append({
                    "alimento_id":  ali.id,
                    "nombre":       ali.nombre,
                    "descripcion":  ali.descripcion,
                    "precio":       ali.precio,
                    "imagen":       ali.imagen,
                    "disponible":   ali.disponible,
                    "cantidad":     rel.cantidad,
                })

        combos.append({
            "id":          c.id,
            "nombre":      c.nombre,
            "descripcion": c.descripcion,
            "precio":      c.precio,
            "estado":      c.estado,
            "alimentos":   alimentos_combo,
        })

    # ── Colecciones con alimentos enriquecidos ────────────
    buscarcolecciones = db.query(ColeccionAlimentos).filter(
        ColeccionAlimentos.id_tienda == traerdatostienda.id,
        ColeccionAlimentos.estado == True
    ).all()

    coleccionesproductos = []
    ids_alimentos_en_colecciones = set()
    for col in buscarcolecciones:
        relaciones_col = db.query(ColeccionAlimentoRelacion).filter(
            ColeccionAlimentoRelacion.coleccion_id == col.id
        ).all()

        alimentos_col = []
        for rel in relaciones_col:
            ali = db.query(Alimento).filter(
                Alimento.id == rel.alimento_id,
                Alimento.estado == True,
                Alimento.disponible == True
            ).first()
            if ali:
                ids_alimentos_en_colecciones.add(ali.id)
                alimentos_col.append({
                    "alimento_id":        ali.id,
                    "nombre":             ali.nombre,
                    "descripcion":        ali.descripcion,
                    "precio":             ali.precio,
                    "imagen":             ali.imagen,
                    "disponible":         ali.disponible,
                    "tiempo_preparacion": ali.tiempo_preparacion,
                })

        coleccionesproductos.append({
            "id":          col.id,
            "titulo":      col.titulo,
            "descripcion": col.descripcion,
            "estado":      col.estado,
            "alimentos":   alimentos_col,
        })

    # ── Alimentos que no pertenecen a una colección ──────
    alimentos_sueltos = []
    buscar_alimentos_sueltos = db.query(Alimento).filter(
        Alimento.id_tienda == traerdatostienda.id,
        Alimento.estado == True,
        Alimento.disponible == True,
    ).all()

    for ali in buscar_alimentos_sueltos:
        if ali.id not in ids_alimentos_en_colecciones:
            alimentos_sueltos.append({
                "alimento_id":        ali.id,
                "nombre":             ali.nombre,
                "descripcion":        ali.descripcion,
                "precio":             ali.precio,
                "imagen":             ali.imagen,
                "disponible":         ali.disponible,
                "tiempo_preparacion": ali.tiempo_preparacion,
            })

    return {
        "nombre":         traerdatostienda.nombre,
        "descripcion":    traerdatostienda.descripcion,
        "actividad":      traerdatostienda.actividad,
        "pasarela_pagos": traerdatostienda.pasarela_pagos,
        "estado":         traerdatostienda.estado,
        "direccion":      traerdatostienda.direccion,
        "telefono":       traerdatostienda.telefono,
        "logo":           traerdatostienda.logo,
        "plantilla":      traerdatostienda.plantilla,
        "estilos":        estilos_data,
        "combos":         combos,
        "colecciones":    coleccionesproductos,
        "alimentos_sueltos": alimentos_sueltos,
    }

def traertiendaclintes(db, dominio):
    traerdatostienda = db.query(Shop).filter(
        Shop.dominio == dominio
    ).first()

    if not traerdatostienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    if not traerdatostienda.estado:
        raise HTTPException(status_code=403, detail="Esta tienda no está disponible")

    if traerdatostienda.actividad == "Venta de alimentos":
         return traertiendaalimentos(db, dominio)

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

    buscaralpormayor = db.query(AlPorMayor).filter(
         AlPorMayor.id_tienda == traerdatostienda.id
    ).first()

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
                    "precio_alpormayor": prod.precio_alpormayor,
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
                precio_alpormayor_descuento = None

                if producto.precio_alpormayor is not None:
                    precio_alpormayor_descuento = round(
                        float(producto.precio_alpormayor) * (1 - buscarpromociones.descuento / 100)
                    )
                productos_promo_general.append({
                    "id": producto.id,
                    "nombre": producto.nombre,
                    "descripcion": producto.descripcion,
                    "precio_original": producto.precio,
                    "precio_final": precio_con_descuento,
                    "precio_alpormayor": precio_alpormayor_descuento,
                    "descuento": buscarpromociones.descuento,
                    "imagen": _primera_imagen(db, producto),
                    "tipo": producto.tipo,
                })

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
            
            precio_alpormayor_descuento = None
                            
            if producto.precio_alpormayor is not None:
                precio_alpormayor_descuento = round(
                    float(producto.precio_alpormayor) * (1 - buscarpromociones.descuento / 100)
                )
            productos_promo_unitaria.append({
                "id": producto.id,
                "nombre": producto.nombre,
                "descripcion": producto.descripcion,
                "precio_original": producto.precio,
                "precio_final": precio_con_descuento,
                "precio_alpormayor": precio_alpormayor_descuento,
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
        "colecciones":               coleccionesactivas,
        "datos_alpormayor":          buscaralpormayor
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
                "precio_alpormayor": pro.precio_alpormayor,
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

def traerplantillatienda(db, id_usuario):
     buscartienda = db.query(Shop).filter(
          Shop.usuario_id == id_usuario
     ).first()

     if not buscartienda:
          raise HTTPException(status_code=400, detail="error no se encontro tienda asociada")

     return buscartienda.plantilla

def modificarplantilla(db, datos):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
              raise HTTPException(status_code=400, detail="error no se encontro tienda asociada")

    if datos.plantilla is not None:
        buscartienda.plantilla = datos.plantilla

    db.commit()
    Crearnotificaion(db, buscartienda.id, "Se actualizo la plantilla", "tienda")

    return "plantilla actualizada"