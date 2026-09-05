from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi import HTTPException
from sqlalchemy.orm import Session
from config_db import get_db
from schemas.products import (
    ProductoUpdate,
    ProductoEstadoUpdate,
    ColorCreate,
    ColorUpdate,
    VarianteCreate,
    VarianteUpdate,
    SimpleUpdate,
)
from services.products import (
    crearproducto,
    traerproducto,
    agregarcolorexistente,
    agregarvarianteacolor,
    actualizarproducto,
    cambiarestadoproducto,
    TraerVariantesocantidadproductos,
    modificarcolor,
    modificarvariante,
    modificarsimple,
    mirarvariantesproducto,
    eliminarVariante,
    eliminarColor,
    cantidadproductos
)
import shutil
import uuid
import os

router = APIRouter()

BASE_URL = "http://localhost:8000"
IMG_DIR  = "img"


def _guardar_imagen(archivo: UploadFile) -> str:
    ext    = os.path.splitext(archivo.filename)[-1].lower()
    nombre = f"{uuid.uuid4().hex}{ext}"
    ruta   = os.path.join(IMG_DIR, nombre)
    with open(ruta, "wb") as f:
        shutil.copyfileobj(archivo.file, f)
    return f"{BASE_URL}/img/{nombre}"


def _borrar_imagen(url: str | None):
    if not url or BASE_URL not in url:
        return
    nombre = url.split("/img/")[-1]
    ruta   = os.path.join(IMG_DIR, nombre)
    if os.path.exists(ruta):
        os.remove(ruta)


# ── Crear producto ────────────────────────────────────────────────────────────

@router.post("/crear-producto")
def Crear_Producto(
    id_usuario:  int            = Form(...),
    nombre:      str            = Form(...),
    precio:      int            = Form(...),
    tipo:        str            = Form(...),
    cantidad:    int            = Form(...),
    descripcion: str | None     = Form(None),
    talla:       str | None     = Form(None),
    color:       str | None     = Form(None),
    marca:       str | None     = Form(None),
    referencia:  str | None     = Form(None),
    imagen:   UploadFile | None = File(None),
    precio_alpormayor: int | None   = Form(None),
    db: Session = Depends(get_db),
):
    url_imagen = _guardar_imagen(imagen) if imagen else None

    class Datos: pass
    d = Datos()
    d.id_usuario = id_usuario; d.nombre = nombre; d.precio = precio; d.precio_alpormayor = precio_alpormayor
    d.tipo = tipo; d.cantidad = cantidad; d.descripcion = descripcion
    d.talla = talla; d.color = color; d.marca = marca
    d.referencia = referencia; d.imagen = url_imagen

    return crearproducto(db, d)


# ── Traer productos ───────────────────────────────────────────────────────────

@router.get("/traer-producto/{id_usuario}")
def Traer_Producto(id_usuario: int, db: Session = Depends(get_db)):
    return traerproducto(db, id_usuario)


# ── Traer colores+tallas o stock simple (admin) ───────────────────────────────

@router.get("/traer-variantes/{id_producto}/{id_usuario}")
def Traer_Variantes(id_producto: int, id_usuario: int, db: Session = Depends(get_db)):
    return TraerVariantesocantidadproductos(db, id_producto, id_usuario)


# ── Endpoint público: colores+tallas de un producto (usado desde el carrito) ─

@router.get("/mirar-producto-variantes/{idproducto}")
def Mirar_Variantes_Producto(idproducto: int, db: Session = Depends(get_db)):
    return mirarvariantesproducto(db, idproducto)


# ── Agregar color a producto existente ───────────────────────────────────────

