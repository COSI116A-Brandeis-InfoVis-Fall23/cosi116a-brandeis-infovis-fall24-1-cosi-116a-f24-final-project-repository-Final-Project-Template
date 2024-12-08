document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([40.7128, -74.0060], 13);

  // Add basemap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

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

  // Add heatmap and stations
  fetch("data/Subway_ridership_true_final.csv")
    .then((response) => response.text())
    .then((csvData) => {
      const rows = csvData.split("\n").slice(1); // Skip the header row

      const heatPoints = [];
      rows.forEach((row) => {
        const [stationID, controlArea, lineName, latitude, longitude, traffic] = row.split(",");
        if (!latitude || !longitude || !traffic) return; // Skip invalid rows

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const trafficValue = parseFloat(traffic);

        // Add heatmap point
        heatPoints.push([lat, lng, trafficValue / 5000]); // Normalize traffic

        // Add interactive station marker
        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          color: "orange",
          fillColor: "orange",
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindTooltip(
          `<strong>StationID:</strong> ${stationID}<br>
           <strong>Control Area:</strong> ${controlArea}<br>
           <strong>Line Name:</strong> ${lineName}<br>
           <strong>Traffic:</strong> ${trafficValue}`,
          { direction: "top" }
        );

        marker.on("click", () => {
          alert(`StationID: ${stationID}\nControl Area: ${controlArea}\nLine Name: ${lineName}\nTraffic: ${trafficValue}`);
        });
      });

      // Add heatmap layer
      L.heatLayer(heatPoints, {
        radius: 20,
        blur: 20,
        maxZoom: 15,
        opacity: 0.4,
      }).addTo(map);
    });
});
