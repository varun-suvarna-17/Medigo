import { useState, useEffect } from "react";
import { ShieldAlert, Search, CheckCircle2, Loader2 } from "lucide-react";
import { getShortageRisk } from "../services/api";

export default function ShortageAlert({
  facilityId = 4,
  onSelectMedicine,
  onCheckNearby,
}) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getShortageRisk(facilityId)
      .then((data) => {
        if (isMounted) {
          setRisks(data?.risks || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch shortage risks");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [facilityId]);

  const handleCheckNearby = (medicineId) => {
    if (onSelectMedicine) {
      onSelectMedicine(medicineId);
    } else if (onCheckNearby) {
      onCheckNearby(medicineId);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-soft rounded-2xl p-8 shadow-sm border border-accent-lt/40 flex items-center justify-center gap-3 text-dark/70 min-h-[160px]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="text-sm font-medium">Scanning inventory for shortage risks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40">
        <h2 className="font-bold text-lg text-dark mb-1">Shortage Risk Alerts</h2>
        <p className="text-sm text-red-600">Failed to fetch alerts: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Shortage Risk Alerts</h2>
            <p className="text-xs text-dark/70">Predictive analysis based on current consumption velocity</p>
          </div>
        </div>
        <div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              risks.length > 0
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {risks.length} {risks.length === 1 ? "Critical Alert" : "Critical Alerts"}
          </span>
        </div>
      </div>

      {/* Content */}
      {risks.length === 0 ? (
        <div className="p-6 bg-white rounded-xl border border-accent-lt/40 flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            No critical shortages detected. All monitored stock reserves are currently adequate.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((item) => (
            <div
              key={item.medicine_id}
              className="bg-white rounded-xl p-4 sm:p-5 border border-accent-lt/40 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-dark">
                    {item.name}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    Depletion Imminent
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-dark/70">
                  <span className="bg-bg-soft px-2.5 py-1 rounded-md font-medium">
                    Current Stock: <strong className="text-dark">{item.current_stock} units</strong>
                  </span>
                  <span className="bg-bg-soft px-2.5 py-1 rounded-md font-medium">
                    Daily Velocity: <strong className="text-dark">{item.avg_daily_consumption}/day</strong>
                  </span>
                  <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md font-bold border border-red-100">
                    {item.days_remaining} {item.days_remaining === 1 ? "day" : "days"} remaining
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleCheckNearby(item.medicine_id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Nearby</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
