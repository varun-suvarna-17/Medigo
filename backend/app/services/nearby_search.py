from math import radians, sin, cos, sqrt, atan2


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def find_nearby_facilities(origin, facilities, radius_km=25):
    """origin: (lat, lon). facilities: list of dicts with lat/lon. Returns those within radius, sorted by distance."""
    results = []
    for f in facilities:
        dist = haversine_km(origin[0], origin[1], f["lat"], f["lon"])
        if dist <= radius_km:
            results.append({**f, "distance_km": round(dist, 2)})
    return sorted(results, key=lambda x: x["distance_km"])
