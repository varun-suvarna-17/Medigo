import { Link } from "react-router-dom";
import { Activity, MapPin, Truck, ArrowRight, Pill } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-dark flex flex-col justify-between selection:bg-accent-lt selection:text-dark font-sans antialiased">
      {/* 1. Minimal Top Nav */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-dark font-bold text-xl sm:text-2xl tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="w-9 h-9 rounded-full bg-bg-soft flex items-center justify-center text-accent shadow-sm">
            <Pill className="w-5 h-5 rotate-45" />
          </span>
          <span>Medi<span className="text-accent">Go</span></span>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white font-medium text-sm sm:text-base px-5 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
        >
          Log In
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-12 lg:py-16 flex-1 flex flex-col justify-center">
        {/* 2. Hero Section */}
        <section className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <span className="inline-block text-xs uppercase tracking-widest font-semibold text-accent mb-4 px-3.5 py-1 rounded-full bg-bg-soft">
            Healthcare Supply Intelligence
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-dark leading-[1.12] sm:leading-[1.15] text-balance">
            The right medicine, from the right source, at the right time.
          </h1>

          <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-dark/80 max-w-2xl leading-relaxed text-balance">
            Predictive shortage detection and automated supply coordination to safeguard patient care across clinical networks.
          </p>

          <div className="mt-8 sm:mt-10">
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-base sm:text-lg px-8 sm:px-9 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* 3. Feature Strip (3 Columns) */}
        <section className="mt-12 sm:mt-16 lg:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="bg-bg-soft rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-white text-accent flex items-center justify-center mb-5 shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-dark mb-2">
                Early Shortage Detection
              </h2>
              <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
                Continuous inventory tracking flags critical depletion risks days before stockouts disrupt care.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-bg-soft rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-white text-accent flex items-center justify-center mb-5 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-dark mb-2">
                Nearby Availability Check
              </h2>
              <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
                Scan regional hospital systems and verified partner facilities instantly for immediate stock reserves.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-bg-soft rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-white text-accent flex items-center justify-center mb-5 shadow-sm">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-dark mb-2">
                Smart Supplier Coordination
              </h2>
              <p className="text-dark/80 text-sm sm:text-base leading-relaxed">
                Automated dispatch and priority order routing connect pharmacies directly with trusted distributors.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 text-center">
        <p className="text-xs sm:text-sm text-dark/70 font-medium">
          © 2026 MediGo | Hackathon MVP
        </p>
      </footer>
    </div>
  );
}
