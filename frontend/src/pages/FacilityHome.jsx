import Dashboard from "../components/Dashboard";
import ShortageAlert from "../components/ShortageAlert";
import NearbyMap from "../components/NearbyMap";

export default function FacilityHome() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Facility Dashboard</h1>
      <Dashboard />
      <ShortageAlert />
      <NearbyMap />
    </div>
  );
}
