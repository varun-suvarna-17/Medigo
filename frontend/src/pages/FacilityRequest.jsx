import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2, Building2, Package } from "lucide-react";
import { getFacilityStock, createSupplierRequest } from "../services/api";

export default function FacilityRequest() {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const facilityId = 4;

  const [medicine, setMedicine] = useState(null);
  const [loadingMedicine, setLoadingMedicine] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [emergencyLevel, setEmergencyLevel] = useState("HIGH");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getFacilityStock(facilityId)
      .then((data) => {
        if (isMounted) {
          const list = data?.stock || [];
          const matched = list.find((m) => String(m.id) === String(medicineId));
          if (matched) {
            setMedicine(matched);
            // Default quantity calculation
            const deficit = matched.requirement
              ? Math.max(50, Math.round(matched.requirement - matched.current_stock))
              : 150;
            setQuantity(String(deficit > 0 ? deficit : 100));
          } else {
            // Fallback object
            setMedicine({
              id: Number(medicineId),
              name: `Medicine #${medicineId}`,
              current_stock: 0,
            });
            setQuantity("100");
          }
          setLoadingMedicine(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMedicine({
            id: Number(medicineId),
            name: `Medicine #${medicineId}`,
            current_stock: 0,
          });
          setQuantity("100");
          setLoadingMedicine(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [facilityId, medicineId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage("Please enter a valid required quantity greater than 0");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Please provide a reason or clinical context for this replenishment request.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        medicine_id: Number(medicineId),
        quantity: qty,
        emergency_level: emergencyLevel,
        reason: reason.trim(),
      };

      const result = await createSupplierRequest(facilityId, payload);
      setSuccessResult(result);
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit supplier request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-dark font-sans antialiased selection:bg-accent-lt selection:text-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/facility/nearby/${medicineId}`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-dark/70 hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Availability Map</span>
          </button>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-bg-soft text-accent">
            Feature 4: Assisted Request
          </span>
        </div>

        {/* Card Form */}
        <div className="bg-bg-soft rounded-2xl p-6 sm:p-8 shadow-sm border border-accent-lt/40 space-y-6">
          {/* Header */}
          <div className="border-b border-accent-lt/30 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-dark">
              Escalate Supplier Replenishment
            </h1>
            <p className="mt-1 text-sm text-dark/70">
              Direct priority dispatch routing to verified pharmaceutical distributors.
            </p>
          </div>

          {successResult ? (
            <div className="bg-white rounded-xl p-6 border border-emerald-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-dark">
                  Request Dispatched to Supplier Hub
                </h2>
                <p className="text-xs text-dark/60 mt-1">
                  Assigned Request ID: <strong className="text-dark">#{successResult.id}</strong> (Status: {successResult.status})
                </p>
              </div>

              <div className="p-4 bg-bg-soft rounded-xl text-xs text-left text-dark/80 space-y-1.5 border border-accent-lt/40">
                <div><strong>Medicine:</strong> {medicine?.name}</div>
                <div><strong>Quantity Requested:</strong> {successResult.quantity} units</div>
                <div><strong>Emergency Level:</strong> {successResult.emergency_level}</div>
                <div><strong>Reason:</strong> {successResult.reason || reason}</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/facility")}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm cursor-pointer"
                >
                  Return to Facility Operations
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/supplier")}
                  className="bg-white hover:bg-bg-soft border border-accent-lt text-dark font-medium text-sm px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  View Supplier Queue
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Readonly Context Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
                    Requesting Facility (Pre-filled)
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-accent-lt/50 rounded-xl text-dark text-sm font-medium">
                    <Building2 className="w-4 h-4 text-accent" />
                    <span>Wenlock District Hospital (#4)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
                    Medicine (Pre-filled)
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-accent-lt/50 rounded-xl text-dark text-sm font-medium">
                    <Package className="w-4 h-4 text-accent" />
                    <span>{loadingMedicine ? "Loading..." : medicine?.name}</span>
                  </div>
                </div>
              </div>

              {/* Current Stock Snapshot */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
                  Current Facility Stock Snapshot (Pre-filled)
                </label>
                <div className="px-3.5 py-2.5 bg-white border border-accent-lt/50 rounded-xl text-dark/80 text-sm font-medium">
                  {loadingMedicine ? (
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  ) : (
                    <span>
                      <strong className="text-red-700">{medicine?.current_stock} units</strong> remaining in active reserves
                    </span>
                  )}
                </div>
              </div>

              {/* Required Quantity & Emergency Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
                    Required Quantity (Editable)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter required units"
                    className="w-full px-4 py-2.5 bg-white border border-accent-lt rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
                    Emergency Level
                  </label>
                  <select
                    value={emergencyLevel}
                    onChange={(e) => setEmergencyLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-accent-lt rounded-xl text-dark text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-pointer"
                  >
                    <option value="CRITICAL">CRITICAL — Emergency Stockout</option>
                    <option value="HIGH">HIGH — Imminent Depletion</option>
                    <option value="MEDIUM">MEDIUM — Projected Shortage</option>
                    <option value="LOW">LOW — Routine Replenishment</option>
                  </select>
                </div>
              </div>

              {/* Reason for Request Textarea */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
                  Reason for Request (Clinical Context) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this request is needed, urgency context, patient load, or geographical constraints (e.g. 'Trauma ward surge; nearby clinics reported 0 available reserve')."
                  className="w-full px-4 py-3 bg-white border border-accent-lt rounded-xl text-dark placeholder:text-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || loadingMedicine}
                className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Transmitting Dispatch Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request to Supplier</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
