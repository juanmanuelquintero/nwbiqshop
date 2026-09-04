from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from config_db import Base
from datetime import datetime

class Alimento(Base):
    __tablename__ = "alimentos"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tienda = Column(
        Integer,
        ForeignKey("shop.id"),
        nullable=False,
        index=True
    )

    nombre = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    precio = Column(
        Integer,
        nullable=False
    )

    imagen = Column(
        String(250),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

    disponible = Column(
        Boolean,
        default=True,
        nullable=False
    )

    tiempo_preparacion = Column(
        Integer,
        nullable=True
    )

    creado_fecha = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )


class Ingrediente(Base):
    __tablename__ = "ingredientes"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tienda = Column(
        Integer,
        ForeignKey("shop.id"),
        nullable=False,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    cantidad = Column(
        Integer,
        nullable=True,
        default=0
    )

    unidad = Column(
        String(30),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

class AlimentoIngrediente(Base):
    __tablename__ = "alimentos_ingredientes"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    alimento_id = Column(
        Integer,
        ForeignKey("alimentos.id"),
        nullable=False,
        index=True
    )

    ingrediente_id = Column(
        Integer,
        ForeignKey("ingredientes.id"),
        nullable=False,
        index=True
    )