from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.facility import Facility
from app.models.medicine import Medicine
from app.schemas.schemas import NearbyAvailabilityResponse, NearbyFacilityItem
from app.services.nearby_search import find_nearby_facilities

router = APIRouter()


@router.get("/nearby", response_model=NearbyAvailabilityResponse)
def get_nearby_availability(
    facility_id: int = Query(..., description="ID of requesting facility"),
    medicine_id: int = Query(..., description="ID of required medicine"),
    radius_km: float = Query(25.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    """
    Find nearby facilities with available stock for a medicine:
    1. Fetch requesting facility (lat, lon).
    2. Fetch other facilities.
    3. Match medicine row and filter out facilities with available_qty <= 0.
    4. Call find_nearby_facilities from nearby_search.py.
    5. Return top 2 results sorted by distance.
    6. If empty, return 'no suitable nearby source' with prompt_supplier_request=True.
    """
    # 1. Fetch requesting facility (lat, lon) from DB
    req_facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not req_facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with id {facility_id} not found"
        )

    # Fetch reference medicine (to resolve name or confirm medicine existence)
    target_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    medicine_name = target_medicine.name if target_medicine else None

    # 2. Fetch all OTHER facilities from DB (exclude requesting facility)
    other_facilities = db.query(Facility).filter(Facility.id != facility_id).all()

    # 3 & 4. For each facility, fetch medicine row and build dict if stock > 0
    candidate_facilities = []
    for fac in other_facilities:
        query = db.query(Medicine).filter(Medicine.facility_id == fac.id)
        if medicine_name:
            query = query.filter(
                (Medicine.id == medicine_id) | (Medicine.name.ilike(medicine_name))
            )
        else:
            query = query.filter(Medicine.id == medicine_id)

        med_row = query.first()
        available_qty = med_row.current_stock if med_row else 0.0

        # Skip facilities with no stock (available_qty <= 0)
        if available_qty > 0:
            candidate_facilities.append({
                "id": fac.id,
                "name": fac.name,
                "lat": fac.lat,
                "lon": fac.lon,
                "available_qty": available_qty,
                "avg_daily_consumption": med_row.avg_daily_consumption if med_row else 0.0,
            })

    # 5. Call find_nearby_facilities(origin=(req_lat, req_lon), facilities=list, radius_km=radius_km)
    origin = (req_facility.lat, req_facility.lon)
    nearby_results = find_nearby_facilities(
        origin=origin,
        facilities=candidate_facilities,
        radius_km=radius_km
    )

    # 6. Return top 2 results
    top_2 = nearby_results[:2]

    # 7. Check if empty list returned
    if not top_2:
        return NearbyAvailabilityResponse(
            facility_id=facility_id,
            medicine_id=medicine_id,
            medicine_name=medicine_name,
            radius_km=radius_km,
            nearby=[],
            message="no suitable nearby source",
            prompt_supplier_request=True
        )

    items = [
        NearbyFacilityItem(
            id=r["id"],
            name=r["name"],
            lat=r["lat"],
            lon=r["lon"],
            distance_km=r["distance_km"],
            available_qty=r["available_qty"],
            available_stock=r["available_qty"],
            avg_daily_consumption=r.get("avg_daily_consumption")
        )
        for r in top_2
    ]

    return NearbyAvailabilityResponse(
        facility_id=facility_id,
        medicine_id=medicine_id,
        medicine_name=medicine_name,
        radius_km=radius_km,
        nearby=items,
        message=None,
        prompt_supplier_request=False
    )
