import { useState, useEffect } from "react";
import { Inbox, AlertCircle, Loader2, Sparkles, Check, X } from "lucide-react";
import { getSupplierRequests, updateRequestStatus } from "../services/api";

export default function SupplierDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getSupplierRequests()
      .then((data) => {
        if (isMounted) {
          // Do not re-sort client side: backend already sorts by descending priority_score
          setRequests(Array.isArray(data) ? data : data?.requests || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch supplier requests");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    setActionError(null);
    try {
      const updated = await updateRequestStatus(id, newStatus);
      // Update that row's status in local state immediately without altering sort order
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      setActionError(err.message || `Failed to update request #${id}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-soft rounded-2xl p-8 shadow-sm border border-accent-lt/40 flex items-center justify-center gap-3 text-dark/70 min-h-[220px]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="text-sm font-medium">Fetching prioritized fulfillment queue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40">
        <div className="flex items-center gap-3 text-red-700 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h2 className="font-bold text-lg">Prioritized Requests</h2>
        </div>
        <p className="text-sm text-red-600">Failed to load requests: {error}</p>
      </div>
    );
  }

  const getEmergencyBadge = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200 font-bold";
      case "HIGH":
        return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
      case "MEDIUM":
        return "bg-sky-50 text-sky-700 border-sky-200 font-medium";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 font-medium";
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-accent flex items-center justify-center shadow-xs">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Prioritized Requests Queue</h2>
            <p className="text-xs text-dark/70">
              Ranked dynamically by patient severity, distance, and supply buffer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-dark/80 border border-accent-lt/60">
            {pendingCount} Pending Orders
          </span>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-accent-lt/40 text-dark/70 text-sm">
          No fulfillment requests found. All facility orders are up to date.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-accent-lt/40 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-accent-lt/30 bg-bg-soft/50 text-dark/70 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Hospital / Clinic</th>
                  <th className="py-3.5 px-4 sm:px-6">Requested Medicine</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Quantity</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Emergency Level</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Priority Score</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-lt/20 text-dark">
                {requests.map((req) => {
                  const isUpdating = updatingId === req.id;
                  const isPending = req.status === "PENDING";

                  return (
                    <tr key={req.id} className="hover:bg-bg-soft/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-dark">
                        {req.facility_name || `Facility #${req.facility_id}`}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-dark/90 font-medium">
                        {req.medicine_name || `Medicine #${req.medicine_id}`}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-semibold text-dark">
                        {req.quantity.toLocaleString()} units
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getEmergencyBadge(
                            req.emergency_level
                          )}`}
                        >
                          {req.emergency_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bg-soft text-accent border border-accent-lt/60 font-bold text-xs">
                          <Sparkles className="w-3 h-3" />
                          {req.priority_score != null
                            ? Number(req.priority_score).toFixed(1)
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(req.id, "FULFILLED")}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                              className="inline-flex items-center gap-1 bg-white border border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : req.status === "FULFILLED" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>FULFILLED</span>
                          </span>
                        ) : req.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <X className="w-3 h-3" />
                            <span>REJECTED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-soft text-dark/70 border border-accent-lt/40">
                            {req.status}
                          </span>
                        )}
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
