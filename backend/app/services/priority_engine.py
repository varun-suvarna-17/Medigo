from typing import List, Tuple, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.facility import Facility
from app.models.medicine import Medicine
from app.models.request import Request, EmergencyLevel, RequestStatus
from app.schemas.schemas import RequestOut
from app.services.nearby_search import haversine_km

# Named constants for priority calculation weights
WEIGHT_EMERGENCY = 0.5
WEIGHT_URGENCY = 0.3
WEIGHT_PROXIMITY = 0.2

# Fixed supplier location for single supplier MVP (City General Hospital coords)
SUPPLIER_LOCATION = (12.9141, 74.8560)


def get_emergency_score(emergency_level: EmergencyLevel | str) -> float:
    """CRITICAL=100, HIGH=75, MEDIUM=50, LOW=25"""
    level = emergency_level.value if hasattr(emergency_level, "value") else str(emergency_level)
    level_str = level.upper()

    if level_str == "CRITICAL":
        return 100.0
    elif level_str == "HIGH":
        return 75.0
    elif level_str == "MEDIUM":
        return 50.0
    elif level_str == "LOW":
        return 25.0
    return 25.0


def get_urgency_score(medicine: Optional[Medicine]) -> Tuple[float, Optional[float]]:
    """
    urgency_score mapping:
    <=1 day: 100 | <=3 days: 80 | <=7 days: 60 | <=14 days: 30 | >14 days: 10
    Handle avg_daily_consumption <= 0 case (avoid division by zero) -> treat as urgency_score = 10
    Returns (urgency_score, days_remaining)
    """
    if not medicine or medicine.avg_daily_consumption <= 0:
        return 10.0, None

    days_remaining = medicine.current_stock / medicine.avg_daily_consumption

    if days_remaining <= 1.0:
        score = 100.0
    elif days_remaining <= 3.0:
        score = 80.0
    elif days_remaining <= 7.0:
        score = 60.0
    elif days_remaining <= 14.0:
        score = 30.0
    else:
        score = 10.0

    return score, round(days_remaining, 1)


def get_proximity_score(facility: Optional[Facility], supplier_location: Tuple[float, float]) -> Tuple[float, Optional[float]]:
    """
    proximity_score mapping:
    <=10km: 100 | <=25km: 70 | <=50km: 40 | >50km: 20
    Uses haversine_km() from nearby_search.py
    Returns (proximity_score, distance_km)
    """
    if not facility or facility.lat is None or facility.lon is None:
        return 20.0, None

    distance_km = haversine_km(
        supplier_location[0],
        supplier_location[1],
        facility.lat,
        facility.lon
    )
    dist_rounded = round(distance_km, 2)

    if dist_rounded <= 10.0:
        score = 100.0
    elif dist_rounded <= 25.0:
        score = 70.0
    elif dist_rounded <= 50.0:
        score = 40.0
    else:
        score = 20.0

    return score, dist_rounded


def calculate_priority_score(
    request: Request,
    medicine: Optional[Medicine],
    facility: Optional[Facility],
    supplier_location: Tuple[float, float] = SUPPLIER_LOCATION
) -> float:
    """
    Formula:
    priority_score = (0.5 * emergency_score) + (0.3 * urgency_score) + (0.2 * proximity_score)
    """
    emergency_score = get_emergency_score(request.emergency_level)
    urgency_score, _ = get_urgency_score(medicine)
    proximity_score, _ = get_proximity_score(facility, supplier_location)

    score = (
        (WEIGHT_EMERGENCY * emergency_score)
        + (WEIGHT_URGENCY * urgency_score)
        + (WEIGHT_PROXIMITY * proximity_score)
    )
    return round(score, 2)


def get_prioritized_requests(
    db: Session,
    supplier_location: Tuple[float, float] = SUPPLIER_LOCATION
) -> List[RequestOut]:
    """
    1. Fetch all requests with status="PENDING"
    2. Join with Medicine and Facility
    3. Calculate priority_score for each using supplier's fixed location
    4. Sort descending by priority_score
    5. Return list of RequestOut with priority_score included
    """
    pending_requests = (
        db.query(Request)
        .options(joinedload(Request.medicine), joinedload(Request.facility))
        .filter(Request.status == RequestStatus.PENDING)
        .all()
    )

    results = []
    for req in pending_requests:
        med = req.medicine
        fac = req.facility

        score = calculate_priority_score(req, med, fac, supplier_location)
        _, days_remaining = get_urgency_score(med)
        _, distance_km = get_proximity_score(fac, supplier_location)

        results.append(
            RequestOut(
                id=req.id,
                facility_id=req.facility_id,
                medicine_id=req.medicine_id,
                quantity=req.quantity,
                emergency_level=req.emergency_level,
                status=req.status,
                current_stock=req.current_stock if req.current_stock is not None else (med.current_stock if med else None),
                created_at=req.created_at,
                facility_name=fac.name if fac else None,
                medicine_name=med.name if med else None,
                priority_score=score,
                distance_km=distance_km,
                days_remaining=days_remaining,
            )
        )

    # Sort descending by priority_score
    results.sort(key=lambda item: item.priority_score if item.priority_score is not None else 0.0, reverse=True)
    return results
