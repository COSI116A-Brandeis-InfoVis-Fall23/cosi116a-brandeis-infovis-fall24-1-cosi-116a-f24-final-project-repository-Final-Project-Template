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

var tooltip = d3.select(".tooltip");

// Load and render GeoJSON data
d3.json("data/boston.geojson", function(error, data) {
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
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
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
        .on("click", function(event, d) {
            var clickedRegion = d3.select(this);

            var neighborhood = d.properties && d.properties.name ? d.properties.name : "Unknown Neighborhood";
             // Display region name in the #region-name div
             d3.select("#neighborhood-name").text("Neighborhood: " + neighborhood);

            // Toggle highlighted class on click
            if (clickedRegion.classed("highlighted")) {
                clickedRegion.classed("highlighted", false);  // Remove highlight
            } else {
                // Optionally, remove highlight from previously clicked regions
                g.selectAll(".boston").classed("highlighted", false);
                clickedRegion.classed("highlighted", true);  // Add highlight
            }
        });
    map.on("mouseout", function() {
        g.selectAll(".boston").classed("hovered", false); // Remove highlight from all regions
    });
});
