"""Add attendance_events table

Revision ID: 002_add_attendance_events
Revises: 001_initial_schema
Create Date: 2026-08-14 11:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_add_attendance_events'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'attendance_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('device_id', sa.Integer(), nullable=False),
        sa.Column('card_uid', sa.String(length=100), nullable=False),
        sa.Column('scanned_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attendance_events_device_id'), 'attendance_events', ['device_id'], unique=False)
    op.create_index(op.f('ix_attendance_events_id'), 'attendance_events', ['id'], unique=False)
    op.create_index(op.f('ix_attendance_events_scanned_at'), 'attendance_events', ['scanned_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_attendance_events_scanned_at'), table_name='attendance_events')
    op.drop_index(op.f('ix_attendance_events_id'), table_name='attendance_events')
    op.drop_index(op.f('ix_attendance_events_device_id'), table_name='attendance_events')
    op.drop_table('attendance_events')
