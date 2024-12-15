var svgStates = d3.select("svg #states"),
    svgBoundary = d3.select("svg #boundary"),
    states = {},
    startYear = 1910,
    currentYear = startYear;

var width = window.innerWidth, // (1)
  height = window.innerHeight;
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]);  // (2)
var path = d3.geoPath()
    .projection(projection);  // (3)

    d3.json("data/usa.json", function(error, boundary) {
        svgBoundary.selectAll("path")
            .data(boundary.features)
            .enter()
          .append("path")
            .attr("d", path)
            
       })

var useStateColors = true; // Toggle variable to determine which colors to use (true = colors_state, false = colors_total)


d3.json("data/states.json", function(error, topologies) {  // (4)
  if (error) throw error;

  var state = topojson.feature(topologies[12], topologies[12].objects.stdin);  // (5)
  // OMG SO IMPORTANT IF YOU WANT TO GET ANY INFORMATION FROM THE DATA
  //var name = state.features[d].properties.STATENAM.replace(" Territory", ""); 

  // Render the states
  svgStates.selectAll("path")
  .data(state.features)
  .enter()
  .append("path")
  .attr("d", path)
  .style("fill", function (d) {
    var name = d.properties.STATENAM.replace(" Territory", "");
    return colors_state[name];
  })
  .on("mouseover", function (event, d) {
    var name = state.features[d].properties.STATENAM.replace(" Territory", ""); // OMG SO IMPORTANT

    // Calculate the centroid of the state
    var centroid = path.centroid(d);

    d3.select("#popup")
    .style("display", "block")
    .style("left", centroid[0] + "px") // Horizontal position
    .style("top", centroid[1] - 60 + "px") // Vertical position, adjust for better alignment
    .html(`
      <strong>${name}</strong><br>
      <img src="images/${name}.png" alt="${name}" style="max-width: 100px; display: block; margin: 10px 0;">
      `);
})
.on("mouseout", function () {
  // Hide the popup when the mouse leaves
  d3.select("#popup").style("display", "none");
})
.append("svg:title")
.text(function (d) {
  return d.properties.STATENAM;
});

})

  // Update map colors
  function updateMapColors() {
    svgStates.selectAll("path")
      .transition() // Add a smooth transition
      .duration(500) // Transition duration in milliseconds
      .style("fill", function(d) {
        var name = d.properties.STATENAM.replace(" Territory", "");
        return useStateColors ? colors_state[name] : colors_total[name];
      });
  }
  // Button click event listener
  d3.select("#toggleColors").on("click", function() {
    useStateColors = !useStateColors; // Toggle the color state
    updateMapColors(); // Refresh the map colors
  
});


