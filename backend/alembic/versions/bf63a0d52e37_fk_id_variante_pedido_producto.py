"""fk id_variante en pedido_producto a productos_variantes

Revision ID: bf63a0d52e37
Revises: 348c7bcd0006
Create Date: 2026-08-23 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "bf63a0d52e37"
down_revision: Union[str, Sequence[str], None] = "348c7bcd0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agregar índice y FK a productos_variantes
    op.create_index(
        "ix_pedido_producto_id_variante",
        "pedido_producto",
        ["id_variante"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_pedido_producto_variante",
        "pedido_producto",
        "productos_variantes",
        ["id_variante"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_pedido_producto_variante", "pedido_producto", type_="foreignkey")
    op.drop_index("ix_pedido_producto_id_variante", table_name="pedido_producto")
