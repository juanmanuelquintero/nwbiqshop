from models.users import Users
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
import jwt
from config import settings

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
        raise HTTPException(status=400, detail="error el email ya esta en uso")

    buscarphone = db.query(Users).filter(
                Users.telefono == datos["telefono"]
            ).first()
        
    if buscarphone:
        raise HTTPException(status=400, detail="error el telefono ya esta en uso")

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