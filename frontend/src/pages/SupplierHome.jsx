import { Link } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";
import SupplierDashboard from "../components/SupplierDashboard";

export default function SupplierHome() {
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
            <Truck className="w-3.5 h-3.5" />
            <span>Supplier Portal Active</span>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            Supplier Fulfillment Portal
          </h1>
          <p className="mt-1.5 text-base sm:text-lg text-dark/70">
            Automated inbound replenishment requests prioritized by clinical urgency algorithms.
          </p>
        </div>

        {/* Section: Supplier Dashboard */}
        <div>
          <SupplierDashboard />
        </div>
      </div>
    </div>
  );
}
