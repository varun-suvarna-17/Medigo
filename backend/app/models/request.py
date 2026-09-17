import enum
from datetime import datetime
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.database import Base


class EmergencyLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    IN_TRANSIT = "IN_TRANSIT"
    FULFILLED = "FULFILLED"
    REJECTED = "REJECTED"


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    emergency_level = Column(
        SQLEnum(EmergencyLevel),
        nullable=False,
        default=EmergencyLevel.MEDIUM
    )
    status = Column(
        SQLEnum(RequestStatus),
        nullable=False,
        default=RequestStatus.PENDING
    )
    current_stock = Column(Float, nullable=True, default=0.0)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    facility = relationship("Facility", back_populates="requests")
    medicine = relationship("Medicine", back_populates="requests")
