"""nueva estructura productos_colores y productos_variantes

Revision ID: 348c7bcd0006
Revises: 9de16b5f1192
Create Date: 2026-08-23 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "348c7bcd0006"
down_revision: Union[str, Sequence[str], None] = "9de16b5f1192"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear tabla productos_colores
    op.create_table(
        "productos_colores",
        sa.Column("id",          sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("producto_id", sa.Integer(), sa.ForeignKey("productos.id"), nullable=False),
        sa.Column("color",       sa.String(50),  nullable=True),
        sa.Column("marca",       sa.String(100), nullable=True),
        sa.Column("referencia",  sa.String(100), nullable=True),
        sa.Column("imagen",      sa.String(250), nullable=True),
    )
    op.create_index("ix_productos_colores_producto_id", "productos_colores", ["producto_id"])

    # 2. Agregar columna producto_idcolor a productos_variantes (nullable primero)
    op.add_column(
        "productos_variantes",
        sa.Column("producto_idcolor", sa.Integer(), nullable=True)
    )

    # 3. Quitar columnas antiguas de productos_variantes
    # (color, marca, referencia, imagen — si existen en la DB actual)
    with op.batch_alter_table("productos_variantes") as batch:
        for col in ("color", "marca", "referencia", "imagen"):
            try:
                batch.drop_column(col)
            except Exception:
                pass  # columna no existe, ignorar

    # 4. Agregar FK a productos_colores
    op.create_foreign_key(
        "fk_variante_color",
        "productos_variantes", "productos_colores",
        ["producto_idcolor"], ["id"]
    )

    # 5. Quitar columna producto_id de productos_variantes si existe
    with op.batch_alter_table("productos_variantes") as batch:
        try:
            batch.drop_constraint("fk_variante_producto", type_="foreignkey")
        except Exception:
            pass
        try:
            batch.drop_column("producto_id")
        except Exception:
            pass


def downgrade() -> None:
    # Restaurar columna producto_id
    op.add_column("productos_variantes", sa.Column("producto_id", sa.Integer(), nullable=True))

    # Restaurar columnas antiguas
    for col, tipo in [("color", sa.String(50)), ("marca", sa.String(100)),
                      ("referencia", sa.String(100)), ("imagen", sa.String(250))]:
        op.add_column("productos_variantes", sa.Column(col, tipo, nullable=True))

    # Quitar producto_idcolor
    op.drop_constraint("fk_variante_color", "productos_variantes", type_="foreignkey")
    op.drop_column("productos_variantes", "producto_idcolor")

    # Quitar tabla productos_colores
    op.drop_index("ix_productos_colores_producto_id", table_name="productos_colores")
    op.drop_table("productos_colores")
