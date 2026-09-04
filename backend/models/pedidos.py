from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from config_db import Base
from datetime import datetime


class Pedido(Base):
    __tablename__ = "pedidos"

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

    # Estado del pedido: pendiente | confirmado | enviado | cancelado
    estado = Column(
        String(50),
        default="pendiente",
        nullable=False
    )

    totalcompra = Column(
        Integer,
        default=0,
        nullable=True
    )

    nombresyapellidos = Column(String(100), nullable=True)
    correocliente = Column(String(100), nullable=True)
    telefonocliente = Column(String(20), nullable=True)
    ciudadcliente = Column(String(100), nullable=True)
    direccioncliente = Column(String(200), nullable=True)
    numeroguia = Column(String(300), nullable=True)

    fecha_creacion = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )


class PedidoProducto(Base):
    __tablename__ = "pedido_producto"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    pedido_id = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False,
        index=True
    )

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False,
        index=True
    )

    # ID de la variante → ForeignKey a productos_variantes.id
    # (para productos simples apunta a productos_simples.id — sin FK formal porque puede ser ambos)
    id_variante = Column(
        Integer,
        ForeignKey("productos_variantes.id"),
        nullable=True,
        index=True
    )

    # Cantidad de unidades pedidas para esta línea
    cantidad = Column(
        Integer,
        nullable=False,
        default=1
    )

    id_tienda = Column(
        Integer,
        ForeignKey("shop.id"),
        nullable=False,
        index=True
    )
