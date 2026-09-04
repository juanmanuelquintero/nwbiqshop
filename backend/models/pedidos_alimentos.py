from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from config_db import Base


ESTADOS_VALIDOS = ("en espera", "en preparación", "listo", "en camino", "entregado", "cancelado")


class PedidoAlimento(Base):
    __tablename__ = "pedidos_alimentos"

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

    # Estado del pedido
    estado = Column(
        String(50),
        nullable=False,
        default="en espera"
    )

    # Datos del cliente
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=False)
    direccion = Column(String(250), nullable=True)

    # ¿El cliente pide domicilio?
    domicilio = Column(Boolean, nullable=False, default=False)

    # Total calculado al crear el pedido
    total = Column(Integer, nullable=False, default=0)

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        default=datetime.now
    )


class PedidoAlimentoItem(Base):
    """
    Relación 1-a-muchos entre PedidoAlimento y Alimento.
    Cada fila es una línea del pedido (un alimento + cantidad + precio snapshot).
    """
    __tablename__ = "pedido_alimento_items"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    pedido_id = Column(
        Integer,
        ForeignKey("pedidos_alimentos.id"),
        nullable=False,
        index=True
    )

    alimento_id = Column(
        Integer,
        ForeignKey("alimentos.id"),
        nullable=False,
        index=True
    )

    # Cantidad de unidades de este alimento en el pedido
    cantidad = Column(Integer, nullable=False, default=1)

    # Precio unitario en el momento del pedido (snapshot)
    precio_unitario = Column(Integer, nullable=False, default=0)
