import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from config_db import get_db
from schemas.tuinfo import (
    ComoFuncionaCreate,
    ComoFuncionaDelete,
    ComoFuncionaUpdate,
    InformacionServicioCreate,
    InformacionServicioDelete,
    InformacionServicioUpdate,
    MiExperienciaCreate,
    MiExperienciaDelete,
    MiExperienciaUpdate,
    MisEspecialidadesCreate,
    MisEspecialidadesDelete,
    MisEspecialidadesUpdate,
    PorqueTrabajarConmigoCreate,
    PorqueTrabajarConmigoDelete,
    PorqueTrabajarConmigoUpdate,
    QueHagoCreate,
    QueHagoDelete,
    QueHagoUpdate,
    TuInformacionUpdate,
)
from services.tuinfo import (
    actualizarcomofunciona,
    actualizarinformacionservicio,
    actualizarmiexperiencia,
    actualizarmisespecialidades,
    actualizarporqueTrabajarConmigo,
    actualizarquehago,
    actualizartuinformacion,
    actualizarfoto,
    crearcomofunciona,
    crearinformacionservicio,
    crearmiexperiencia,
    crearmisespecialidades,
    crearporqueTrabajarConmigo,
    crearquehago,
    eliminarcomofunciona,
    eliminarinformacionservicio,
    eliminarmiexperiencia,
    eliminarmisespecialidades,
    eliminarporqueTrabajarConmigo,
    eliminarquehago,
    traertuinfo,
    traerinformacioncliente
)

router = APIRouter()

FOTOPERFIL_DIR = "fotoperfil"
FOTOPERFIL_BASE_URL = "http://localhost:8000/fotoperfil"
TIPOS_IMAGEN_PERMITIDOS = {"image/jpeg", "image/png", "image/webp", "image/gif"}
EXTENSIONES_IMAGEN_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@router.get("/traer-tu-info/{id_usuario}")
def TraerTuInfo(id_usuario: int, db: Session = Depends(get_db)):
    return traertuinfo(db, id_usuario)

@router.get("/traer-la-info/{dominio}")
def TraerLaInfo(dominio: str, db: Session = Depends(get_db)):
    return traerinformacioncliente(db, dominio)

@router.patch("/actualizar-tu-informacion")
def ActualizarTuInformacion(datos: TuInformacionUpdate, db: Session = Depends(get_db)):
    return actualizartuinformacion(db, datos)


@router.post("/actualizar-foto-tu-informacion")
def ActualizarFotoTuInformacion(
    id_usuario: int = Form(...),
    foto: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    extension = os.path.splitext(foto.filename or "")[1].lower()
    if foto.content_type not in TIPOS_IMAGEN_PERMITIDOS or extension not in EXTENSIONES_IMAGEN_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser una imagen JPG, PNG, WEBP o GIF",
        )

    os.makedirs(FOTOPERFIL_DIR, exist_ok=True)
    nombre_imagen = f"{uuid.uuid4().hex}{extension}"
    ruta_imagen = os.path.join(FOTOPERFIL_DIR, nombre_imagen)

    with open(ruta_imagen, "wb") as archivo:
        archivo.write(foto.file.read())

    url_foto = f"{FOTOPERFIL_BASE_URL}/{nombre_imagen}"
    return actualizarfoto(db, id_usuario, url_foto)


@router.post("/crear-que-hago")
def CrearQueHago(datos: QueHagoCreate, db: Session = Depends(get_db)):
    return crearquehago(db, datos)


@router.patch("/actualizar-que-hago")
def ActualizarQueHago(datos: QueHagoUpdate, db: Session = Depends(get_db)):
    return actualizarquehago(db, datos)


@router.delete("/eliminar-que-hago")
def EliminarQueHago(datos: QueHagoDelete, db: Session = Depends(get_db)):
    return eliminarquehago(db, datos)


@router.post("/crear-mis-especialidades")
def CrearMisEspecialidades(
    datos: MisEspecialidadesCreate, db: Session = Depends(get_db)
):
    return crearmisespecialidades(db, datos)


@router.patch("/actualizar-mis-especialidades")
def ActualizarMisEspecialidades(
    datos: MisEspecialidadesUpdate, db: Session = Depends(get_db)
):
    return actualizarmisespecialidades(db, datos)


@router.delete("/eliminar-mis-especialidades")
def EliminarMisEspecialidades(
    datos: MisEspecialidadesDelete, db: Session = Depends(get_db)
):
    return eliminarmisespecialidades(db, datos)


@router.post("/crear-como-funciona")
def CrearComoFunciona(datos: ComoFuncionaCreate, db: Session = Depends(get_db)):
    return crearcomofunciona(db, datos)


@router.patch("/actualizar-como-funciona")
def ActualizarComoFunciona(datos: ComoFuncionaUpdate, db: Session = Depends(get_db)):
    return actualizarcomofunciona(db, datos)


@router.delete("/eliminar-como-funciona")
def EliminarComoFunciona(datos: ComoFuncionaDelete, db: Session = Depends(get_db)):
    return eliminarcomofunciona(db, datos)


@router.post("/crear-informacion-servicio")
def CrearInformacionServicio(
    datos: InformacionServicioCreate, db: Session = Depends(get_db)
):
    return crearinformacionservicio(db, datos)


@router.patch("/actualizar-informacion-servicio")
def ActualizarInformacionServicio(
    datos: InformacionServicioUpdate, db: Session = Depends(get_db)
):
    return actualizarinformacionservicio(db, datos)


@router.delete("/eliminar-informacion-servicio")
def EliminarInformacionServicio(
    datos: InformacionServicioDelete, db: Session = Depends(get_db)
):
    return eliminarinformacionservicio(db, datos)


@router.post("/crear-mi-experiencia")
def CrearMiExperiencia(
    datos: MiExperienciaCreate, db: Session = Depends(get_db)
):
    return crearmiexperiencia(db, datos)


@router.patch("/actualizar-mi-experiencia")
def ActualizarMiExperiencia(
    datos: MiExperienciaUpdate, db: Session = Depends(get_db)
):
    return actualizarmiexperiencia(db, datos)


@router.delete("/eliminar-mi-experiencia")
def EliminarMiExperiencia(
    datos: MiExperienciaDelete, db: Session = Depends(get_db)
):
    return eliminarmiexperiencia(db, datos)


@router.post("/crear-porque-trabajar-conmigo")
def CrearPorqueTrabajarConmigo(
    datos: PorqueTrabajarConmigoCreate, db: Session = Depends(get_db)
):
    return crearporqueTrabajarConmigo(db, datos)


@router.patch("/actualizar-porque-trabajar-conmigo")
def ActualizarPorqueTrabajarConmigo(
    datos: PorqueTrabajarConmigoUpdate, db: Session = Depends(get_db)
):
    return actualizarporqueTrabajarConmigo(db, datos)


@router.delete("/eliminar-porque-trabajar-conmigo")
def EliminarPorqueTrabajarConmigo(
    datos: PorqueTrabajarConmigoDelete, db: Session = Depends(get_db)
):
    return eliminarporqueTrabajarConmigo(db, datos)
