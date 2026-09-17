from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.facility import Facility
from app.models.medicine import Medicine
from app.models.request import Request, RequestStatus
from app.schemas.schemas import (
    SupplierRequestCreate,
    RequestOut,
    RequestResponse,
    RequestsListResponse,
    PrioritizedRequestsResponse,
    RequestStatusUpdate,
)
from app.services.priority_engine import get_prioritized_requests as engine_get_prioritized_requests

router = APIRouter()


@router.get("/requests", response_model=RequestsListResponse)
def get_requests(db: Session = Depends(get_db)):
    """Fetch all facility medicine requests."""
    requests = db.query(Request).order_by(Request.created_at.desc()).all()
    results = []
    for r in requests:
        results.append(
            RequestResponse(
                id=r.id,
                facility_id=r.facility_id,
                medicine_id=r.medicine_id,
                quantity=r.quantity,
                emergency_level=r.emergency_level,
                status=r.status,
                current_stock=r.current_stock,
                reason=r.reason,
                created_at=r.created_at,
                facility_name=r.facility.name if r.facility else None,
                medicine_name=r.medicine.name if r.medicine else None,
            )
        )
    return {"requests": results}


@router.get("/requests/prioritized", response_model=List[RequestOut])
def get_prioritized_requests(db: Session = Depends(get_db)):
    """Fetch all PENDING medicine requests ranked and sorted by priority score via priority_engine."""
    return engine_get_prioritized_requests(db)


@router.post("/requests", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def create_request(payload: SupplierRequestCreate, db: Session = Depends(get_db)):
    """Submit a new medicine shortage request for a facility."""
    # Verify facility exists
    facility = db.query(Facility).filter(Facility.id == payload.facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with id {payload.facility_id} not found"
        )

    # Verify medicine exists and belongs to this facility (or exists in system)
    medicine = db.query(Medicine).filter(Medicine.id == payload.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine with id {payload.medicine_id} not found"
        )

    new_request = Request(
        facility_id=payload.facility_id,
        medicine_id=payload.medicine_id,
        quantity=payload.quantity,
        emergency_level=payload.emergency_level,
        reason=payload.reason,
        status=RequestStatus.PENDING,
        current_stock=medicine.current_stock,
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return RequestResponse(
        id=new_request.id,
        facility_id=new_request.facility_id,
        medicine_id=new_request.medicine_id,
        quantity=new_request.quantity,
        emergency_level=new_request.emergency_level,
        status=new_request.status,
        current_stock=new_request.current_stock,
        reason=new_request.reason,
        created_at=new_request.created_at,
        facility_name=facility.name,
        medicine_name=medicine.name,
    )


@router.patch("/requests/{request_id}/status", response_model=RequestOut)
def update_request_status(
    request_id: int,
    payload: RequestStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update request status to FULFILLED or REJECTED (Feature 6).
    1. Fetch Request by request_id (404 if not found).
    2. Validate current status is PENDING (400 if already actioned).
    3. Update status to new value.
    4. Commit and return updated Request object.
    """
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id {request_id} not found",
        )

    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update request with status '{request.status.value if hasattr(request.status, 'value') else request.status}'. Only PENDING requests can be actioned.",
        )

    request.status = RequestStatus(payload.status.value)
    db.commit()
    db.refresh(request)

    return RequestOut(
        id=request.id,
        facility_id=request.facility_id,
        medicine_id=request.medicine_id,
        quantity=request.quantity,
        emergency_level=request.emergency_level,
        status=request.status,
        current_stock=request.current_stock,
        reason=request.reason,
        created_at=request.created_at,
        facility_name=request.facility.name if request.facility else None,
        medicine_name=request.medicine.name if request.medicine else None,
    )

