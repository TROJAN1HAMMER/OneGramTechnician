from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="System Health Check",
    description="Check system status and database connectivity.",
)
def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    return {
        "status": "ok",
        "database": db_status,
    }
