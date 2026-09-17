const BASE_URL = "http://localhost:8000";

export async function getFacilityStock(facilityId) {
  const res = await fetch(`${BASE_URL}/facility/${facilityId}/stock`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch stock (${res.status})`);
  }
  return res.json();
}

export async function getShortageRisk(facilityId) {
  const res = await fetch(`${BASE_URL}/facility/${facilityId}/shortage-risk`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch shortage risk (${res.status})`);
  }
  return res.json();
}

export async function getNearbyAvailability(facilityId, medicineId, radiusKm = 25) {
  const res = await fetch(
    `${BASE_URL}/shortage/nearby?facility_id=${facilityId}&medicine_id=${medicineId}&radius_km=${radiusKm}`
  );
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch nearby availability (${res.status})`);
  }
  return res.json();
}

export async function createSupplierRequest(facilityId, requestData) {
  const res = await fetch(`${BASE_URL}/facility/${facilityId}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to submit request (${res.status})`);
  }
  return res.json();
}

export const createFacilityRequest = createSupplierRequest;

export async function getSupplierRequests() {
  const res = await fetch(`${BASE_URL}/supplier/requests/prioritized`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch supplier requests (${res.status})`);
  }
  return res.json();
}

export async function updateRequestStatus(requestId, status) {
  const res = await fetch(`${BASE_URL}/supplier/requests/${requestId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to update request status (${res.status})`);
  }
  return res.json();
}

