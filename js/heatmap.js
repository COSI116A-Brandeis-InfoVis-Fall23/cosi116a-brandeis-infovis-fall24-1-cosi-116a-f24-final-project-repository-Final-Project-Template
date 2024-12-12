document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 13);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  let boroughLayer, subwayLinesLayer;

  // Heatmap configuration
  const heatmapConfig = {
    radius: 25, 
    maxOpacity: 0.6,
    scaleRadius: false,
    useLocalExtrema: true,
    latField: "lat",
    lngField: "lng",
    valueField: "value",
    gradient: {
      0.1: "blue",
      0.3: "green",
      0.5: "yellow",
      0.7: "orange",
      1.0: "red", // Gradual intensity for normalized values
    },
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
      const hardcodedDate = "02/03/2020";

      // Filter data for the specified date
      const filteredData = data.features.filter(
        (feature) => feature.properties.Time === hardcodedDate
      );

      if (filteredData.length === 0) {
        console.error("No data available for the specified date.");
        return;
      }

      // Normalize values to a maximum scale of 100000
      const MAX_SCALE = 1000000;

      const normalizedHeatmapData = {
        max: 1.0,
        data: filteredData.map((feature) => {
          const rawValue = feature.properties.Ridership;
          const scaledValue = Math.min(rawValue / MAX_SCALE, 1.0);

          // Debug: Log each station's scaled value
          /*console.log("Station Data:", {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            rawValue,
            scaledValue,
          });*/

          return {
            lat: feature.geometry.coordinates[1], // Latitude
            lng: feature.geometry.coordinates[0], // Longitude
            value: scaledValue, // Scaled value
          };
        }),
      };

      // Debug: Log the entire normalized heatmap data
      console.log("Normalized Heatmap Data:", normalizedHeatmapData);

      // Set data to the heatmap layer
      try {
        heatmapLayer.setData(normalizedHeatmapData); // No redraw needed
      } catch (error) {
        console.error("Error setting heatmap data:", error);
      }

      // Ensure the heatmap is on top
      if (heatmapLayer._heatmap) {
        heatmapLayer._heatmap._renderer.canvas.style.zIndex = 999;
      }
    })
    .catch((error) => {
      console.error("Error loading or processing data:", error);
    });
});
