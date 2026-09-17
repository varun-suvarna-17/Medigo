import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { ArrowLeft, ArrowRight, X, Building2, MapPin, AlertCircle, Loader2, Send } from "lucide-react";
import { getNearbyAvailability } from "../services/api";

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom styled markers
const requestingFacilityIcon = L.divIcon({
  className: "custom-req-marker",
  html: `<div style="background-color: #1B2A38; color: #FDFEFE; border: 3px solid #4B87B3; border-radius: 9999px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(27,42,56,0.35); font-size: 16px;">🏥</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

const nearbyStockIcon = L.divIcon({
  className: "custom-nearby-marker",
  html: `<div style="background-color: #059669; color: #FDFEFE; border: 3px solid #E8F1F8; border-radius: 9999px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(5,150,105,0.35); font-size: 15px; cursor: pointer;">💊</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
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
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

// Progressively animated polyline route
function AnimatedRouteLine({ origin, destination, color = "#4B87B3" }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 0.05;
      if (current >= 1) {
        current = 1;
        clearInterval(interval);
      }
      setProgress(current);
    }, 25);

    return () => clearInterval(interval);
  }, [origin, destination]);

  const currentLat = origin[0] + (destination[0] - origin[0]) * progress;
  const currentLon = origin[1] + (destination[1] - origin[1]) * progress;

  return (
    <Polyline
      positions={[origin, [currentLat, currentLon]]}
      pathOptions={{
        color: color,
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.9,
      }}
    />
  );
}

export default function NearbyFacilities() {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const facilityId = 4;

  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [medicineName, setMedicineName] = useState(null);
  const [loading, setLoading] = useState(Boolean(medicineId));
  const [error, setError] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searched, setSearched] = useState(false);

  const originFacility = KNOWN_FACILITIES[facilityId] || {
    name: `Facility #${facilityId}`,
    lat: 12.8735,
    lon: 74.842,
  };
  const originPosition = [originFacility.lat, originFacility.lon];

  useEffect(() => {
    if (!medicineId) {
      return;
    }

    let isMounted = true;

    getNearbyAvailability(facilityId, medicineId)
      .then((data) => {
        if (isMounted) {
          const list = data?.nearby || [];
          setNearbyFacilities(list);
          setMedicineName(data?.medicine_name || null);
          setSearched(true);
          setLoading(false);
          // If facilities found, auto-select first facility into sidebar
          if (list.length > 0) {
            setSelectedFacility(list[0]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to locate nearby stock");
          setLoading(false);
          setSearched(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [facilityId, medicineId]);

  return (
    <div className="relative h-screen w-screen bg-bg text-dark font-sans antialiased overflow-hidden flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-400 max-w-[calc(100vw-2rem)] flex flex-wrap items-center gap-2 sm:gap-3 pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate("/facility")}
          className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-dark font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-md border border-accent-lt/60 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations</span>
        </button>

        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-accent-lt/60 flex items-center gap-2 text-xs sm:text-sm font-semibold text-dark">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {medicineName ? medicineName : `Medicine #${medicineId}`}
          </span>
          <span className="text-dark/40 font-normal">|</span>
          <span className="text-dark/70 font-normal">
            Origin: {originFacility.name}
          </span>
        </div>
      </div>

      {/* Main Full-Screen Map Container */}
      <div className="relative flex-1 w-full h-full z-0">
        <MapContainer
          center={originPosition}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <MapViewSync center={originPosition} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Requesting Facility Origin Marker */}
          <Marker position={originPosition} icon={requestingFacilityIcon}>
            <Popup>
              <div className="p-1 font-sans text-dark">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                  Your Facility (Origin)
                </span>
                <h4 className="font-bold text-sm text-dark">{originFacility.name}</h4>
                <p className="text-xs text-dark/70 mt-0.5">Facility #{facilityId}</p>
              </div>
            </Popup>
          </Marker>

          {/* Draw animated route lines and markers for nearby facilities */}
          {nearbyFacilities
            .filter((fac) => fac.lat && fac.lon)
            .map((fac) => (
              <div key={fac.id}>
                <AnimatedRouteLine
                  origin={originPosition}
                  destination={[fac.lat, fac.lon]}
                  color="#059669"
                />

                <Marker
                  position={[fac.lat, fac.lon]}
                  icon={nearbyStockIcon}
                  eventHandlers={{
                    click: () => setSelectedFacility(fac),
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans text-dark min-w-[160px]">
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
              </div>
            ))}
        </MapContainer>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-500">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-accent-lt/60 flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="text-sm font-semibold text-dark">Scanning regional availability routes...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="absolute top-20 left-4 z-400 max-w-md bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl shadow-md">
            {error}
          </div>
        )}

        {/* Empty State Slide-in Panel */}
        {searched && nearbyFacilities.length === 0 && !loading && (
          <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/80 z-500 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-dark">
                  No Regional Partner Stock Available
                </h3>
                <p className="text-xs text-dark/50 mt-0.5">
                  Search Radius: 25 km from Wenlock District Hospital
                </p>
              </div>

              <div className="p-4 bg-bg-soft rounded-xl border border-accent-lt/40 text-xs sm:text-sm text-dark/80 leading-relaxed">
                No nearby facility has this medicine available in stock. You can escalate directly to suppliers for expedited replenishment.
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/facility/request/${medicineId}`)}
                className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-sm cursor-pointer"
              >
                <span>Request from Supplier</span>
                <Send className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/facility")}
                className="w-full text-center text-xs text-dark/70 hover:text-accent font-medium py-2 transition-colors cursor-pointer"
              >
                Return to Facility Operations
              </button>
            </div>
          </div>
        )}

        {/* Selected Facility Details Sidebar (Slide-in) */}
        {selectedFacility && nearbyFacilities.length > 0 && (
          <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-accent-lt/60 z-500 p-6 flex flex-col justify-between transition-all duration-300">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-accent-lt/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Transfer Source
                    </span>
                    <h3 className="font-bold text-base text-dark leading-snug">
                      {selectedFacility.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="p-1 rounded-full text-dark/50 hover:text-dark hover:bg-bg-soft transition-colors cursor-pointer"
                  title="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <div className="p-4 bg-bg-soft rounded-xl border border-accent-lt/40 space-y-1">
                  <span className="text-xs text-dark/70">Medicine Available</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-dark text-sm">
                      {medicineName || `Medicine #${medicineId}`}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
                      {selectedFacility.available_qty ?? selectedFacility.available_stock} units
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-bg-soft rounded-xl border border-accent-lt/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-xs text-dark/70">Transit Distance</span>
                  </div>
                  <span className="font-semibold text-dark text-sm">
                    {selectedFacility.distance_km} km
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 leading-relaxed">
                  Route line drawn from <strong>{originFacility.name}</strong> to <strong>{selectedFacility.name}</strong>. Stock reserve verified.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-accent-lt/20">
              <button
                type="button"
                onClick={() => navigate(`/facility/request/${medicineId}`)}
                className="w-full inline-flex items-center justify-center gap-2 bg-white border border-accent-lt text-dark hover:bg-bg-soft font-semibold py-3 px-4 rounded-full text-xs transition-all duration-200 shadow-xs cursor-pointer"
              >
                <span>Or Request from Supplier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
