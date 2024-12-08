document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 13);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);


  let heatLayer;
  let parsedData = [];


  // Initialize the time slider
  const timeSlider = document.getElementById("time-slider");
  const selectedDate = document.getElementById("selected-date");
  const startDate = new Date(2019, 11, 28); // 12/28/2019

  // Function to update heatmap
  const updateHeatmap = (weekIndex) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + weekIndex * 7);

    // Display the current date
    selectedDate.textContent = currentDate.toISOString().split("T")[0];

    // Filter data for the current week
    const heatPoints = parsedData
      .filter((row) => row.WeekIndex === weekIndex)
      .map((row) => [row.Latitude, row.Longitude, row.Traffic / 5000]);

    // Remove the previous heatmap layer
    if (heatLayer) map.removeLayer(heatLayer);

    // Add a new heatmap layer
    heatLayer = L.heatLayer(heatPoints, {
      radius: 20,
      blur: 20,
      maxZoom: 15,
      opacity: 0.4,
    }).addTo(map);
  };


  // Add borough boundaries
  fetch("lib/geo/new-york-city-boroughs.geojson")
    .then((response) => response.json())
    .then((boroughData) => {
      L.geoJSON(boroughData, {
        style: {
          color: "#333",
          weight: 1,
          fillColor: "#e0e0e0",
          fillOpacity: 0.4,
          className: "leaflet-borough",
        },
      }).addTo(map);
    });

  // Add subway lines
  fetch("lib/geo/subway-lines.geojson")
    .then((response) => response.json())
    .then((lineData) => {
      L.geoJSON(lineData, {
        style: {
          color: "blue",
          weight: 1.5,
          opacity: 0.7,
          className: "leaflet-line",
        },
      }).addTo(map);
    });

  // Load CSV data
  Papa.parse("lib/geo/Subway_ridership_true_final.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      parsedData = results.data.map((row) => ({
        StationID: row.StationID,
        ControlArea: row.ControlArea,
        LineName: row.LineName,
        Latitude: parseFloat(row.Latitude),
        Longitude: parseFloat(row.Longitude),
        Traffic: parseFloat(row.Traffic),
        WeekIndex: Math.floor((new Date(row.Date) - startDate) / (7 * 24 * 60 * 60 * 1000)), // Calculate week index
      }));

      // Initialize heatmap with the first week
      updateHeatmap(0);

      // Add event listener to the slider
      timeSlider.addEventListener("input", (e) => {
        updateHeatmap(parseInt(e.target.value, 10));
      });
    },
    error: (err) => {
      console.error("Error loading CSV:", err);
    },
  });
});
