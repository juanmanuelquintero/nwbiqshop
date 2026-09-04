from config_db import Base
from sqlalchemy import Column, Integer,ForeignKey, Boolean


class AlPorMayor(Base):
    __tablename__ = "al_por_mayor"

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
        unique=True,
        index=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=False
    )

    cantidad_minima = Column(
        Integer,
        nullable=False,
        default=10
    )