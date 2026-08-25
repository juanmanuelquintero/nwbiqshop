from sqlalchemy import Column, Integer, String, ForeignKey
from config_db import Base


class Estilos(Base):
    __tablename__ = "estilos"

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

    color_principal = Column(
        String(7),
        nullable=False,
        default="#ffffff"
    )

    color_secundario = Column(
        String(7),
        nullable=False,
        default="#2259d7"
    )

    title_color = Column(
        String(7),
        nullable=False,
        default="#042d78"
    )

    text_color = Column(
        String(7),
        nullable=False,
        default="#242f43"
    )

    color_carrito = Column(
        String(7),
        nullable=False,
        default="#2d75e4"
    )

    color_botones = Column(
        String(7),
        nullable=False,
        default="#35a4ec"
    )