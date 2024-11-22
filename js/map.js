var map = d3.select("#map"),
    width = +map.attr("width"),
    height = +map.attr("height");

// Append a <g> element to the SVG
var g = map.append("g");

// Set up the projection and path generator
var projection = d3.geoMercator()
    .scale(100000)
    .center([-71.2, 42.4501])
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
        .on("mouseover", function(event, d) {
            // Remove 'hovered' class from all regions
            g.selectAll(".neighborhood").classed("hovered", false);

            // Add 'hovered' class to the current region
            d3.select(this).classed("hovered", true);
        })
        .on("mouseout", function() {
            // Remove highlight (hovered class) from all regions when the mouse leaves a region
            g.selectAll(".boston").classed("hovered", false);
        })
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
    map.on("mouseout", function() {
        g.selectAll(".boston").classed("hovered", false); // Remove highlight from all regions
    });
});
