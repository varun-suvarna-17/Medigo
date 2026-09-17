from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    current_stock = Column(Float, nullable=False, default=0.0)
    avg_daily_consumption = Column(Float, nullable=False, default=0.0)
    requirement = Column(Float, nullable=False, default=0.0)

    facility = relationship("Facility", back_populates="medicines")
    requests = relationship("Request", back_populates="medicine", cascade="all, delete-orphan")
