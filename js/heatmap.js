document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 13);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  let heatLayer;
  let parsedData = [];
  const weekDates = [];
  const timeSlider = document.getElementById("time-slider");

  // Initialize noUiSlider
  noUiSlider.create(timeSlider, {
    start: [0, 251],
    connect: true,
    range: {
      min: 0,
      max: 251,
    },
    step: 1,
    tooltips: [true, true],
    format: {
      to: (value) => Math.round(value),
      from: (value) => parseInt(value, 10),
    },
  });

  const updateHeatmap = (startIndex, endIndex) => {
    const startWeek = weekDates[startIndex];
    const endWeek = weekDates[endIndex];
    document.getElementById("selected-start-date").textContent = startWeek;
    document.getElementById("selected-end-date").textContent = endWeek;

    const heatPoints = [];
    const aggregatedTraffic = {};

    parsedData.forEach((row) => {
      if (row.Week >= startWeek && row.Week <= endWeek) {
        const key = `${row.Latitude},${row.Longitude}`;
        if (!aggregatedTraffic[key]) aggregatedTraffic[key] = 0;
        aggregatedTraffic[key] += row.Traffic;
      }
    });

    for (const key in aggregatedTraffic) {
      const [lat, lng] = key.split(",").map(parseFloat);
      heatPoints.push([lat, lng, aggregatedTraffic[key] / 5000]);
    }

    if (heatLayer) map.removeLayer(heatLayer);
    heatLayer = L.heatLayer(heatPoints, { radius: 20, blur: 20, maxZoom: 15, opacity: 0.4 }).addTo(map);
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

      weekDates.push(...new Set(parsedData.map((row) => row.Week)));
      weekDates.sort();

      timeSlider.noUiSlider.updateOptions({
        range: { min: 0, max: weekDates.length - 1 },
        start: [0, weekDates.length - 1],
        tooltips: [
          {
            to: (value) => weekDates[Math.round(value)],
            from: () => "",
          },
          {
            to: (value) => weekDates[Math.round(value)],
            from: () => "",
          },
        ],
      });

      updateHeatmap(0, weekDates.length - 1);

      timeSlider.noUiSlider.on("update", (values) => {
        const startIndex = parseInt(values[0], 10);
        const endIndex = parseInt(values[1], 10);
        updateHeatmap(startIndex, endIndex);
      });
    },
    error: (err) => console.error("Error loading CSV:", err),
  });
});
