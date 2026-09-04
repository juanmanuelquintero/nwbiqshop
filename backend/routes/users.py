from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.users import UseryshopCreate, UserLogin, Usercontraseñaupdate, UserUpdate
from config_db import get_db
from services.users import crearusuario, validarusuario, modificarusuario, cambiarcontraseña, traerusuario
from services.shop import crear_tienda

router = APIRouter()

@router.post("/crear-cuenta")
def Crear_Cuenta(datos: UseryshopCreate, db: Session = Depends(get_db)):
    datosUsuario = {
        "cedula": datos.cedula,
        "nombres": datos.nombres,
        "apellidos": datos.apellidos,
        "ciudad": datos.ciudad,
        "direccion": datos.direccion,
        "fecha_nacimieno": datos.fecha_nacimieno,
        "correo": datos.correo,
        "telefono": datos.telefono,
        "contraseña": datos.contraseña,
        "dominio": datos.dominio,
    }

    crearusuario(db, datosUsuario)

    datosShop = {
        "usuario_id": datos.cedula,
        "nombre": datos.nombre,
        "dominio": datos.dominio,
        "descripcion": datos.descripcion,
        "actividad": datos.actividad,
        "direccion": datos.direccion,
        "telefono": datos.telefono
    }

    crear_tienda(db, datosShop)

    return "cuenta creada"

@router.post("/validar-usuario")
def validar(datos: UserLogin, db: Session = Depends(get_db)):
    return validarusuario(db, datos)

@router.patch("/modificar-usuario")
def ModificarUsuario(datos: UserUpdate, db: Session = Depends(get_db)):
    return modificarusuario(db, datos)

@router.post("/cambiar-contraseña")
def CambiarContraseña(datos: Usercontraseñaupdate, db: Session = Depends(get_db)):
    return cambiarcontraseña(db, datos)

@router.get("/traer-usuario/{cedula}")
def TraerUsuario(cedula: int, db: Session = Depends(get_db)):
    return traerusuario(db, cedula)