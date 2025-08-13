import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPhoto from "./components/upload/UploadPhoto";
import PickupOrDropoff from "./components/pickup/PickupOrDropoff";
import RecyclingCentreList from "./components/recyclingcentres/recycling-centre-list";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPhoto />} />
        <Route path="/pickup-or-dropoff" element={<PickupOrDropoff />} />
        <Route path="/recycling-centres" element={<RecyclingCentreList />} />
      </Routes>
    </Router>
  );
}
