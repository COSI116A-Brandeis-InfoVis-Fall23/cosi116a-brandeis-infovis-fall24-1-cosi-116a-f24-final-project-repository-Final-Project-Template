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


