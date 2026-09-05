from models.styles import Estilos
from models.shop import Shop
from fastapi import HTTPException
from services.notificaciones import Crearnotificaion

def modificarestilos(db, datos):
    buscartienda = db.query(Shop).filter(
        Shop.usuario_id == datos.id_usuario
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no se encontraron tiendas asociadas")

    traerestilo = db.query(Estilos).filter(
        Estilos.id_tienda == buscartienda.id
    ).first()

    if not traerestilo:
        raise HTTPException(status_code=400, detail="error no se encontraron estilos para su tienda")

    if datos.color_principal is not None:
        traerestilo.color_principal = datos.color_principal

    if datos.color_secundario is not None:
            traerestilo.color_secundario = datos.color_secundario

    if datos.title_color is not None:
            traerestilo.title_color = datos.title_color

    if datos.text_color is not None:
            traerestilo.text_color = datos.text_color

    if datos.color_carrito is not None:
            traerestilo.color_carrito = datos.color_carrito

    if datos.color_botones is not None:
            traerestilo.color_botones = datos.color_botones

    db.commit()
    db.refresh(traerestilo)
    Crearnotificaion(db, buscartienda.id, "Se actualizaron los estilos", "estilos")

    return "estilo actualizado"

def traerestilos(db, idusuario):
    buscartienda = db.query(Shop).filter(
            Shop.usuario_id == idusuario
        ).first()

    if not buscartienda:
            raise HTTPException(status_code=400, detail="error no se encontraron tiendas asociadas")

    estilos = db.query(Estilos).filter(
        Estilos.id_tienda == buscartienda.id
    ).first()

    if not estilos:
          raise HTTPException(status_code=400, detail="error trayendo los estilos")

    return estilos

def traerestilosdominio(db, dominio):
    tienda = db.query(Shop).filter(
        Shop.dominio == dominio
    ).first()

    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    if not tienda.estado:
        raise HTTPException(status_code=403, detail="Esta tienda no está disponible")

    estilos = db.query(Estilos).filter(
        Estilos.id_tienda == tienda.id
    ).first()

    if not estilos:
        raise HTTPException(status_code=404, detail="Estilos no encontrados")

    return {
        "color_principal": estilos.color_principal,
        "color_secundario": estilos.color_secundario,
        "title_color": estilos.title_color,
        "text_color": estilos.text_color,
        "color_carrito": estilos.color_carrito,
        "color_botones": estilos.color_botones,
    }
      
      