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
  Papa.parse("data/Subway_ridership_true_final.csv", {
    download: true,
    header: true, // Automatically use the headers as keys
    skipEmptyLines: true, // Ignore empty rows
    complete: (results) => {
      const heatPoints = [];
      results.data.forEach((row) => {
        const lat = parseFloat(row.Latitude);
        const lng = parseFloat(row.Longitude);
        const traffic = parseFloat(row.Traffic);

        if (!lat || !lng || !traffic) return; // Skip invalid rows

        // Add heatmap point
        heatPoints.push([lat, lng, traffic / 5000]);

        // Add interactive station marker
        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          color: "orange",
          fillColor: "orange",
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindTooltip(
          `<strong>StationID:</strong> ${row.StationID}<br>
           <strong>Control Area:</strong> ${row.ControlArea}<br>
           <strong>Line Name:</strong> ${row.LineName}<br>
           <strong>Traffic:</strong> ${traffic}`,
          { direction: "top" }
        );

        marker.on("click", () => {
          alert(`StationID: ${row.StationID}\nControl Area: ${row.ControlArea}\nLine Name: ${row.LineName}\nTraffic: ${traffic}`);
        });
      });

      // Add heatmap layer
      L.heatLayer(heatPoints, {
        radius: 20,
        blur: 20,
        maxZoom: 15,
        opacity: 0.4,
      }).addTo(map);
    },
    error: (err) => {
      console.error("Error loading CSV:", err);
    },
  });
});
