function map() {
    let ourBrush = null,
    dispatcher;

    // Create the chart by appending an SVG to the selector and rendering the heatmap
    function chart(selector) {
        // Set up dimensions and projection
        var width = window.innerWidth;
        var height = window.innerHeight;

        var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]);
        var path = d3.geoPath().projection(projection);

        // Create the SVG container
        var svg = d3.select(selector).append("svg")
            .attr("width", width)
            .attr("height", height);

        var svgBoundary = svg.append("g").attr("id", "boundary");
        var svgStates = svg.append("g").attr("id", "states");

        var useStateColors = true; // Toggle variable for color modes

        // Load and render boundary
        d3.json("data/usa.json", function(error, boundary) {
            svgBoundary.selectAll("path")
                .data(boundary.features)
                .enter()
                .append("path")
                .attr("d", path)
        });

        // Load and render states
        d3.json("data/states.json", function(error, topologies) {
            var state = topojson.feature(topologies[12], topologies[12].objects.stdin);
            // console.log(state)

<<<<<<< HEAD
            var statepaths = svgStates.selectAll("path")
                .data(state.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function (d) {
                    var name = d.properties.STATENAM.replace(" Territory", "");
                    return colors_state[name];

                })
                .on("mouseover", (event, d) => handleMouseOver(event, d, path, state))
                .on("mouseout", handleMouseOut)
                .on("click", handleClick(statepaths))
=======
    d3.select("#popup")
    .style("display", "block")

    .html(`
      <strong>${name}</strong><br>
      <img src="images/${name}.png" alt="${name}" style="max-width: 150px; display: block; margin: 10px 0;">
      <p>Basic information about ${name}...</p>
      `);
})
.on("mouseout", function () {
  // Hide the popup when the mouse leaves
  d3.select("#popup").style("display", "none");
  
})
.on("click", function (event, d) {
  var name = state.features[d].properties.STATENAM.replace(" Territory", ""); // OMG SO IMPORTANT

  // Select the popup element
  var popup = d3.select("#popup");

  // Check if the popup is already enlarged
  var isLarge = popup.classed("large");

  // Toggle the size
  if (isLarge) {
    // Shrink the popup
    popup
      .classed("large", false)
      .style("transform", "scale(1)") // Reset size
      .style("z-index", 1000) // Reset z-index
      .html(`
        <strong>${name}</strong><br>
        <img src="images/${name}.png" alt="${name}" style="max-width: 100px; display: block; margin: 10px 0;">
        <p>Basic information about ${name}...</p>
      `);
  } else {
    // Enlarge the popup
    popup
      .classed("large", true)
      .style("transform", "scale(1.5)") // Enlarge size
      .style("z-index", 2000) // Bring to front
      .html(`
        <strong>${name}</strong><br>
        <img src="images/${name}.png" alt="${name}" style="max-width: 200px; display: block; margin: 10px 0;">
        <p>Additional detailed information about ${name}...</p>
      `);
  }

})

.append("svg:title")
.text(function (d) {
  return d.properties.STATENAM;
});
>>>>>>> cd138f44c247d9356513f63678bfb7634396240d

                statepaths.append("title")
                .text(d => d.properties.STATENAM);
                // console.log(statepaths)
        });

        function handleClick(statepaths){
            d3.select(statepaths.select("path"))
                .style("fill", "blue");
            }

        // Update map colors dynamically
        function updateMapColors() {
            svgStates.selectAll("path")
                .transition()
                .duration(500)
                .style("fill", d => {
                    var name = d.properties.STATENAM.replace(" Territory", "");
                    return useStateColors ? colors_state[name] : colors_total[name];
                });
        }

        // Button to toggle color states
        d3.select("#toggleColors").on("click", () => {
            useStateColors = !useStateColors;
            updateMapColors();
        });

        // Event handlers for mouse interactions
        function handleMouseOver(event, d, path, state) {
			var name = state.features[d].properties.STATENAM.replace(" Territory", ""); // OMG SO IMPORTANT
            var centroid = path.centroid(d);
            // console.log(name);

            d3.select("#popup")
                .style("display", "block")
                .style("left", `${centroid[0]}px`)
                .style("top", `${centroid[1] - 60}px`)
                .html(`
                    <strong>${name}</strong><br>
                    <img src="images/${name}.png" alt="${name}" style="max-width: 100px; display: block; margin: 10px 0;">
                    <em>Additional info here...</em>
                `);
          
        }

        function handleMouseOut() {
            d3.select("#popup").style("display", "none");
        }

        return chart;
    }

    // Gets or sets the dispatcher for selection events
    chart.selectionDispatcher = function (_) {
        if (!arguments.length) return dispatcher;
        dispatcher = _;
        return chart;
    };

    // Links selected data to the map (if integrating with other components)
    chart.updateSelection = function (selectedData) {
        if (!arguments.length) return;

        d3.selectAll(".state").classed("selected", d => selectedData.includes(d.properties.STATENAM));
    };

    return chart;
}
