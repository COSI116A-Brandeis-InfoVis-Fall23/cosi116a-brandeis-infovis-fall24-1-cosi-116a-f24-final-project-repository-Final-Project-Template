document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 13);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  let heatLayer; // Reference to the heatmap layer
  let parsedData = []; // Parsed data from CSV

  // Time sliders and display elements
  const timeSliderStart = document.getElementById("time-slider-start");
  const timeSliderEnd = document.getElementById("time-slider-end");
  const selectedStartDate = document.getElementById("selected-start-date");
  const selectedEndDate = document.getElementById("selected-end-date");
  const weekDates = []; // Array to store the unique week dates

  // Function to update the heatmap
  const updateHeatmap = (startIndex, endIndex) => {
    const startWeek = weekDates[startIndex];
    const endWeek = weekDates[endIndex];
    selectedStartDate.textContent = startWeek;
    selectedEndDate.textContent = endWeek;

    // Filter and aggregate data for the selected period
    const heatPoints = [];
    const aggregatedTraffic = {};

    parsedData.forEach((row) => {
      if (row.Week >= startWeek && row.Week <= endWeek) {
        const key = `${row.Latitude},${row.Longitude}`;
        if (!aggregatedTraffic[key]) {
          aggregatedTraffic[key] = 0;
        }
        aggregatedTraffic[key] += row.Traffic;
      }
    });

    // Convert aggregated data into heatmap points
    for (const key in aggregatedTraffic) {
      const [lat, lng] = key.split(",").map(parseFloat);
      heatPoints.push([lat, lng, aggregatedTraffic[key] / 5000]);
    }

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

  // Load borough boundaries
  fetch("lib/geo/new-york-city-boroughs.geojson")
    .then((response) => response.json())
    .then((boroughData) => {
      L.geoJSON(boroughData, {
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
      L.geoJSON(lineData, {
        style: {
          color: "blue",
          weight: 1.5,
          opacity: 0.7,
        },
      }).addTo(map);
    });

  // Load and parse the CSV data
  Papa.parse("data/Subway_ridership_true_final.csv", {
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
        Week: row.Week,
      }));

      // Extract unique week dates
      weekDates.push(...new Set(parsedData.map((row) => row.Week)));
      weekDates.sort(); // Sort dates chronologically

      // Initialize slider attributes
      const maxIndex = weekDates.length - 1;
      timeSliderStart.max = maxIndex;
      timeSliderEnd.max = maxIndex;
      timeSliderStart.value = 0;
      timeSliderEnd.value = maxIndex;
      selectedStartDate.textContent = weekDates[0];
      selectedEndDate.textContent = weekDates[maxIndex];

      // Initialize heatmap with the full range
      updateHeatmap(0, maxIndex);

      // Add event listeners to the sliders
      timeSliderStart.addEventListener("input", () => {
        const startIndex = parseInt(timeSliderStart.value, 10);
        const endIndex = Math.max(startIndex, parseInt(timeSliderEnd.value, 10));
        timeSliderEnd.value = endIndex; // Prevent overlap
        updateHeatmap(startIndex, endIndex);
      });

      timeSliderEnd.addEventListener("input", () => {
        const endIndex = parseInt(timeSliderEnd.value, 10);
        const startIndex = Math.min(parseInt(timeSliderStart.value, 10), endIndex);
        timeSliderStart.value = startIndex; // Prevent overlap
        updateHeatmap(startIndex, endIndex);
      });

      // Add station markers
      parsedData.forEach((row) => {
        const marker = L.circleMarker([row.Latitude, row.Longitude], {
          radius: 6,
          color: "orange",
          fillColor: "orange",
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindTooltip(
          `<strong>StationID:</strong> ${row.StationID}<br>
           <strong>Control Area:</strong> ${row.ControlArea}<br>
           <strong>Line Name:</strong> ${row.LineName}<br>
           <strong>Traffic:</strong> ${row.Traffic}`,
          { direction: "top" }
        );

        marker.on("click", () => {
          alert(`StationID: ${row.StationID}\nControl Area: ${row.ControlArea}\nLine Name: ${row.LineName}\nTraffic: ${row.Traffic}`);
        });
      });
    },
    error: (err) => {
      console.error("Error loading CSV:", err);
    },
  });
});
