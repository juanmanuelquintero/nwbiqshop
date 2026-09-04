from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
from config_db import Base


class Combo(Base):
    __tablename__ = "combos"

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

    # Precio final del combo (puede ser menor que la suma de sus alimentos)
    precio = Column(
        Integer,
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        default=datetime.now
    )


class ComboAlimento(Base):
    """Relación muchos-a-muchos entre Combo y Alimento."""
    __tablename__ = "combo_alimentos"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    combo_id = Column(
        Integer,
        ForeignKey("combos.id"),
        nullable=False,
        index=True
    )

    alimento_id = Column(
        Integer,
        ForeignKey("alimentos.id"),
        nullable=False,
        index=True
    )

    # Cantidad de este alimento dentro del combo (ej: 2 hamburguesas)
    cantidad = Column(
        Integer,
        nullable=False,
        default=1
    )

    __table_args__ = (
        UniqueConstraint(
            "combo_id",
            "alimento_id",
            name="uq_combo_alimento"
        ),
    )
