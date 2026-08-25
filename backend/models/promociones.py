from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, UniqueConstraint
from config_db import Base


class Promocion(Base):
    __tablename__ = "promociones"

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
        nullable=False,
        default="Promociones"
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    descuento = Column(
        Integer,
        nullable=False,
        default=0
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=False
    )


class PromocionProducto(Base):
    __tablename__ = "promocion_producto"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    promocion_id = Column(
        Integer,
        ForeignKey("promociones.id"),
        nullable=False,
        index=True
    )

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False,
        index=True
    )

    __table_args__ = (
        UniqueConstraint(
            "promocion_id",
            "producto_id"
        ),
    )

class PromocionUnitaria(Base):
    __tablename__ = "promociones_unitarias"

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

    id_producto = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False,
        index=True
    )

    descuento = Column(
        Integer,
        nullable=False,
        default=0
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=False
    )