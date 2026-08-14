import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("gramone.db")

def create_db_engine():
    db_url = settings.DATABASE_URL
    # Try PostgreSQL first if configured
    if db_url.startswith("postgresql"):
        try:
            engine = create_engine(db_url, pool_pre_ping=True)
            # Test connection
            with engine.connect() as conn:
                pass
            logger.info("Successfully connected to PostgreSQL database.")
            return engine
        except Exception as e:
            logger.warning(
                f"Could not connect to PostgreSQL database ({e}). Falling back to SQLite ('sqlite:///./gramone.db')."
            )
    
    # Fallback SQLite
    sqlite_url = "sqlite:///./gramone.db"
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
    )

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
