import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createSupplierRequest } from "../services/api";

export default function SupplierRequestForm({
  facility_id,
  facilityId,
  medicine_id,
  medicineId,
  onSuccess,
}) {
  const activeFacilityId = facility_id ?? facilityId ?? 4;
  const activeMedicineId = medicine_id ?? medicineId ?? "";

  const [quantity, setQuantity] = useState("");
  const [emergencyLevel, setEmergencyLevel] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage("Please enter a valid quantity greater than 0");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        medicine_id: Number(activeMedicineId),
        quantity: qty,
        emergency_level: emergencyLevel,
      };

      const result = await createSupplierRequest(activeFacilityId, payload);
      setSuccessMessage(
        `Supplier replenishment request created successfully! Request ID: #${result.id} (Status: ${result.status})`
      );
      setQuantity("");
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 sm:p-7 border border-accent-lt/60 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between border-b border-accent-lt/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-bg-soft text-accent flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-dark">
            Direct Supplier Dispatch Request
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-soft text-accent">
          Automated Routing
        </span>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
            Facility ID (Pre-filled)
          </label>
          <input
            type="text"
            value={`Facility #${activeFacilityId}`}
            disabled
            className="w-full px-4 py-2.5 bg-bg-soft/70 border border-accent-lt/40 rounded-xl text-dark/70 text-sm cursor-not-allowed font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
            Medicine ID (Pre-filled)
          </label>
          <input
            type="text"
            value={`Medicine #${activeMedicineId}`}
            disabled
            placeholder="Medicine ID"
            className="w-full px-4 py-2.5 bg-bg-soft/70 border border-accent-lt/40 rounded-xl text-dark/70 text-sm cursor-not-allowed font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
            Required Quantity (Units)
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 250"
            className="w-full px-4 py-2.5 bg-white border border-accent-lt rounded-xl text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
            Emergency Priority Level
          </label>
          <select
            value={emergencyLevel}
            onChange={(e) => setEmergencyLevel(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-accent-lt rounded-xl text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-sm cursor-pointer"
          >
            <option value="LOW">LOW — Routine Replenishment</option>
            <option value="MEDIUM">MEDIUM — Projected Shortage</option>
            <option value="HIGH">HIGH — Critical Stock Depletion</option>
            <option value="CRITICAL">CRITICAL — Emergency Stockout</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !activeMedicineId}
        className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Dispatching Order...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Dispatch Request</span>
          </>
        )}
      </button>
    </form>
  );
}
