from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from config_db import Base


class Coleccion(Base):
    __tablename__ = "colecciones"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    id_tienda = Column(
        Integer,
        ForeignKey("shop.id"),
        nullable=False,
        index=True
    )

    nombre = Column(String(150), nullable=False)

    descripcion = Column(Text, nullable=True)

    fecha_creacion = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    estado = Column(Boolean, default=True, nullable=False)

class ColeccionProducto(Base):
    __tablename__ = "coleccion_producto"

    id = Column(Integer, primary_key=True, autoincrement=True)

    coleccion_id = Column(
        Integer,
        ForeignKey("colecciones.id"),
        nullable=False,
        index=True
    )

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False,
        index=True
    )