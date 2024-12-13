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
    scaleRadius: false,
    useLocalExtrema: false,
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
      const startDate = new Date("02/03/2020");
      const endDate = new Date("02/22/2021");

      // Filter data for the specified date
      const filteredData = data.features.filter((feature) => {
        const featureDate = new Date(feature.properties.Time);
        return featureDate >= startDate && featureDate <= endDate;
      });

      if (filteredData.length === 0) {
        console.error("No data available for the specified date.");
        return;
      }

      // Aggregate ridership for each location
      const locationMap = new Map();

      filteredData.forEach((feature) => {
        const coordsKey = `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`;
        const ridership = feature.properties.Ridership;

        if (locationMap.has(coordsKey)) {
          locationMap.set(coordsKey, locationMap.get(coordsKey) + ridership);
        } else {
          locationMap.set(coordsKey, ridership);
        }
      });

      // Calculate dynamic max scaling
      const maxRidership = Math.max(...Array.from(locationMap.values()));

      // Prepare heatmap data
      const heatmapData = {
        max: maxRidership, // Use the maximum value dynamically
        data: Array.from(locationMap.entries()).map(([coords, value]) => {
          const [lat, lng] = coords.split(",").map(Number);

          // Debugging
          console.log("Location Data:", { lat, lng, value });

          return {
            lat,
            lng,
            value, // Raw value; scaled dynamically by the heatmap plugin
          };
        }),
      };

      // Debug: Log the final heatmap data
      console.log("Heatmap Data for Date Range:", heatmapData);

      // Set data to the heatmap layer
      try {
        heatmapLayer.setData(heatmapData);
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
