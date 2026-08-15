from pydantic import BaseModel
from datetime import date

# Crear usuario
class UseryshopCreate(BaseModel):
    cedula: int 
    nombres: str 
    apellidos: str 
    ciudad: str 
    direccion: str 
    fecha_nacimieno: date 
    correo: str 
    telefono: str
    contraseña: str 
    nombre: str 
    dominio: str 
    descripcion: str 
    sueldo_mensual: str 
    actividad: str 
    pasarela_pagos: bool 
    direccion: str | None = None
    telefono: str | None = None


# Modificar usuario
class UserUpdate(BaseModel):
    nombres: str | None = None
    apellidos: str | None = None
    ciudad: str | None = None
    direccion: str | None = None
    fecha_nacimieno: date | None = None
    correo: str | None = None
    telefono: str | None = None
    contraseña: str | None = None


# Iniciar sesión
class UserLogin(BaseModel):
    correo: str
    contraseña: str