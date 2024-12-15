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
  const startDateSelect = document.getElementById("start-date");
  const endDateSelect = document.getElementById("end-date");

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
      // Extract unique dates
      const uniqueDates = [...new Set(data.features.map((f) => f.properties.Time))]
        .map((date) => new Date(date)) // Convert to Date objects for sorting
        .sort((a, b) => a - b) // Sort in ascending order
        .map((date) => date.toISOString().split("T")[0]); // Convert back to strings (e.g., "2020-02-03")

      // Populate dropdowns
      uniqueDates.forEach((date) => {
        const startOption = document.createElement("option");
        startOption.value = date;
        startOption.textContent = date;
        startDateSelect.appendChild(startOption);

        const endOption = document.createElement("option");
        endOption.value = date;
        endOption.textContent = date;
        endDateSelect.appendChild(endOption);
      });

      // Set default values
      startDateSelect.value = uniqueDates[0];
      endDateSelect.value = uniqueDates[uniqueDates.length - 1];

      // Update heatmap when dates change
      const updateHeatmap = () => {
        const startDate = new Date(startDateSelect.value);
        const endDate = new Date(endDateSelect.value);

        // Filter data for the selected date range
        const filteredData = data.features.filter((feature) => {
          const featureDate = new Date(feature.properties.Time);
          return featureDate >= startDate && featureDate <= endDate;
        });

        if (filteredData.length === 0) {
          console.error("No data available for the selected date range.");
          heatmapLayer.setData({ max: 0, data: [] });
          return;
        }

        // Aggregate ridership and associate with features
        const locationMap = new Map();

        filteredData.forEach((feature) => {
          const coordsKey = `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`;
          const ridership = feature.properties.Ridership;

          if (locationMap.has(coordsKey)) {
            const existing = locationMap.get(coordsKey);
            existing.value += ridership;
          } else {
            locationMap.set(coordsKey, {
              value: ridership,
              feature, // Store the feature object for tooltips
            });
          }
        });

        // Calculate dynamic max scaling
        const maxRidership = Math.max(...Array.from(locationMap.values()).map((entry) => entry.value));

        // Prepare heatmap data
        const tooltipLayer = L.layerGroup().addTo(map);
        const heatmapData = {
          max: maxRidership,
          data: Array.from(locationMap.entries()).map(([coords, { value, feature }]) => {
            const [lat, lng] = coords.split(",").map(Number);

            // Create tooltips
            const marker = L.circleMarker([lat, lng], {
              radius: 3,
              color: "black",
              weight: 1,
              fillColor: "white",
              fillOpacity: 0.7,
            })
              .bindTooltip(
                `<strong>Station:</strong> ${feature.properties.Station || "Unknown"}<br>` +
                `<strong>Total Ridership:</strong> ${value}`,
                { permanent: false, direction: "top" }
              )
              .addTo(tooltipLayer);

            return { lat, lng, value };
          }),
        };

        // Update the heatmap
        heatmapLayer.setData(heatmapData);
      };


      // Add event listeners
      startDateSelect.addEventListener("change", updateHeatmap);
      endDateSelect.addEventListener("change", updateHeatmap);

      // Initial heatmap update
      updateHeatmap();
    })
    .catch((error) => {
      console.error("Error loading or processing data:", error);
    });

});
