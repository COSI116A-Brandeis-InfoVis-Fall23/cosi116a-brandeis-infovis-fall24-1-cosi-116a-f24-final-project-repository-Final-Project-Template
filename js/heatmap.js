document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 10);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  let boroughLayer, subwayLinesLayer;

  // Heatmap configuration
  const heatmapConfig = {
    radius: 20,
    maxOpacity: 0.9,
    scaleRadius: false,
    useLocalExtrema: false,
    latField: "lat",
    lngField: "lng",
    valueField: "value",
    // gradient: {
    //   0.0: "blue",
    //   0.2: "cyan",
    //   0.4: "lime",
    //   0.6: "yellow",
    //   0.8: "orange",
    //   1.0: "red"
    // },
  };


  // Initialize the heatmap layer
  const heatmapLayer = new HeatmapOverlay(heatmapConfig).addTo(map);

  // Legend for the current date range
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML = `<strong>Current date range:</strong> Not set`;
    return div;
  };
  legend.addTo(map);

  let tooltipLayer = L.layerGroup().addTo(map);

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
      // .map((date) => date.toISOString().split("T")[0]); // Convert back to strings (e.g., "2020-02-03")

      const minDate = uniqueDates[0];
      const maxDate = uniqueDates[uniqueDates.length - 1];

      // Populate dropdowns
      // uniqueDates.forEach((date) => {
      //   const startOption = document.createElement("option");
      //   startOption.value = date;
      //   startOption.textContent = date;
      //   startDateSelect.appendChild(startOption);

      //   const endOption = document.createElement("option");
      //   endOption.value = date;
      //   endOption.textContent = date;
      //   endDateSelect.appendChild(endOption);
      // });

      // Set default values
      let selectedStartDate = minDate;
      let selectedEndDate = maxDate;


      // Default to nearest date if input is not exact
      const findNearestDate = (inputDate) => {

        if (!inputDate || isNaN(inputDate)) {
          console.error(`Invalid input date: ${inputDate}`);
          return null;
        }

        const date = new Date(inputDate);
        if (isNaN(date)) return null; // Invalid date

        // Find nearest date in the dataset
        const nearestDate = uniqueDates.reduce((prev, curr) => {
          return Math.abs(curr - date) < Math.abs(prev - date) ? curr : prev;
        }, uniqueDates[0]);

        return nearestDate;
      };


      // Updates the legend to show start and end date
      const updateLegend = () => {
        const formattedStart = selectedStartDate.toISOString().split("T")[0];
        const formattedEnd = selectedEndDate.toISOString().split("T")[0];
        const legendDiv = document.querySelector(".legend");
        legendDiv.innerHTML = `<strong>Current date range:</strong> ${formattedStart} to ${formattedEnd}`;
      };

      // Update heatmap when dates change
      const updateHeatmap = () => {
        const startDate = selectedStartDate || minDate;
        const endDate = selectedEndDate || maxDate;

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


        // Clear existing tooltip layer
        tooltipLayer.clearLayers();


        // Prepare heatmap data
        const heatmapData = {
          max: maxRidership,
          data: Array.from(locationMap.entries()).map(([coords, { value, feature }]) => {
            const [lat, lng] = coords.split(",").map(Number);

            // Create tooltips
            const marker = L.circleMarker([lat, lng], {
              radius: 2.5,
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
        updateLegend();
      };

      // Public function to update date range and refresh heatmap
      window.updateDateRange = (newStartDate, newEndDate) => {
        try {
          // Parse the MM/DD/YYYY date strings
          const parsedStartDate = newStartDate ? findNearestDate(newStartDate) : minDate;
          const parsedEndDate = newEndDate ? findNearestDate(newEndDate) : maxDate;

          // Validate parsed dates
          if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
            console.error("Invalid date format. Use MM/DD/YYYY.");
            return;
          }

          // Update the selected date range
          selectedStartDate = parsedStartDate;
          selectedEndDate = parsedEndDate;

          // Refresh the heatmap
          updateHeatmap();
        } catch (error) {
          console.error("Error updating date range:", error);
        }
      };

      // Initial heatmap update
      updateHeatmap();
    })
    .catch((error) => {
      console.error("Error loading or processing data:", error);
    });

});
