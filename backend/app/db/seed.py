from sqlalchemy.orm import Session
from app.db.database import Base, engine, SessionLocal
from app.db.seed_data import facilities, medicines
from app.models.facility import Facility
from app.models.medicine import Medicine
from app.models.request import Request, EmergencyLevel, RequestStatus


def seed_db(db: Session = None):
    own_session = False
    if db is None:
        db = SessionLocal()
        own_session = True

    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

        # 1. Seed Facilities
        for fac_data in facilities:
            existing_facility = db.query(Facility).filter(Facility.id == fac_data["id"]).first()
            if not existing_facility:
                facility = Facility(
                    id=fac_data["id"],
                    name=fac_data["name"],
                    lat=fac_data["lat"],
                    lon=fac_data["lon"]
                )
                db.add(facility)
            else:
                existing_facility.name = fac_data["name"]
                existing_facility.lat = fac_data["lat"]
                existing_facility.lon = fac_data["lon"]

        db.flush()

        # 2. Seed Medicines
        for med_data in medicines:
            existing_medicine = db.query(Medicine).filter(Medicine.id == med_data["id"]).first()
            if not existing_medicine:
                medicine = Medicine(
                    id=med_data["id"],
                    name=med_data["name"],
                    facility_id=med_data["facility_id"],
                    current_stock=med_data["current_stock"],
                    avg_daily_consumption=med_data["avg_daily_consumption"],
                    requirement=med_data["requirement"]
                )
                db.add(medicine)
            else:
                existing_medicine.name = med_data["name"]
                existing_medicine.facility_id = med_data["facility_id"]
                existing_medicine.current_stock = med_data["current_stock"]
                existing_medicine.avg_daily_consumption = med_data["avg_daily_consumption"]
                existing_medicine.requirement = med_data["requirement"]

        db.flush()

        # 3. Seed Sample Requests (if none exist)
        sample_requests = [
            {
                "id": 1,
                "facility_id": 2,  # Sahyadri Medical Centre
                "medicine_id": 3,  # Insulin (15 stock, 5 cons -> 3 days)
                "quantity": 85,
                "emergency_level": EmergencyLevel.CRITICAL,
                "status": RequestStatus.PENDING
            },
            {
                "id": 2,
                "facility_id": 4,  # Wenlock District Hospital
                "medicine_id": 7,  # Amoxicillin (10 stock, 8 cons -> 1.25 days)
                "quantity": 190,
                "emergency_level": EmergencyLevel.HIGH,
                "status": RequestStatus.PENDING
            },
            {
                "id": 3,
                "facility_id": 5,  # Kadri Community Clinic
                "medicine_id": 9,  # Paracetamol (25 stock, 9 cons -> 2.7 days)
                "quantity": 75,
                "emergency_level": EmergencyLevel.MEDIUM,
                "status": RequestStatus.PENDING
            },
            {
                "id": 4,
                "facility_id": 1,  # City General Hospital
                "medicine_id": 1,  # Paracetamol (120 stock, 20 cons -> 6 days)
                "quantity": 180,
                "emergency_level": EmergencyLevel.LOW,
                "status": RequestStatus.PENDING
            }
        ]

        for req_data in sample_requests:
            existing_req = db.query(Request).filter(Request.id == req_data["id"]).first()
            if not existing_req:
                req = Request(
                    id=req_data["id"],
                    facility_id=req_data["facility_id"],
                    medicine_id=req_data["medicine_id"],
                    quantity=req_data["quantity"],
                    emergency_level=req_data["emergency_level"],
                    status=req_data["status"]
                )
                db.add(req)

        db.commit()
        print("Database seeded successfully with duplicate guard!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if own_session:
            db.close()


if __name__ == "__main__":
    seed_db()