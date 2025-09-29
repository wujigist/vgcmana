# backend/app/models/__init__.py
# this file intentionally imports model modules so alembic discoverability works
from . import user, wallet, investment, admin
