from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from app.db.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)

    medicines = relationship("Medicine", back_populates="facility", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="facility", cascade="all, delete-orphan")
