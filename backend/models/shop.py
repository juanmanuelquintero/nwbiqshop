from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from config_db import Base


class Shop(Base):
    __tablename__ = "shop"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("users.cedula"),
        nullable=False,
        unique=True
    )

    nombre = Column(String(150), nullable=False)

    descripcion = Column(String(500), nullable=False)

    sueldo_mensual = Column(String(50), nullable=False)

    actividad = Column(String(150), nullable=False)

    pasarela_pagos = Column(Boolean, nullable=False, default=False)

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    dominio = Column(String(150),nullable=False,unique=True,index=True)

    estado = Column(Boolean,nullable=False,default=True)

    logo = Column(String(300),nullable=True)

    direccion = Column(String(200),nullable=True)

    telefono = Column(String(20),nullable=True)

    usuario = relationship("Users", backref="shop")
