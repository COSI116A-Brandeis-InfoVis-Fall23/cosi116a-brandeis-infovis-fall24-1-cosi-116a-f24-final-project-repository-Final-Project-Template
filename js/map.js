// everything done with assitance from ChatGPT

var map = d3.select("#map")
    .attr("width", 800) // Set your desired width
    .attr("height", 800); // Set your desired height

    width = +map.attr("width"),
    height = +map.attr("height");

// Append a <g> element to the SVG
var g = map.append("g");

// Set up the projection and path generator
var projection = d3.geoMercator()
    .scale(100000)
    .center([-70.975, 42.29])
    .translate([width / 2, height / 2 - 100]);

var path = d3.geoPath().projection(projection);

// Load and render GeoJSON data
d3.json("data/bostonV2.json", function(error, data) {
    if (error) {
        console.error("Error loading GeoJSON:", error);
        return;
    }
    // Draw map regions inside the <g> element
    g.selectAll(".boston")
        .data(data.features)
        .enter().append("path")
        .attr("class", "neighborhood")
        .attr("d", path)
        ;
// Brush event handlers
function brushed() {
  // Use d3.event to access the event object in D3 v4
  var selection = d3.event.selection;
  if (!selection) return;

  var [[x0, y0], [x1, y1]] = selection;

  // Array to store the names of selected neighborhoods
  var selectedNeighborhoods = [];

  g.selectAll(".neighborhood").classed("highlighted", function (d) {
      var centroid = path.centroid(d);
      var [cx, cy] = centroid;

      // Check if the centroid is within the selection box
      var isSelected = cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;

      if (isSelected && d.properties && d.properties.name) {
          selectedNeighborhoods.push(d.properties.name);
      }

      return isSelected;
  });

  // Display the selected neighborhood names
  d3.select("#selected-neighborhoods").text(
       (selectedNeighborhoods.length ? selectedNeighborhoods.join(", ") : "None")
  );
}

function brushEnd() {
  var selection = d3.event.selection;

  // Clear highlights and selection display if brush is removed
  if (!selection) {
      g.selectAll(".neighborhood").classed("highlighted", false);
      d3.select("#selected-neighborhoods").text("None");
  }
}

// Add brush functionality
var brush = d3.brush()
  .extent([[0, 0], [width, height]]) // Match the SVG dimensions
  .on("brush", brushed)
  .on("end", brushEnd);

map.append("g")
  .attr("class", "brush")
  .call(brush);
});
