from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from config_db import Base

class Suscripciones(Base):
    __tablename__ = "suscripciones"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    cedula_usuario = Column(
        Integer,
        ForeignKey("users.cedula"),
        nullable=False,
        index=True
        )

    cantidad_pagar = Column(
        Numeric(10, 2),
        nullable=False
    )

    fecha_creacion = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    fecha_fin = Column(
        DateTime,
        nullable=False
    )

    estado = Column(
        String(20),
        default="activa",
        nullable=False
    )

    fecha_pago = Column(
        DateTime,
        nullable=True
    )

    referencia_pago = Column(
        String(100),
        nullable=True
    )

    metodo_pago = Column(
        String(30),
        nullable=True
    )