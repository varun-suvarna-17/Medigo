facilities = [
    {"id": 1, "name": "City General Hospital", "lat": 12.9141, "lon": 74.8560},
    {"id": 2, "name": "Sahyadri Medical Centre", "lat": 12.8846, "lon": 74.8427},
    {"id": 3, "name": "Unity Health Hospital", "lat": 12.8698, "lon": 74.8420},
    {"id": 4, "name": "Wenlock District Hospital", "lat": 12.8735, "lon": 74.8420},
    {"id": 5, "name": "Kadri Community Clinic", "lat": 12.9089, "lon": 74.8478},
]

medicines = [
    # facility 1 - City General Hospital
    {"id": 1, "name": "Paracetamol",      "facility_id": 1, "current_stock": 120, "avg_daily_consumption": 20, "requirement": 300},
    {"id": 2, "name": "Amoxicillin",      "facility_id": 1, "current_stock": 40,  "avg_daily_consumption": 10, "requirement": 200},

    # facility 2 - Sahyadri Medical Centre
    {"id": 3, "name": "Insulin",          "facility_id": 2, "current_stock": 15,  "avg_daily_consumption": 5,  "requirement": 100},
    {"id": 4, "name": "ORS Sachets",      "facility_id": 2, "current_stock": 300, "avg_daily_consumption": 15, "requirement": 250},

    # facility 3 - Unity Health Hospital
    {"id": 5, "name": "Ibuprofen",        "facility_id": 3, "current_stock": 80,  "avg_daily_consumption": 12, "requirement": 150},
    {"id": 6, "name": "Insulin",          "facility_id": 3, "current_stock": 60,  "avg_daily_consumption": 4,  "requirement": 80},

    # facility 4 - Wenlock District Hospital
    {"id": 7, "name": "Amoxicillin",      "facility_id": 4, "current_stock": 10,  "avg_daily_consumption": 8,  "requirement": 200},
    {"id": 8, "name": "IV Fluids",        "facility_id": 4, "current_stock": 200, "avg_daily_consumption": 25, "requirement": 400},

    # facility 5 - Kadri Community Clinic
    {"id": 9,  "name": "Paracetamol",     "facility_id": 5, "current_stock": 25,  "avg_daily_consumption": 9,  "requirement": 100},
    {"id": 10, "name": "ORS Sachets",     "facility_id": 5, "current_stock": 50,  "avg_daily_consumption": 6,  "requirement": 100},
]
