"use client";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale,  ArcElement, Tooltip, Legend } from "chart.js";
import SliderRangeSelector from "./slider";
Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend );

// StatisticsPage component fetches and displays statistics from the backend API
export default function StatisticsPage() {
    // State to hold statistics data
  const [stats, setStats] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // Stores any error message if the API request fails
  const [error, setError] = useState(null);

  // Example: set min/max dates for the slider
  const minDate = "2025-07-08";
  const maxDate = "2025-08-07";

  // Convert slider date string like "9 Aug 2025" to "2025-08-09"
  const formatForApi = (dateOrStr) => {
    const d = new Date(dateOrStr);
    return d.toISOString().split("T")[0];
  };

  // Fetch statistics for a given date range and save to `stats`
  const fetchStatistics = async (start, end) => {
    try {
      setLoading(true);
      setError(null);
      const startFormatted = formatForApi(start);
      const endFormatted = formatForApi(end);
      const url = `https://trash2cashpersonal2.onrender.com/api/analytics/statistics/?start=${startFormatted}&end=${endFormatted}`;
      console.log("Fetching:", url);

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} - ${txt.slice(0, 300)}`);
      }
      const json = await res.json();
      setStats(json);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(err.message || String(err));
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Slider callback: call fetchStatistics with slider values
  const handleDateRangeChange = (start, end) => {
    fetchStatistics(start, end);
  };

  // Initial fetch on mount (use full range or empty to fetch all)
  useEffect(() => {
    // Option 1: fetch for full slider range
    fetchStatistics(minDate, maxDate);
    }, []); // only on mount


  // Prepare data for the bar chart
  const centreMaterialData = stats?.recycled_by_centre_and_material || {};
  const centres = Object.keys(centreMaterialData);
  
  // Generate acronyms for centre names (first letter of first 3 words)
  const centreAcronyms = centres.map(name => name.split(' ').slice(0,3).map(word => word[0]).join('').toUpperCase());
  const materials = Array.from(
    new Set(
      centres.flatMap((centre) => Object.keys(centreMaterialData[centre]))
    )
  );

  // Data Constants for the recycled items by day of the week bar chart
  const dailyRecyclingData = stats?.recycled_by_day || {};
  const days = Object.keys(dailyRecyclingData); // Days of the week
  const dailyRecycled = Object.values(dailyRecyclingData); // The amount of recycled trash per day for each day

  // Recycled Items by Centre: Assign a color for each material
  const materialColors = {
    plastic: "#00796B",         // Teal (environment, plastic)
    paper: "#388E3C",          // Green (paper)
    metal: "#FBC02D",          // Yellow (metal)
    glass: "#0288D1",          // Blue (glass)
    cardboard: "#8D6E63",      // Brown (cardboard)
    "e-waste": "#455A64",     // Slate (e-waste)
    "a bulb / tube": "#FFA000", // Amber (bulb/tube)
    clothes: "#C62828"         // Red (clothes)
  };

  // Recycled Items by Centre: Datasets for stacked bar chart
  const datasets = materials.map((material) => ({
    label: material,
    data: centres.map((centre) => centreMaterialData[centre][material] || 0),
    backgroundColor: materialColors[material] || "rgba(100,100,100,0.6)",
  }));

  // Recycled Items by day of the week: Colour 
  // Each day will have different represented colours to better differentiate them
  const dayColours = {
    "Monday": "#388E3C",      // Green
    "Tuesday": "#0288D1",     // Blue
    "Wednesday": "#FBC02D",   // Yellow
    "Thursday": "#00796B",    // Teal
    "Friday": "#C62828",      // Red
    "Saturday": "#FFA000",    // Amber
    "Sunday": "#8D6E63",      // Brown
  };

  const recycledDailyDataset = [
    {
      label: "Recycled per Day",
      data: dailyRecycled, 
      backgroundColor: days.map((day) => dayColours[day])
    }
  ];

  // Data for pie chart
  const pieLabels = stats?.recycled_by_category ? Object.keys(stats.recycled_by_category) : [];
  const pieData = stats?.recycled_by_category ? Object.values(stats.recycled_by_category) : [];

  const getMaterialColor = (material) => 
    materialColors[material.toLowerCase()] || 'rgba(100, 100, 100, 0.6)';

  // Show loading message while data is being fetched
  if (loading) return <div>Loading...</div>;
  // Show message if no statistics are available
  if (!stats) return <div>No statistics available.</div>;

  // Display the statistics data
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>
      <SliderRangeSelector minDate={minDate} maxDate={maxDate} onChange={handleDateRangeChange} />   
      <div className="mb-6" />

      {/* Key for material colours */} 
      <div className="flex flex-wrap gap-4 mb-6">
        {materials.map((material) => (
          <div key={material} className="flex items-center gap-2">
            <span
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                backgroundColor: materialColors[material] || "rgba(100,100,100,0.6)",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            ></span>
            <span>{material}</span>
          </div>
        ))}
      </div>

      {/* Bar chart for recycled items by centre */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recycled Items by Centre</h2>
        <Bar
          data={{
            labels: centreAcronyms,
            datasets: datasets,
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => {
                    // Show full centre name in tooltip title
                    const idx = tooltipItems[0].dataIndex;
                    return centres[idx];
                  }
                }
              }
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
          }}
        />
      </div>

      {/* Pie chart for recycled items by category */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-left">Recycled Items by Category</h2>
        <div className="flex justify-center items-center">
          <div style={{ width: '100%', maxWidth: '600px', height: '600px', margin: '0 auto' }}>
            <Pie
              data={{
                labels: pieLabels,
                datasets:[
                  {
                    label: 'Items Recycled',
                    data: pieData, 
                    backgroundColor: pieLabels.map(getMaterialColor), 
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bar chart for recycled items by day of the week */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recycled Items by Day of Week</h2>
        <Bar
          data = {{
            labels: days, 
            datasets: recycledDailyDataset, 
          }}
          options={{
            responsive: true, 
            plugins: {
              legend: {display: false},
            }, 
            scales: {
              y: {beginAtZero: true},
            }
          }}
        />
        
      </div>

    </div>
  );
}
