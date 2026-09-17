import { BrowserRouter, Routes, Route } from "react-router-dom";
import FacilityHome from "./pages/FacilityHome";
import SupplierHome from "./pages/SupplierHome";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/facility" element={<FacilityHome />} />
        <Route path="/supplier" element={<SupplierHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