@router.post("/agregar-color/{producto_id}")
def Agregar_Color(
    producto_id: int,
    id_usuario:  int            = Form(...),
    color:       str | None     = Form(None),
    marca:       str | None     = Form(None),
    referencia:  str | None     = Form(None),
    imagen:      UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    url_imagen = _guardar_imagen(imagen) if imagen else None

    class Datos: pass
    d = Datos()
    d.id_usuario = id_usuario; d.producto_id = producto_id
    d.color = color; d.marca = marca; d.referencia = referencia; d.imagen = url_imagen

    return agregarcolorexistente(db, d)


# ── Agregar talla a un color existente ───────────────────────────────────────

@router.post("/agregar-talla")
def Agregar_Talla(datos: VarianteCreate, db: Session = Depends(get_db)):
    return agregarvarianteacolor(db, datos)


# ── Actualizar producto ───────────────────────────────────────────────────────

@router.put("/actualizar-producto/{producto_id}")
def Actualizar_Producto(producto_id: int, datos: ProductoUpdate, db: Session = Depends(get_db)):
    return actualizarproducto(db, producto_id, datos)


# ── Cambiar estado ────────────────────────────────────────────────────────────

@router.patch("/cambiar-estado-producto/{producto_id}")
def Cambiar_Estado_Producto(producto_id: int, datos: ProductoEstadoUpdate, db: Session = Depends(get_db)):
    return cambiarestadoproducto(db, producto_id, datos)


# ── Modificar color ───────────────────────────────────────────────────────────

@router.post("/modificar-color")
def Modificar_Color(
    id_usuario:     int            = Form(...),
    id_color:       int            = Form(...),
    color:          str | None     = Form(None),
    marca:          str | None     = Form(None),
    referencia:     str | None     = Form(None),
    imagen:         UploadFile | None = File(None),
    imagen_borrada: str | None     = Form(None),
    db: Session = Depends(get_db),
):
    from models.products import ProductoColores
    obj = db.query(ProductoColores).filter(ProductoColores.id == id_color).first()
    url_anterior = obj.imagen if obj else None

    url_imagen = None
    if imagen:
        _borrar_imagen(url_anterior)
        url_imagen = _guardar_imagen(imagen)
    elif imagen_borrada == "1":
        _borrar_imagen(url_anterior)
        url_imagen = ""

    class Datos: pass
    d = Datos()
    d.id_usuario = id_usuario; d.id_color = id_color
    d.color = color; d.marca = marca; d.referencia = referencia; d.imagen = url_imagen

    return modificarcolor(db, d)


# ── Modificar variante (talla/cantidad) ──────────────────────────────────────

@router.post("/modificar-variante")
def Modificar_Variante(datos: VarianteUpdate, db: Session = Depends(get_db)):
    return modificarvariante(db, datos)


# ── Modificar simple ──────────────────────────────────────────────────────────

@router.post("/modificar-simple")
def Modificar_Simple(
    id_usuario:     int            = Form(...),
    id:             int            = Form(...),
    cantidad:       int | None     = Form(None),
    marca:          str | None     = Form(None),
    referencia:     str | None     = Form(None),
    imagen:         UploadFile | None = File(None),
    imagen_borrada: str | None     = Form(None),
    db: Session = Depends(get_db),
):
    from models.products import ProductoSimple
    obj = db.query(ProductoSimple).filter(ProductoSimple.id == id).first()
    url_anterior = obj.imagen if obj else None

    url_imagen = None
    if imagen:
        _borrar_imagen(url_anterior)
        url_imagen = _guardar_imagen(imagen)
    elif imagen_borrada == "1":
        _borrar_imagen(url_anterior)
        url_imagen = ""

    class Datos: pass
    d = Datos()
    d.id_usuario = id_usuario; d.id = id
    d.cantidad = cantidad; d.marca = marca; d.referencia = referencia; d.imagen = url_imagen

    return modificarsimple(db, d)


# ── Eliminar talla ────────────────────────────────────────────────────────────

@router.delete("/eliminar-variante/{variante_id}")
def Eliminar_Variante(variante_id: int, id_usuario: int, db: Session = Depends(get_db)):
    return eliminarVariante(db, variante_id, id_usuario)


# ── Eliminar color ────────────────────────────────────────────────────────────

@router.delete("/eliminar-color/{id_color}")
def Eliminar_Color(id_color: int, id_usuario: int, db: Session = Depends(get_db)):
    resultado = eliminarColor(db, id_color, id_usuario)
    _borrar_imagen(resultado.get("imagen_url"))
    return {"mensaje": resultado["mensaje"]}

@router.get("/cantidad-productos/{id_usuario}")
def CantidadProductos(id_usuario: int, db: Session = Depends(get_db)):
    return cantidadproductos(db, id_usuario)