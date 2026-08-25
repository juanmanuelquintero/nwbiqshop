"""agregar id_variante y cantidad en pedido_producto, estado pendiente en pedidos

Revision ID: 9de16b5f1192
Revises: 907f59770b28
Create Date: 2026-08-23 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "9de16b5f1192"
down_revision: Union[str, Sequence[str], None] = "907f59770b28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agregar id_variante (nullable, sin FK porque puede apuntar a dos tablas)
    op.add_column(
        "pedido_producto",
        sa.Column("id_variante", sa.Integer(), nullable=True),
    )
    # Agregar cantidad con default 1
    op.add_column(
        "pedido_producto",
        sa.Column("cantidad", sa.Integer(), nullable=False, server_default="1"),
    )
    # Cambiar default de estado en pedidos a "pendiente"
    op.alter_column(
        "pedidos",
        "estado",
        existing_type=sa.String(length=50),
        server_default="pendiente",
        existing_nullable=False,
    )


def downgrade() -> None:
    op.drop_column("pedido_producto", "cantidad")
    op.drop_column("pedido_producto", "id_variante")
    op.alter_column(
        "pedidos",
        "estado",
        existing_type=sa.String(length=50),
        server_default="en proceso",
        existing_nullable=False,
    )
