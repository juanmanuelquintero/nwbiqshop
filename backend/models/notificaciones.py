from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
from config_db import Base


class Notificaciones(Base):
    __tablename__ = "notificaciones"
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

    accion = Column(
        String(50),
        nullable=False
    )

    lugar = Column(
            String(100),
            nullable=False
        )

    fecha = Column(
        DateTime,
        default=datetime.now()
    )