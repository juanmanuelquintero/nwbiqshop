from models.alimentos import Alimento, AlimentoIngrediente, Ingrediente
from models.shop import Shop
from fastapi import HTTPException
from services.notificaciones import Crearnotificaion

def crearalimentos(db, datos):

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una tienda asociada a este usuario"
        )

    if buscartienda.actividad != "Venta de alimentos":
        raise HTTPException(
            status_code=400,
            detail="La tienda no es de alimentos"
        )

    try:

        nuevoalimento = Alimento(
            id_tienda=buscartienda.id,
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            precio=datos.precio,
            imagen=datos.imagen,
            tiempo_preparacion=datos.tiempo_preparacion,
            disponible=datos.disponible
        )

        db.add(nuevoalimento)
        db.flush()


        for i in datos.ingredientes:

            nuevoingrediente = Ingrediente(
                id_tienda=buscartienda.id,
                nombre=i.nombre,
                descripcion=i.descripcion,
                cantidad=i.cantidad,
                unidad=i.unidad
            )

            db.add(nuevoingrediente)
            db.flush()


            nuevarelacion = AlimentoIngrediente(
                alimento_id=nuevoalimento.id,
                ingrediente_id=nuevoingrediente.id
            )

            db.add(nuevarelacion)


        db.commit()

        db.refresh(nuevoalimento)
        Crearnotificaion(db, buscartienda.id, "Se creo un alimento", "alimentos")

        return "Alimento creado con éxito"

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Ocurrió un error al crear el alimento"
        )


def traeralimentos(db, id_usuario):

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una tienda asociada a este usuario"
        )

    if buscartienda.actividad != "Venta de alimentos":
        raise HTTPException(
            status_code=400,
            detail="La tienda no es de alimentos"
        )

    buscaralimentos = db.query(Alimento).filter(
        Alimento.id_tienda == buscartienda.id
    ).all()

    respuesta = []

    for alimento in buscaralimentos:

        relaciones = db.query(AlimentoIngrediente).filter(
            AlimentoIngrediente.alimento_id == alimento.id
        ).all()

        ingredientes = []

        for relacion in relaciones:

            ingrediente = db.query(Ingrediente).filter(
                Ingrediente.id == relacion.ingrediente_id
            ).first()

            if ingrediente:
                ingredientes.append({
                    "id": ingrediente.id,
                    "nombre": ingrediente.nombre,
                    "descripcion": ingrediente.descripcion,
                    "cantidad": ingrediente.cantidad,
                    "unidad": ingrediente.unidad
                })

        respuesta.append({
            "id": alimento.id,
            "id_tienda": alimento.id_tienda,
            "nombre": alimento.nombre,
            "descripcion": alimento.descripcion,
            "precio": alimento.precio,
            "imagen": alimento.imagen,
            "tiempo_preparacion": alimento.tiempo_preparacion,
            "disponible": alimento.disponible,
            "estado": alimento.estado,
            "ingredientes": ingredientes
        })

    return respuesta

def modificaralimento(db, id_alimento, datos):

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una tienda asociada a este usuario"
        )

    if buscartienda.actividad != "Venta de alimentos":
        raise HTTPException(
            status_code=400,
            detail="La tienda no es de alimentos"
        )

    alimento = db.query(Alimento).filter(
        Alimento.id == id_alimento,
        Alimento.id_tienda == buscartienda.id
    ).first()

    if not alimento:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el alimento"
        )

    if datos.nombre is not None:
        alimento.nombre = datos.nombre

    if datos.descripcion is not None:
        alimento.descripcion = datos.descripcion

    if datos.precio is not None:
        alimento.precio = datos.precio

    if datos.imagen is not None:
        alimento.imagen = None if datos.imagen == "" else datos.imagen

    if datos.tiempo_preparacion is not None:
        alimento.tiempo_preparacion = datos.tiempo_preparacion

    if datos.disponible is not None:
        alimento.disponible = datos.disponible

    db.commit()
    db.refresh(alimento)
    Crearnotificaion(db, buscartienda.id, "Se actualizo un alimento", "alimentos")

    return alimento

def cambiar_estado_alimento(db, id_alimento, datos):

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una tienda asociada a este usuario"
        )
    if buscartienda.actividad != "Venta de alimentos":
        raise HTTPException(
            status_code=400,
            detail="La tienda no es de alimentos"
        )

    alimento = db.query(Alimento).filter(
        Alimento.id == id_alimento,
        Alimento.id_tienda == buscartienda.id
    ).first()

    if not alimento:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el alimento"
        )

    alimento.estado = datos.estado

    db.commit()
    db.refresh(alimento)
    Crearnotificaion(db, buscartienda.id, "Se cambio el estado de un alimento", "alimentos")

    if datos.estado:
        return "Alimento habilitado correctamente"

    return "Alimento inhabilitado correctamente"


def traer_alimento_con_ingredientes(db, id_alimento):
    """Endpoint público — retorna un alimento con su lista de ingredientes."""

    alimento = db.query(Alimento).filter(
        Alimento.id == id_alimento,
        Alimento.estado == True,
    ).first()

    if not alimento:
        raise HTTPException(
            status_code=404,
            detail="Alimento no encontrado o inactivo",
        )

    relaciones = db.query(AlimentoIngrediente).filter(
        AlimentoIngrediente.alimento_id == alimento.id
    ).all()

    ingredientes = []
    for rel in relaciones:
        ing = db.query(Ingrediente).filter(Ingrediente.id == rel.ingrediente_id).first()
        if ing:
            ingredientes.append({
                "id":          ing.id,
                "nombre":      ing.nombre,
                "descripcion": ing.descripcion,
                "cantidad":    ing.cantidad,
                "unidad":      ing.unidad,
            })

    return {
        "id":                 alimento.id,
        "nombre":             alimento.nombre,
        "descripcion":        alimento.descripcion,
        "precio":             alimento.precio,
        "imagen":             alimento.imagen,
        "tiempo_preparacion": alimento.tiempo_preparacion,
        "disponible":         alimento.disponible,
        "ingredientes":       ingredientes,
    }


def modificar_ingrediente(db, id_ingrediente, datos):

    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(
            status_code=400,
            detail="No se encontró una tienda asociada a este usuario"
        )

    if buscartienda.actividad != "Venta de alimentos":
        raise HTTPException(
            status_code=400,
            detail="La tienda no es de alimentos"
        )

    ingrediente = db.query(Ingrediente).filter(
        Ingrediente.id == id_ingrediente,
        Ingrediente.id_tienda == buscartienda.id
    ).first()

    if not ingrediente:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el ingrediente"
        )

    if datos.nombre is not None:
        ingrediente.nombre = datos.nombre

    if datos.descripcion is not None:
        ingrediente.descripcion = datos.descripcion

    if datos.cantidad is not None:
        ingrediente.cantidad = datos.cantidad

    if datos.unidad is not None:
        ingrediente.unidad = datos.unidad

    db.commit()
    db.refresh(ingrediente)
    Crearnotificaion(db, buscartienda.id, "Se actualizo un ingrediente", "alimentos")

    return ingrediente