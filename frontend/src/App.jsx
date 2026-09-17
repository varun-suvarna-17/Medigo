import { BrowserRouter, Routes, Route } from "react-router-dom";
import FacilityHome from "./pages/FacilityHome";
import SupplierHome from "./pages/SupplierHome";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import NearbyFacilities from "./pages/NearbyFacilities";
import FacilityRequest from "./pages/FacilityRequest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/facility" element={<FacilityHome />} />
        <Route path="/facility/nearby/:medicineId" element={<NearbyFacilities />} />
        <Route path="/facility/request/:medicineId" element={<FacilityRequest />} />
        <Route path="/supplier" element={<SupplierHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
