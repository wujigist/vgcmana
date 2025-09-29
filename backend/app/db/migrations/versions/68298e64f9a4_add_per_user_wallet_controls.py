"""Add per-user wallet controls

Revision ID: 68298e64f9a4
Revises: 5f08e2dee738
Create Date: 2025-09-27 05:47:40.368341
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '68298e64f9a4'
down_revision = '5f08e2dee738'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add columns with default=True so existing rows get True
    op.add_column(
        'wallets',
        sa.Column('allow_deposits', sa.Boolean(), nullable=False, server_default=sa.true())
    )
    op.add_column(
        'wallets',
        sa.Column('allow_withdrawals', sa.Boolean(), nullable=False, server_default=sa.true())
    )
    op.add_column(
        'wallets',
        sa.Column('allow_purchases', sa.Boolean(), nullable=False, server_default=sa.true())
    )

def downgrade() -> None:
    op.drop_column('wallets', 'allow_purchases')
    op.drop_column('wallets', 'allow_withdrawals')
    op.drop_column('wallets', 'allow_deposits')
