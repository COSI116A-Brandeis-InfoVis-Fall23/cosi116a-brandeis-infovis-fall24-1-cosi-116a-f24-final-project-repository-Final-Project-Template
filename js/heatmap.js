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
  fetch("lib/geo/geocoded1.geojson")
    .then((response) => response.json())
    .then((stationData) => {
      const heatPoints = stationData.features.map((station) => [
        station.geometry.coordinates[1],
        station.geometry.coordinates[0],
        station.properties.Traffic / 5000,
      ]);

      // Add heatmap layer
      L.heatLayer(heatPoints, {
        radius: 20,
        blur: 20,
        maxZoom: 15,
        opacity: 0.4,
      }).addTo(map);

      // Add station markers
      stationData.features.forEach((station) => {
        const { coordinates } = station.geometry;
        const { StationID, ControlArea, Traffic } = station.properties;

        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
          radius: 4,
          color: "orange",
          fillColor: "orange",
          fillOpacity: 0.8,
          className: "leaflet-station-node",
        }).addTo(map);

        marker.bindTooltip(
          `<strong>StationID:</strong> ${StationID}<br>
           <strong>Control Area:</strong> ${ControlArea}<br>
           <strong>Traffic:</strong> ${Traffic}`,
          { direction: "top" }
        );
      });
    });
});
