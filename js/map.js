var map = d3.select("#map")
    .attr("width", 800) // Set your desired width
    .attr("height", 800); // Set your desired height

var width = +map.attr("width"),
    height = +map.attr("height");

// Append <g> elements for neighborhoods and LineString
var gNeighborhoods = map.append("g").attr("class", "neighborhoods");

// Set up the projection and path generator
var projection = d3.geoMercator()
    .scale(130000)
    .center([-71.05, 42.33])
    .translate([width / 2, height / 2 - 100]);

var path = d3.geoPath().projection(projection);

// Load and render GeoJSON data for neighborhoods
d3.json("data/updated geojson/updated_bostonV2_with_data.json", function (error, data) {
    if (error) {
        console.error("Error loading GeoJSON:", error);
        return;
    }
    // List of neighborhoods to grey out
    var greyedOutNeighborhoods = ["Leather District", "Bay Village", "Longwood Medical Area", "Harbor Islands"
        , "Roslindale", "West Roxbury", "Hyde Park", "North End", "Mission Hill",
        "South Boston Waterfront", "Mattapan", "Allston", "Brighton", "South End"];
    gNeighborhoods.selectAll(".neighborhood")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "neighborhood")
        .attr("d", path)
        .style("stroke", "#000") // Optional: Add a border color
        .style("stroke-width", 0.5) // Optional: Set border thickness
        .style("fill", function (d) {
            // Grey out specified neighborhoods
            return greyedOutNeighborhoods.includes(d.properties.name) ? "#d3d3d3" : "#ffffff"; // Default color
        })
        .classed("unselectable", function (d) {
            // Add a class for unselectable neighborhoods
            return greyedOutNeighborhoods.includes(d.properties.name);
        });

    // Add brush functionality (unchanged)
    var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush", brushed)
        .on("end", brushEnd);

    map.append("g")
        .attr("class", "brush")
        .call(brush);

    // Brush functionality (updated)
    function brushed() {
        var selection = d3.event.selection;
        if (!selection) return;

        var [[x0, y0], [x1, y1]] = selection;

        var selectedNeighborhoods = [];

        gNeighborhoods.selectAll(".neighborhood").classed("highlighted", function (d) {
            // Skip greyed-out neighborhoods
            if (greyedOutNeighborhoods.includes(d.properties.name)) {
                return false;
            }

            var centroid = path.centroid(d);
            var [cx, cy] = centroid;

            var isSelected = cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;

            if (isSelected && d.properties && d.properties.name) {
                selectedNeighborhoods.push(d.properties.name);
            }

            // Apply style for selected neighborhoods
            d3.select(this).style("fill", isSelected ? "#ff6347" : "#ffffff"); // Highlight in yellow or reset to default

            return isSelected;
        });

        // Update text display with selected neighborhoods
        d3.select("#selected-neighborhoods").text(
            selectedNeighborhoods.length ? selectedNeighborhoods.join(", ") : "None"
        );
    }


    function brushEnd() {
        var selection = d3.event.selection;

        if (!selection) {
            // Reset all neighborhoods if no brush selection
            gNeighborhoods.selectAll(".neighborhood")
                .classed("highlighted", false)
                .style("fill", function (d) {
                    // Restore fill color based on whether the neighborhood is greyed out
                    return greyedOutNeighborhoods.includes(d.properties.name) ? "#d3d3d3" : "#ffffff";
                });

            d3.select("#selected-neighborhoods").text("None");

            // Dispatch event with no selected regions
            document.dispatchEvent(new CustomEvent("regionSelected", { detail: [] }));
            return;
        }

        var selectedNeighborhoods = [];

        gNeighborhoods.selectAll(".neighborhood").classed("highlighted", function (d) {
            if (greyedOutNeighborhoods.includes(d.properties.name)) {
                return false;
            }

            var centroid = path.centroid(d);
            var [cx, cy] = centroid;

            var isSelected = cx >= selection[0][0] && cx <= selection[1][0] && cy >= selection[0][1] && cy <= selection[1][1];

            if (isSelected && d.properties && d.properties.name) {
                selectedNeighborhoods.push(d.properties.name);
            }

            // Apply styles based on selection
            d3.select(this).style("fill", isSelected ? "#ff6347" : "#ffffff");

            return isSelected;
        });

        d3.select("#selected-neighborhoods").text(
            selectedNeighborhoods.length ? selectedNeighborhoods.join(", ") : "None"
        );

        // Dispatch custom event with selected regions
        document.dispatchEvent(new CustomEvent("regionSelected", { detail: selectedNeighborhoods }));
    }


    var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush", brushed)
        .on("end", brushEnd);

    map.append("g")
        .attr("class", "brush")
        .call(brush);
});


var gLineString = map.append("g").attr("class", "lines");
// https://github.com/singingwolfboy/MBTA-GeoJSON source of json data for stops and lines
// Load and render GeoJSON data for LineString
d3.json("data/routes clean.json", function (error, lineData) {
    if (error) {
        console.error("Error loading LineString GeoJSON:", error);
        return;
    }
    var customColors = {
        "red": "#ff0000", // Red
        "mattapan": "#ff0000", // Red
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
// Button to toggle lines visibility
d3.select("#toggle-lines-button").on("click", function () {
    var linesVisible = gLineString.style("display") !== "none";
    gLineString.style("display", linesVisible ? "none" : "block");
});

// Define the color scale for points based on the 'category' property (or another property)
var colorScale = d3.scaleOrdinal()
    .domain(["green", "red", "blue", 'orange', 'silver', 'mattapan', "green-e",
        "green-d",]) // The categories or properties you want to map
    .range(["#33ff57", "#ff0000", "#3357ff", '#ffa533', '#C0C0C0', '#ff0000', "#33ff57", "#33ff57"]); // Assign colors for each category

// Create a new group for points and set it to be hidden initially
var gPoints = map.append("g").attr("class", "points").style("display", "none");

d3.json("data/stops clean.json", function (error, pointData) {
    if (error) {
        console.error("Error loading point data:", error);
        return;
    }

    // Render points (circles) and color them based on the 'category' property
    gPoints.selectAll(".point")
        .data(pointData.features)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", function (d) {
            var coords = projection(d.geometry.coordinates);
            return coords[0]; // Longitude to x position
        })
        .attr("cy", function (d) {
            var coords = projection(d.geometry.coordinates);
            return coords[1]; // Latitude to y position
        })
        .attr("r", 5) // Set radius of the point
        .style("fill", function (d) {
            var lineType = d.properties.lines[0];
            return colorScale(lineType); // Color scale based on the 'category' property
        })
        .style("stroke", "#ffffff") // Optional: Add a stroke around the point
        .style("stroke-width", 1);
});

// Button to toggle points visibility
d3.select("#toggle-points-button").on("click", function () {
    var pointsVisible = gPoints.style("display") !== "none";
    gPoints.style("display", pointsVisible ? "none" : "block");
});