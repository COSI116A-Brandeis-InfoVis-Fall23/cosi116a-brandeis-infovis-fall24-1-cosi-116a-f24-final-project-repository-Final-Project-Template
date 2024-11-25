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
        .on("click", function(d) {
            console.log(d); 
            var clickedRegion = d3.select(this); // Get the clicked region
            var neighborhood = d.properties && d.properties.name; // Extract neighborhood name from GeoJSON data
        
            // Display the neighborhood name in the #neighborhood-name element
            d3.select("#neighborhood-name").text("Neighborhood: " + neighborhood);
        
            // Check if the clicked region is already highlighted
            if (clickedRegion.classed("highlighted")) {
                clickedRegion.classed("highlighted", false); // Remove highlight if it exists
            } else {
                // Remove highlight from all other regions
                g.selectAll(".boston").classed("highlighted", false);
        
                // Add highlight to the clicked region
                clickedRegion.classed("highlighted", true);
            }
        });
   // Add brush functionality
   var brush = d3.brush()
   .extent([[0, 0], [width, height]]) // Match the SVG dimensions
   .on("brush", brushed)
   .on("end", brushEnd);

// brushing code done with assistance from ChatGPT

// Append the brush to the map
map.append("g")
   .attr("class", "brush")
   .call(brush);

// Brush event handlers
function brushed(event) {
  // Ensure the event object is passed correctly
  var selection = d3.event.selection;
  if (!selection) return;

  var [[x0, y0], [x1, y1]] = selection;

  g.selectAll(".neighborhood").classed("highlighted", function (d) {
      var centroid = path.centroid(d);
      var [cx, cy] = centroid;
      return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
  });
}

function brushEnd(event) {
  var selection = d3.event.selection;

  if (!selection) {
      g.selectAll(".neighborhood").classed("highlighted", false);
  }
}
});
