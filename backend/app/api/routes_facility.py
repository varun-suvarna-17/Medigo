from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.facility import Facility
from app.models.medicine import Medicine
from app.models.request import Request, RequestStatus
from app.schemas.schemas import (
    FacilityResponse,
    StockResponse,
    ShortageRiskResponse,
    ShortageRiskItem,
    RequestCreate,
    RequestOut,
)
from app.services.shortage_detection import is_shortage_risk

router = APIRouter()


@router.get("", response_model=List[FacilityResponse])
@router.get("/", response_model=List[FacilityResponse], include_in_schema=False)
def get_all_facilities(db: Session = Depends(get_db)):
    """Fetch all registered medical facilities."""
    facilities = db.query(Facility).all()
    return facilities


@router.get("/{facility_id}", response_model=FacilityResponse)
def get_facility(facility_id: int, db: Session = Depends(get_db)):
    """Fetch single facility details."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with id {facility_id} not found"
        )
    return facility


@router.get("/{facility_id}/stock", response_model=StockResponse)
def get_stock(facility_id: int, db: Session = Depends(get_db)):
    """Fetch all medicines and stock levels for a given facility from DB."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with id {facility_id} not found"
        )

    medicines = db.query(Medicine).filter(Medicine.facility_id == facility_id).all()
    return {"facility_id": facility_id, "stock": medicines}


@router.get("/{facility_id}/shortage-risk", response_model=ShortageRiskResponse)
def get_shortage_risk(facility_id: int, db: Session = Depends(get_db)):
    """Identify medicines at risk of shortage for a given facility using shortage_detection service."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with id {facility_id} not found"
        )

    medicines = db.query(Medicine).filter(Medicine.facility_id == facility_id).all()
    risks = []

    for med in medicines:
        has_risk = is_shortage_risk(med.current_stock, med.avg_daily_consumption)
        days_remaining = (
            round(med.current_stock / med.avg_daily_consumption, 1)
            if med.avg_daily_consumption > 0
            else 9999.0
        )
        if has_risk:
            risks.append(
                ShortageRiskItem(
                    medicine_id=med.id,
                    name=med.name,
                    current_stock=med.current_stock,
                    avg_daily_consumption=med.avg_daily_consumption,
                    requirement=med.requirement,
                    days_remaining=days_remaining,
                    shortage_risk=True
                )
            )

    return {"facility_id": facility_id, "risks": risks}


@router.post("/{facility_id}/request", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def create_facility_request(
    facility_id: int,
    payload: RequestCreate,
    db: Session = Depends(get_db)
):
    """
    Assisted Supplier Request (Feature 4):
    1. Validate facility_id exists in DB (404 if not).
    2. Validate medicine_id exists AND belongs to that facility_id (404/400 if mismatch).
    3. Auto-fill facility_id from path and snapshot current_stock from Medicine row.
    4. Reject if quantity <= 0.
    5. Insert new Request row with status PENDING and UTC created_at.
    6. Return created Request object (RequestOut) with 201 status.
    """
    # 1. Validate facility exists
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with id {facility_id} not found"
        )

    # Validate quantity > 0
    if payload.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0"
        )

    # 2. Validate medicine exists and belongs to facility_id
    medicine = db.query(Medicine).filter(Medicine.id == payload.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine with id {payload.medicine_id} not found"
        )
    if medicine.facility_id != facility_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Medicine with id {payload.medicine_id} does not belong to facility {facility_id}"
        )

    # 3 & 4. Auto-fill and insert new Request row
    new_request = Request(
        facility_id=facility_id,
        medicine_id=payload.medicine_id,
        quantity=payload.quantity,
        emergency_level=payload.emergency_level,
        status=RequestStatus.PENDING,
        current_stock=medicine.current_stock,
        created_at=datetime.utcnow()
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # 5. Return created RequestOut
    return RequestOut(
        id=new_request.id,
        facility_id=new_request.facility_id,
        medicine_id=new_request.medicine_id,
        quantity=new_request.quantity,
        emergency_level=new_request.emergency_level,
        status=new_request.status,
        current_stock=new_request.current_stock,
        created_at=new_request.created_at,
        facility_name=facility.name,
        medicine_name=medicine.name
    )
