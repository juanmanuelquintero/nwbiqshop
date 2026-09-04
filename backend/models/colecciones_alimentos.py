from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from config_db import Base


class ColeccionAlimentos(Base):
    __tablename__ = "colecciones_alimentos"

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

    titulo = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )

    fecha_creacion = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )


class ColeccionAlimentoRelacion(Base):
    __tablename__ = "coleccion_alimento"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    coleccion_id = Column(
        Integer,
        ForeignKey("colecciones_alimentos.id"),
        nullable=False,
        index=True
    )

    alimento_id = Column(
        Integer,
        ForeignKey("alimentos.id"),
        nullable=False,
        index=True
    )

    __table_args__ = (
        UniqueConstraint(
            "coleccion_id",
            "alimento_id",
            name="uq_coleccion_alimento"
        ),
    )
