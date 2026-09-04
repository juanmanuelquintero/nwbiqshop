from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
import uuid
import os
import json

from config_db import get_db

from schemas.alimentos import (
    AlimentoEstado,
    IngredienteUpdate,
)

from services.alimentos import (
    crearalimentos,
    traeralimentos,
    modificaralimento,
    cambiar_estado_alimento,
    modificar_ingrediente,
    traer_alimento_con_ingredientes,
)


router = APIRouter()

BASE_URL    = "https://nwbiqshop.nwbiq.com/api"
ALIM_DIR    = "alimentos"


def _guardar_imagen_alimento(archivo: UploadFile) -> str:
    ext    = os.path.splitext(archivo.filename)[-1].lower()
    nombre = f"{uuid.uuid4().hex}{ext}"
    ruta   = os.path.join(ALIM_DIR, nombre)
    with open(ruta, "wb") as f:
        shutil.copyfileobj(archivo.file, f)
    return f"{BASE_URL}/alimentos/{nombre}"


def _borrar_imagen_alimento(url: str | None):
    if not url or BASE_URL not in url:
        return
    nombre = url.split("/alimentos/")[-1]
    ruta   = os.path.join(ALIM_DIR, nombre)
    if os.path.exists(ruta):
        os.remove(ruta)


# ── Crear alimento ────────────────────────────────────────────────────────────

@router.post("/crear-alimentos")
def crear_alimento(
    id_usuario:         int               = Form(...),
    nombre:             str               = Form(...),
    precio:             int               = Form(...),
    descripcion:        str | None        = Form(None),
    tiempo_preparacion: int | None        = Form(None),
    disponible:         bool              = Form(True),
    ingredientes:       str               = Form("[]"),   # JSON string
    imagen:             UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    url_imagen = _guardar_imagen_alimento(imagen) if imagen else None

    try:
        lista_ingredientes = json.loads(ingredientes)
    except Exception:
        lista_ingredientes = []

    class Datos: pass
    d = Datos()
    d.id_usuario         = id_usuario
    d.nombre             = nombre
    d.precio             = precio
    d.descripcion        = descripcion
    d.tiempo_preparacion = tiempo_preparacion
    d.disponible         = disponible
    d.imagen             = url_imagen
    d.ingredientes       = [_dict_a_ingrediente(i) for i in lista_ingredientes]

    return crearalimentos(db, d)


# ── Traer alimentos ───────────────────────────────────────────────────────────

@router.get("/traer-alimentos/{id_usuario}")
def traer_alimentos(
    id_usuario: int,
    db: Session = Depends(get_db),
):
    return traeralimentos(db, id_usuario)


# ── Modificar alimento ────────────────────────────────────────────────────────

@router.put("/modificar-alimentos/{id_alimento}")
def modificar_alimento(
    id_alimento:        int,
    id_usuario:         int               = Form(...),
    nombre:             str | None        = Form(None),
    descripcion:        str | None        = Form(None),
    precio:             int | None        = Form(None),
    tiempo_preparacion: int | None        = Form(None),
    disponible:         bool | None       = Form(None),
    imagen:             UploadFile | None = File(None),
    imagen_borrada:     str | None        = Form(None),
    db: Session = Depends(get_db),
):
    # Resolver imagen: subir nueva / borrar existente / sin cambio
    from models.alimentos import Alimento
    alimento_actual = db.query(Alimento).filter(Alimento.id == id_alimento).first()
    url_anterior    = alimento_actual.imagen if alimento_actual else None

    url_imagen = None          # None = no tocar el campo
    if imagen:
        _borrar_imagen_alimento(url_anterior)
        url_imagen = _guardar_imagen_alimento(imagen)
    elif imagen_borrada == "1":
        _borrar_imagen_alimento(url_anterior)
        url_imagen = ""        # vacío = borrar en BD

    class Datos: pass
    d = Datos()
    d.id_usuario         = id_usuario
    d.nombre             = nombre
    d.descripcion        = descripcion
    d.precio             = precio
    d.tiempo_preparacion = tiempo_preparacion
    d.disponible         = disponible
    d.imagen             = url_imagen

    return modificaralimento(db, id_alimento, d)


# ── Traer alimento público (con ingredientes) ─────────────────────────────────

@router.get("/alimento/{id_alimento}")
def traer_alimento_publico(
    id_alimento: int,
    db: Session = Depends(get_db),
):
    return traer_alimento_con_ingredientes(db, id_alimento)



@router.patch("/estado-alimento/{id_alimento}")
def cambiar_estado(
    id_alimento: int,
    datos: AlimentoEstado,
    db: Session = Depends(get_db),
):
    return cambiar_estado_alimento(db, id_alimento, datos)


# ── Modificar ingrediente ─────────────────────────────────────────────────────

@router.patch("/ingredientes/{id_ingrediente}")
def modificar_ingrediente_route(
    id_ingrediente: int,
    datos: IngredienteUpdate,
    db: Session = Depends(get_db),
):
    return modificar_ingrediente(db, id_ingrediente, datos)


# ── Helper interno ────────────────────────────────────────────────────────────

def _dict_a_ingrediente(data: dict):
    """Convierte un dict (viene del JSON de ingredientes) a un objeto con atributos."""
    class Ing: pass
    i = Ing()
    i.nombre      = data.get("nombre", "")
    i.descripcion = data.get("descripcion")
    i.cantidad    = data.get("cantidad")
    i.unidad      = data.get("unidad")
    return i