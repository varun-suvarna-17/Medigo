import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import Dashboard from "../components/Dashboard";
import ShortageAlert from "../components/ShortageAlert";
import NearbyMap from "../components/NearbyMap";

export default function FacilityHome() {
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const facilityId = 4;

  return (
    <div className="min-h-screen bg-bg text-dark font-sans antialiased selection:bg-accent-lt selection:text-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation / Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-dark/70 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Role / Logout</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-soft text-accent text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility #4 Active</span>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            Facility Operations
          </h1>
          <p className="mt-1.5 text-base sm:text-lg text-dark/70">
            Live inventory tracking, early shortage alerts, and local availability coordination.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1: Dashboard / Stock Overview */}
          <Dashboard facilityId={facilityId} />

          {/* Section 2: Shortage Risk Alerts */}
          <ShortageAlert
            facilityId={facilityId}
            onSelectMedicine={setSelectedMedicineId}
            onCheckNearby={setSelectedMedicineId}
          />

          {/* Section 3: Nearby Availability & Supplier Request */}
          <NearbyMap
            facilityId={facilityId}
            medicine_id={selectedMedicineId}
          />
        </div>
      </div>
    </div>
  );
}
