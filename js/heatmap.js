document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 13);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  let boroughLayer, subwayLinesLayer;
  // Heatmap configuration
  const heatmapConfig = {
    radius: 20,
    maxOpacity: 0.6,
    scaleRadius: true,
    useLocalExtrema: false,
    latField: "lat",
    lngField: "lng",
    valueField: "value",
  };

  // Initialize the heatmap layer
  const heatmapLayer = new HeatmapOverlay(heatmapConfig).addTo(map);

  // Load borough boundaries
  fetch("lib/geo/new-york-city-boroughs.geojson")
    .then((response) => response.json())
    .then((boroughData) => {
      boroughLayer = L.geoJSON(boroughData, {
        style: {
          color: "#333",
          weight: 1,
          fillColor: "#e0e0e0",
          fillOpacity: 0.4,
        },
      }).addTo(map);
    });

  // Load subway lines
  fetch("lib/geo/subway-lines.geojson")
    .then((response) => response.json())
    .then((lineData) => {
      subwayLinesLayer = L.geoJSON(lineData, {
        style: {
          color: "blue",
          weight: 1.5,
          opacity: 0.7,
        },
      }).addTo(map);
    });

  // Load weekly ridership data
  fetch("data/Subway_ridership_weekly.geojson")
    .then((response) => response.json())
    .then((data) => {
      // Hardcoded date for debugging
      const hardcodedDate = "02/03/2020";

      // Filter data for the hardcoded date
      const filteredData = data.features.filter(
        (feature) => feature.properties.Time === hardcodedDate
      );

      // Debug: Log filtered data
      console.log("Filtered Data:", filteredData);

      // Prepare heatmap data
      const heatmapData = {
        max: Math.max(...filteredData.map((f) => f.properties.Ridership)),
        data: filteredData.map((feature) => ({
          lat: feature.geometry.coordinates[1], // Latitude
          lng: feature.geometry.coordinates[0], // Longitude
          value: feature.properties.Ridership,
        })),
      };

      // Debug: Log heatmap data
      console.log("Heatmap Data:", heatmapData);

      // Set heatmap data
      heatmapLayer.setData(heatmapData);

      heatmapLayer.addTo(map);

      // Ensure heatmap is on top
      heatmapLayer._heatmap._renderer.canvas.style.zIndex = 999;
    })
    .catch((error) => {
      console.error("Error loading or processing data:", error);
    });
});
