import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPin, AlertCircle, PlusCircle, Compass, Loader2, Navigation } from "lucide-react";
import { getNearbyAvailability } from "../services/api";
import SupplierRequestForm from "./SupplierRequestForm";

// Fix default Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons to differentiate requesting facility vs nearby stock facilities
const requestingFacilityIcon = L.divIcon({
  className: "custom-req-marker",
  html: `<div style="background-color: #1B2A38; color: #FDFEFE; border: 3px solid #4B87B3; border-radius: 9999px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(27,42,56,0.35); font-size: 15px;">🏥</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const nearbyStockIcon = L.divIcon({
  className: "custom-nearby-marker",
  html: `<div style="background-color: #059669; color: #FDFEFE; border: 3px solid #E8F1F8; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(5,150,105,0.3); font-size: 14px;">💊</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const KNOWN_FACILITIES = {
  1: { name: "City General Hospital", lat: 12.9141, lon: 74.856 },
  2: { name: "Sahyadri Medical Centre", lat: 12.8846, lon: 74.8427 },
  3: { name: "Unity Health Hospital", lat: 12.8698, lon: 74.842 },
  4: { name: "Wenlock District Hospital", lat: 12.8735, lon: 74.842 },
  5: { name: "Kadri Community Clinic", lat: 12.9089, lon: 74.8478 },
};

function MapViewSync({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 11);
    }
  }, [center, map]);
  return null;
}

export default function NearbyMap({
  medicine_id,
  medicineId,
  facility_id,
  facilityId = 4,
}) {
  const currentFacilityId = facility_id ?? facilityId ?? 4;
  const currentMedicineId = medicine_id ?? medicineId;

  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  // Determine requesting facility location
  const requestingFacility = KNOWN_FACILITIES[currentFacilityId] || {
    name: `Facility #${currentFacilityId}`,
    lat: 12.8735,
    lon: 74.842,
  };
  const centerPosition = [requestingFacility.lat, requestingFacility.lon];

  useEffect(() => {
    if (!currentMedicineId) {
      return;
    }

    let isMounted = true;

    getNearbyAvailability(currentFacilityId, currentMedicineId)
      .then((data) => {
        if (isMounted) {
          setNearbyFacilities(data?.nearby || []);
          setSearched(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch nearby availability");
          setLoading(false);
          setSearched(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentFacilityId, currentMedicineId]);

  return (
    <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-accent flex items-center justify-center shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Regional Availability Map</h2>
            <p className="text-xs text-dark/70">Interactive OpenStreetMap network of nearby medical facilities</p>
          </div>
        </div>

        {currentMedicineId && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white text-accent border border-accent-lt/60">
              <Compass className="w-3.5 h-3.5" />
              Active Medicine ID: #{currentMedicineId}
            </span>
          </div>
        )}
      </div>

      {/* Map Component Container */}
      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-xs border border-accent-lt/40 z-0">
        <MapContainer
          center={centerPosition}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <MapViewSync center={centerPosition} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Requesting Facility Marker */}
          <Marker position={centerPosition} icon={requestingFacilityIcon}>
            <Popup>
              <div className="p-1 font-sans text-dark">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                  Your Facility (Origin)
                </span>
                <h4 className="font-bold text-sm text-dark">{requestingFacility.name}</h4>
                <p className="text-xs text-dark/70 mt-0.5">Facility #{currentFacilityId}</p>
              </div>
            </Popup>
          </Marker>

          {/* Nearby Facility Markers */}
          {nearbyFacilities
            .filter((fac) => fac.lat && fac.lon)
            .map((fac) => (
              <Marker
                key={fac.id}
                position={[fac.lat, fac.lon]}
                icon={nearbyStockIcon}
              >
                <Popup>
                  <div className="p-1 font-sans text-dark min-w-[150px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Transfer Source
                    </span>
                    <h4 className="font-bold text-sm text-dark">{fac.name}</h4>
                    <p className="text-xs text-dark/70 mt-0.5">
                      Distance: <strong className="text-dark">{fac.distance_km} km</strong>
                    </p>
                    <p className="text-xs font-bold text-emerald-700 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                      Available: {fac.available_qty ?? fac.available_stock} units
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Informational overlay when no medicine selected */}
        {!currentMedicineId && (
          <div className="absolute inset-x-4 bottom-4 pointer-events-none z-400">
            <div className="bg-white/95 backdrop-blur-xs rounded-xl p-3 text-center border border-accent-lt/60 shadow-sm text-xs text-dark/80 flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              <span>Click &ldquo;Check Nearby&rdquo; on an active shortage alert to locate peer facilities with stock.</span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Status / Action section */}
      {loading ? (
        <div className="bg-white rounded-xl p-6 border border-accent-lt/40 flex items-center justify-center gap-3 text-dark/70">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm font-medium">Scanning regional partner facilities...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-5 border border-red-200 text-red-600 text-sm">
          Failed to fetch nearby availability: {error}
        </div>
      ) : searched && nearbyFacilities.length === 0 ? (
        <div className="bg-white rounded-xl p-6 border border-amber-200/80 space-y-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-dark">No Regional Partner Stock Available</h3>
              <p className="text-xs text-dark/70 mt-0.5">
                No nearby facility within the 25km radius currently holds surplus inventory for this medication.
              </p>
            </div>
          </div>

          {!showSupplierForm ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSupplierForm(true)}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise Supplier Request</span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <SupplierRequestForm
                facility_id={currentFacilityId}
                medicine_id={currentMedicineId}
              />
            </div>
          )}
        </div>
      ) : nearbyFacilities.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-dark/70">
            <span>Verified transfer sources plotted on map:</span>
            <span className="font-semibold text-accent">{nearbyFacilities.length} locations available</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {nearbyFacilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-xl p-5 border border-accent-lt/40 shadow-xs hover:border-accent/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-dark">{fac.name}</h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-bg-soft text-accent">
                      {fac.distance_km} km away
                    </span>
                  </div>
                  <p className="text-xs text-dark/60 mt-1">Verified partner medical facility</p>
                </div>

                <div className="flex items-center justify-between border-t border-accent-lt/20 pt-3">
                  <span className="text-xs text-dark/70 font-medium">Available Transfer Reserve:</span>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    {fac.available_qty ?? fac.available_stock} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
