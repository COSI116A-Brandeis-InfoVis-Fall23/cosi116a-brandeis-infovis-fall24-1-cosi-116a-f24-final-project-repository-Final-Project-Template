const map = L.map("map").setView([40.7128, -74.0060], 13);

//basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Load Borough Boundaries GeoJSON
fetch("js/geo/new-york-city-boroughs.geojson")
  .then((response) => response.json())
  .then((boroughData) => {
    L.geoJSON(boroughData, {
      style: {
        color: "#333",
        weight: 1,
        fillColor: "#e0e0e0",
        fillOpacity: 0.4,
      },
      interactive: false,
    }).addTo(map);
  });

// Load Subway Lines GeoJSON
fetch("js/geo/subway-lines.geojson")
  .then((response) => response.json())
  .then((lineData) => {
    L.geoJSON(lineData, {
      style: {
        color: "blue",
        weight: 2,
        opacity: 0.8,
      },
      interactive: false,
    }).addTo(map);
  });

// Load Subway Stations GeoJSON and Create Heatmap + Hoverable Nodes
fetch("js/geo/geocoded1.geojson")
  .then((response) => response.json())
  .then((stationData) => {
    const heatPoints = stationData.features.map((station) => [
      station.geometry.coordinates[1], // Latitude
      station.geometry.coordinates[0], // Longitude
      station.properties.Traffic / 5000, // Normalize traffic for intensity
    ]);

    L.heatLayer(heatPoints, {
      radius: 25,
      blur: 25,
      maxZoom: 17,
      opacity: 0.5, // Lower opacity for heatmap
    }).addTo(map);

    // Add hoverable nodes for each station
    stationData.features.forEach((station) => {
      const lat = station.geometry.coordinates[1];
      const lng = station.geometry.coordinates[0];
      const stationID = station.properties.StationID || "Unknown";
      const controlArea = station.properties.ControlArea || "Unknown";
      const traffic = station.properties.Traffic || 0;

      // Add a circle marker
      const marker = L.circleMarker([lat, lng], {
        radius: 2,
        color: "orange",
        fillColor: "orange",
        fillOpacity: 0.9,
      }).addTo(map);

      // Add a tooltip on hover
      marker.bindTooltip(
        `<strong>StationID:</strong> ${stationID}<br>
         <strong>Control Area:</strong> ${controlArea}<br>
         <strong>Traffic:</strong> ${traffic}`,
        {
          permanent: false,
          direction: "top",
          className: "tooltip",
        }
      );

      marker.on("click", () => {
        alert(`StationID: ${stationID}\nControl Area: ${controlArea}\nTraffic: ${traffic}`);
      });
    });
  });