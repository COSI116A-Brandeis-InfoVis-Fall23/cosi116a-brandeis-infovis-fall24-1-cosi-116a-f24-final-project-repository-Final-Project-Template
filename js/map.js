var map = d3.select("#map")
    .attr("width", 800) // Set your desired width
    .attr("height", 800); // Set your desired height

var width = +map.attr("width"),
    height = +map.attr("height");

// Append <g> elements for neighborhoods and LineString
var gNeighborhoods = map.append("g").attr("class", "neighborhoods");
var gLineString = map.append("g").attr("class", "linestrings");

// Set up the projection and path generator
var projection = d3.geoMercator()
    .scale(100000)
    .center([-70.975, 42.29])
    .translate([width / 2, height / 2 - 100]);

var path = d3.geoPath().projection(projection);

// Load and render GeoJSON data for neighborhoods
d3.json("data/bostonV2.json", function (error, data) {
    if (error) {
        console.error("Error loading GeoJSON:", error);
        return;
    }

    // Define a color for neighborhoods (static color or dynamic based on properties)
    var neighborhoodColor = "#a3d1ff"; // Light blue for all neighborhoods

    gNeighborhoods.selectAll(".neighborhood")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "neighborhood")
        .attr("d", path)
        .style("fill", neighborhoodColor) // Apply the color here
        .style("stroke", "#000") // Optional: Add a border color
        .style("stroke-width", 0.5); // Optional: Set border thickness

    // Add brush functionality (unchanged)
    var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush", brushed)
        .on("end", brushEnd);

    map.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed() {
        var selection = d3.event.selection;
        if (!selection) return;

        var [[x0, y0], [x1, y1]] = selection;

        var selectedNeighborhoods = [];

        gNeighborhoods.selectAll(".neighborhood").classed("highlighted", function (d) {
            var centroid = path.centroid(d);
            var [cx, cy] = centroid;

            var isSelected = cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;

            if (isSelected && d.properties && d.properties.name) {
                selectedNeighborhoods.push(d.properties.name);
            }

            return isSelected;
        });

        d3.select("#selected-neighborhoods").text(
            selectedNeighborhoods.length ? selectedNeighborhoods.join(", ") : "None"
        );
    }

    function brushEnd() {
        var selection = d3.event.selection;

        if (!selection) {
            gNeighborhoods.selectAll(".neighborhood").classed("highlighted", false);
            d3.select("#selected-neighborhoods").text("None");
        }
    }
});
// https://github.com/singingwolfboy/MBTA-GeoJSON source of json data
// Load and render GeoJSON data for LineString
d3.json("data/routes.json", function (error, lineData) {
    if (error) {
        console.error("Error loading LineString GeoJSON:", error);
        return;
    }

    var customColors = {
      "red": "#ff0000", // Red
      "green-d": "#33ff57", // Green
      "green-c": "#33ff57", // green
      "green-b": "#33ff57", // green
      "green-e": "#33ff57", // green
      "blue": "#3357ff", // Blue
      "orange": "#ffa533",  // Orange
      "sl1": "#C0C0C0", // Silver
      "sl2": "#C0C0C0", // Silver
      "sl3": "#C0C0C0", // Silver
      "sl4": "#C0C0C0", // Silver
      "sl5": "#C0C0C0" // Silver
  };
    // Filter features to include only those with IDs in customColors
    var filteredFeatures = lineData.features.filter(d => customColors[d.properties.id]);

    // Draw LineStrings
    gLineString.selectAll(".linestring")
        .data(filteredFeatures) // Use the filtered features
        .enter()
        .append("path")
        .attr("class", "linestring")
        .attr("d", path)
        .style("fill", "none") // Ensure LineString is not filled
        .style("stroke", d => customColors[d.properties.id]) // Assign color from customColors
        .style("stroke-width", 2); // Set stroke width
});
