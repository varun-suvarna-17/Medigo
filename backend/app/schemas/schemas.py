import enum
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from app.models.request import EmergencyLevel, RequestStatus


class FacilityBase(BaseModel):
    name: str
    lat: float
    lon: float


class FacilityResponse(FacilityBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class MedicineBase(BaseModel):
    name: str
    facility_id: int
    current_stock: float
    avg_daily_consumption: float
    requirement: float


class MedicineResponse(MedicineBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class StockResponse(BaseModel):
    facility_id: int
    stock: List[MedicineResponse]


class ShortageRiskItem(BaseModel):
    medicine_id: int
    name: str
    current_stock: float
    avg_daily_consumption: float
    requirement: float
    days_remaining: float
    shortage_risk: bool


class ShortageRiskResponse(BaseModel):
    facility_id: int
    risks: List[ShortageRiskItem]


class NearbyFacilityItem(BaseModel):
    id: int
    name: str
    lat: float
    lon: float
    distance_km: float
    available_qty: float
    available_stock: Optional[float] = None
    avg_daily_consumption: Optional[float] = None


class NearbyAvailabilityResponse(BaseModel):
    facility_id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    radius_km: float
    nearby: List[NearbyFacilityItem]
    message: Optional[str] = None
    prompt_supplier_request: bool = False


class RequestBase(BaseModel):
    facility_id: int
    medicine_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    emergency_level: EmergencyLevel = EmergencyLevel.MEDIUM
    status: RequestStatus = RequestStatus.PENDING


class RequestCreate(BaseModel):
    medicine_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    emergency_level: EmergencyLevel


class SupplierRequestCreate(RequestCreate):
    facility_id: int


class AllowedRequestStatus(str, enum.Enum):
    FULFILLED = "FULFILLED"
    REJECTED = "REJECTED"


class RequestStatusUpdate(BaseModel):
    status: AllowedRequestStatus


class RequestOut(BaseModel):
    id: int
    facility_id: int
    medicine_id: int
    quantity: float
    emergency_level: EmergencyLevel
    status: RequestStatus
    current_stock: Optional[float] = None
    created_at: datetime
    facility_name: Optional[str] = None
    medicine_name: Optional[str] = None
    priority_score: Optional[float] = None
    distance_km: Optional[float] = None
    days_remaining: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


RequestResponse = RequestOut


class RequestsListResponse(BaseModel):
    requests: List[RequestOut]


class ScoreBreakdown(BaseModel):
    emergency_score: float
    stock_score: float
    deficit_score: float


class PrioritizedRequestItem(BaseModel):
    request_id: int
    facility_id: int
    facility_name: Optional[str] = None
    facility_lat: Optional[float] = None
    facility_lon: Optional[float] = None
    medicine_id: int
    medicine_name: Optional[str] = None
    quantity: float
    emergency_level: str
    status: str
    created_at: Optional[str] = None
    priority_score: float
    days_remaining: float
    current_stock: float
    score_breakdown: ScoreBreakdown


class PrioritizedRequestsResponse(BaseModel):
    prioritized: List[PrioritizedRequestItem]
