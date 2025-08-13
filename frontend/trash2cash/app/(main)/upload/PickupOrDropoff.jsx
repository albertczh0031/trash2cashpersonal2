import { useLocation, useNavigate } from "react-router-dom";

export default function PickupOrDropoff() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = location.state || {};

  const handleSelection = (option) => {
    console.log(`Selected: ${option}, Category: ${category}`);
    navigate("/recycling-centers", { state: { category, option } });
  };

  return (
    <div className="container">
      <h3>How would you like to proceed?</h3>
      <button
        onClick={() => handleSelection("Pickup")}
        className="option-button"
      >
        Pickup
      </button>
      <button
        onClick={() => handleSelection("Dropoff")}
        className="option-button"
      >
        Dropoff
      </button>
    </div>
  );
}
