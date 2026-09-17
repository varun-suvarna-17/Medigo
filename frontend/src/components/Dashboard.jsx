import { useState, useEffect } from "react";
import { Package, AlertCircle, Loader2 } from "lucide-react";
import { getFacilityStock } from "../services/api";

export default function Dashboard({ facilityId = 4 }) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getFacilityStock(facilityId)
      .then((data) => {
        if (isMounted) {
          setStock(data?.stock || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch stock data");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [facilityId]);

  if (loading) {
    return (
      <div className="bg-bg-soft rounded-2xl p-8 shadow-sm border border-accent-lt/40 flex items-center justify-center gap-3 text-dark/70 min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="text-sm font-medium">Loading inventory overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40">
        <div className="flex items-center gap-3 text-red-700 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h2 className="font-bold text-lg">Current Stock Overview</h2>
        </div>
        <p className="text-sm text-red-600">Failed to load stock: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-accent flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Current Stock Overview</h2>
            <p className="text-xs text-dark/70">Monitored pharmaceuticals at this site</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-dark/80 border border-accent-lt/60">
            {stock.length} Medicines Monitored
          </span>
        </div>
      </div>

      {/* Stock Table */}
      {stock.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-accent-lt/40 text-dark/70 text-sm">
          No medicine stock records found for this facility.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-accent-lt/40 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-accent-lt/30 bg-bg-soft/50 text-dark/70 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Medicine Name</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Current Stock</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Avg Daily Consumption</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-lt/20 text-dark">
                {stock.map((item) => {
                  const daysLeft = item.avg_daily_consumption > 0 
                    ? Math.floor(item.current_stock / item.avg_daily_consumption) 
                    : 99;
                  const isLow = daysLeft <= 5;

                  return (
                    <tr key={item.id} className="hover:bg-bg-soft/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-dark">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-medium">
                        {item.current_stock.toLocaleString()} units
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right text-dark/80">
                        {item.avg_daily_consumption} / day
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isLow
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isLow ? "Low Reserve" : "Adequate"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
