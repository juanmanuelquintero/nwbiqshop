from models.users import Users
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
import jwt
from config import settings
from models.shop import Shop
from models.tuinfo import TuInformacion
from services.suscripciones import crearsuscripcion

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def crearusuario(db, datos):
    contraseñahasheada = pwd_context.hash(datos["contraseña"])

    buscaremail = db.query(Users).filter(
            Users.correo == datos["correo"]
        ).first()
    
    if buscaremail:
        raise HTTPException(status_code=400, detail=f"error el email {datos["correo"]} ya esta en uso")

    buscarphone = db.query(Users).filter(
                Users.telefono == datos["telefono"]
            ).first()
        
    if buscarphone:
        raise HTTPException(status_code=400, detail="error el telefono ya esta en uso")

    buscardominio = db.query(Shop).filter(
            Shop.dominio == datos["dominio"]
        ).first()
    
    if buscardominio:
        raise HTTPException(status_code=400, detail="error el dominio ya existe")

    nuevouser = Users(
        cedula=datos["cedula"],
        nombres=datos["nombres"],
        apellidos=datos["apellidos"],
        ciudad=datos["ciudad"],
        direccion=datos["direccion"],
        fecha_nacimieno=datos["fecha_nacimieno"],
        correo=datos["correo"],
        telefono=datos["telefono"],
        contraseña=contraseñahasheada,
        rol = "tendero"
    )

    db.add(nuevouser)
    db.commit()
    db.refresh(nuevouser)

    tuinfo = TuInformacion(
         id_usuario = nuevouser.cedula
    )

    crearsuscripcion(db, nuevouser.cedula)

    db.add(tuinfo)
    db.commit()
    return "usuario creado"

def creartoken(datos):
    pyload = datos.copy()
    pyload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)

    token = jwt.encode(pyload, settings.secret_key, algorithm=settings.algorithm)

    return token

def validarusuario(db, datos):
    usuario = db.query(Users).filter(
        Users.correo == datos.correo
    ).first()

    if not usuario:
        raise HTTPException(status_code=400, detail="el usuario no existe")

    if not pwd_context.verify(datos.contraseña, usuario.contraseña):
        raise HTTPException(status_code=400, detail="contraseña incorrecta")

    token = creartoken({
        "id": usuario.cedula,
        "usuario": usuario.nombres,
        "rol": usuario.rol
    })

    return {
        "status": "success",
        "token": token
    }

def modificarusuario(db, datos):
    buscarusuario = db.query(Users).filter(
        Users.cedula == datos.id_usuario
    ).first()

    if not buscarusuario:
        raise HTTPException(status_code=400, detail="error no existe el usuario a modificar")

    if datos.nombres is not None:
        buscarusuario.nombres = datos.nombres

    if datos.apellidos is not None:
            buscarusuario.apellidos = datos.apellidos

    if datos.ciudad is not None:
            buscarusuario.ciudad = datos.ciudad

    if datos.direccion is not None:
            buscarusuario.direccion = datos.direccion

    if datos.fecha_nacimieno is not None:
            buscarusuario.fecha_nacimieno = datos.fecha_nacimieno

    if datos.correo is not None:
            if buscarusuario.correo != datos.correo:
                buscarcorreo = db.query(Users).filter(
                    Users.correo == datos.correo
                ).first()
                if buscarcorreo:
                    raise HTTPException(status_code=400, detail="error el correo ya esta en uso")
                
            buscarusuario.correo = datos.correo

    if datos.telefono is not None:
            if buscarusuario.telefono != datos.telefono:
                buscartelefono = db.query(Users).filter(
                    Users.telefono == datos.telefono
                ).first()
                if buscartelefono:
                        raise HTTPException(status_code=400, detail="error el telefono ya esta en uso")
            buscarusuario.telefono = datos.telefono

    db.commit()
    db.refresh(buscarusuario)

    return "usuario modificado"


def cambiarcontraseña(db, datos):
    buscarusuario = db.query(Users).filter(
          Users.cedula == datos.id_usuario
    ).first()

    if not buscarusuario:
        raise HTTPException(status_code=400, detail="error no existe el usuario a modificar")

    if not pwd_context.verify(datos.contraseña, buscarusuario.contraseña):
            raise HTTPException(status_code=400, detail="contraseña incorrecta")

    if len(datos.contraseñanueva) < 8 or len(datos.contraseñanueva) > 15:
        raise HTTPException(status_code=400, detail="La contraseña debe tener mínimo 8 y máximo 15 caracteres")

    contranueva = pwd_context.hash(datos.contraseñanueva)

    buscarusuario.contraseña = contranueva

    db.commit()
    db.refresh(buscarusuario)

    return "contraseña cambiada"


def traerusuario(db, cedula: int):
    usuario = db.query(Users).filter(Users.cedula == cedula).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {
        "cedula": usuario.cedula,
        "nombres": usuario.nombres,
        "apellidos": usuario.apellidos,
        "ciudad": usuario.ciudad,
        "direccion": usuario.direccion,
        "fecha_nacimieno": str(usuario.fecha_nacimieno),
        "correo": usuario.correo,
        "telefono": usuario.telefono,
        "rol": usuario.rol,
    }
