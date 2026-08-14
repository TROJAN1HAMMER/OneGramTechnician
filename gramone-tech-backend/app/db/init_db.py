import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.device import Device
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger("gramone.init_db")


def init_db(db: Session) -> None:
    # Ensure tables exist (helpful for SQLite or quick startup)
    Base.metadata.create_all(bind=engine)

    # 1. Seed Technician User
    technician = db.query(User).filter(User.email == settings.SEED_TECHNICIAN_EMAIL).first()
    if not technician:
        technician = User(
            email=settings.SEED_TECHNICIAN_EMAIL,
            hashed_password=get_password_hash(settings.SEED_TECHNICIAN_PASSWORD),
            role="technician",
            full_name="GramOne Technician",
            is_active=True,
        )
        db.add(technician)
        db.commit()
        db.refresh(technician)
        logger.info(f"Seeded technician user: {technician.email}")

    # 2. Seed Devices
    initial_devices = [
        {
            "device_code": "WATER-001",
            "device_type": "water",
            "location_name": "Main Water Tank",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "status": "offline",
        },
        {
            "device_code": "BIN-001",
            "device_type": "bin",
            "location_name": "Market Street Bin",
            "latitude": 12.9720,
            "longitude": 77.5950,
            "status": "offline",
        },
        {
            "device_code": "ENV-001",
            "device_type": "environment",
            "location_name": "School Campus Sensor",
            "latitude": 12.9730,
            "longitude": 77.5960,
            "status": "offline",
        },
        {
            "device_code": "RFID-001",
            "device_type": "rfid_button",
            "location_name": "Panchayat Office Entrance",
            "latitude": 12.9740,
            "longitude": 77.5970,
            "status": "offline",
        },
    ]

    for dev_data in initial_devices:
        device = db.query(Device).filter(Device.device_code == dev_data["device_code"]).first()
        if not device:
            device = Device(
                device_code=dev_data["device_code"],
                device_type=dev_data["device_type"],
                location_name=dev_data["location_name"],
                latitude=dev_data["latitude"],
                longitude=dev_data["longitude"],
                status=dev_data["status"],
            )
            db.add(device)
            logger.info(f"Seeded device: {dev_data['device_code']}")

    db.commit()
