import { Link, useNavigate } from "react-router-dom";
import { Pill, ArrowLeft, Building2, Truck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleFacilityLogin = (e) => {
    if (e) e.preventDefault();
    navigate("/facility");
  };

  const handleSupplierLogin = (e) => {
    if (e) e.preventDefault();
    navigate("/supplier");
  };

  return (
    <div className="min-h-screen bg-bg text-dark flex flex-col justify-center items-center px-4 sm:px-6 selection:bg-accent-lt selection:text-dark font-sans antialiased">
      <div className="w-full max-w-md bg-bg-soft rounded-2xl p-8 sm:p-10 shadow-sm">
        {/* Brand / Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-dark font-bold text-2xl tracking-tight mb-3 transition-opacity hover:opacity-90"
          >
            <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-accent shadow-sm">
              <Pill className="w-5 h-5 rotate-45" />
            </span>
            <span>Medi<span className="text-accent">Go</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Log In</h1>
          <p className="text-sm text-dark/70 mt-1">Select a role below to explore the platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFacilityLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
              Username
            </label>
            <input
              className="w-full px-4 py-3 bg-white border border-accent-lt rounded-xl text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-sm"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark/70 mb-1.5">
              Password
            </label>
            <input
              className="w-full px-4 py-3 bg-white border border-accent-lt rounded-xl text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-sm"
              type="password"
              placeholder="Password"
            />
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleFacilityLogin}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-base flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5" />
              <span>Login as Facility</span>
            </button>

            <button
              type="button"
              onClick={handleSupplierLogin}
              className="w-full bg-white hover:bg-accent-lt/30 text-dark border border-accent-lt font-semibold py-3.5 px-6 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-base flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5 text-accent" />
              <span>Login as Supplier</span>
            </button>
          </div>
        </form>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-dark/70 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
