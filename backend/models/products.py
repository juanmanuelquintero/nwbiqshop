from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from datetime import datetime
from config_db import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    id_tienda = Column(
        Integer,
        ForeignKey("shop.id"),
        nullable=False,
        index=True
    )

    nombre = Column(String(150), nullable=False)

    descripcion = Column(Text, nullable=True)

    precio = Column(Integer, nullable=False)

    estado = Column(Boolean, default=True, nullable=False)

    imagen1 = Column(String(300), nullable=True)

    imagen2 = Column(String(300), nullable=True)

    creado_fecha = Column(
        DateTime,
        default=datetime.now(),
        nullable=False
    )

    tipo = Column(
        String(20),
        nullable=False
    )

class ProductoSimple(Base):
    __tablename__ = "productos_simples"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False,
        unique=True
    )

    cantidad = Column(Integer, nullable=False, default=0)

class ProductoVariante(Base):
    __tablename__ = "productos_variantes"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False,
        index=True
    )

    talla = Column(String(30), nullable=True)

    color = Column(String(50), nullable=True)

    cantidad = Column(Integer, nullable=False, default=0)