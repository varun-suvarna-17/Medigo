const BASE_URL = "http://localhost:8000";

export async function getShortageRisk(facilityId) {
  const res = await fetch(`${BASE_URL}/facility/${facilityId}/shortage-risk`);
  return res.json();
}

export async function getNearbyAvailability(facilityId, medicineId) {
  const res = await fetch(
    `${BASE_URL}/shortage/nearby?facility_id=${facilityId}&medicine_id=${medicineId}`
  );
  return res.json();
}

export async function getSupplierRequests() {
  const res = await fetch(`${BASE_URL}/supplier/requests/prioritized`);
  return res.json();
}
