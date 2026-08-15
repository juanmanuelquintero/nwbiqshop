from sqlalchemy import Column, Integer, String, Date
from config_db import Base

class Users(Base):
    __tablename__ = "users"

    cedula = Column(Integer, primary_key=True, autoincrement=False, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    direccion = Column(String(150), nullable=False)
    fecha_nacimieno = Column(Date, nullable=False)
    correo = Column(String(150), nullable=False)
    telefono = Column(String(10), nullable=False)
    contraseña = Column(String(300), nullable=False)
    rol = Column(String(50),nullable=False)