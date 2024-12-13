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

  // Render the states
  svgStates.selectAll("path")
    .data(state.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function(d) {
      var name = d.properties.STATENAM.replace(" Territory", "");
      return useStateColors ? colors_state[name] : colors_total[name];
    })
    // .append("svg:title")
    // .text(function(d) { return d.properties.STATENAM; });

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



// create a tooltip 
var tooltip = d3.select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip
    .html("State: " + d.properties.STATENAM)
    .style("left", (d3.event.pageX + 10) + "px")
    .style("top", (d3.event.pageY + 10) + "px")
    .style("opacity", 1);
  d3.select(this)
    .style("stroke", "black")
    .style("stroke-width", 2)
    .style("opacity", 1);
}
var mousemove = function(d) {
  tooltip
    .style("left", (d3.event.pageX + 10) + "px")
    .style("top", (d3.event.pageY + 10) + "px");
}
var mouseleave = function(d) {
  tooltip
    .style("opacity", 0);
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8);
}
d3.json("data/states.json", function(error, topologies) {
  var state = topojson.feature(topologies[12], topologies[12].objects.stdin);

  svgStates.selectAll("path")
    .data(state.features)
    .enter()
    .append("path")
    .attr("d", path)
    // .style("fill", function(d) {
    //   var name = d.properties.STATENAM.replace(" Territory", "");
    //   return colors_state[name];
    // })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
  // // add the squares
  // svg.selectAll()
  //   .data(data, function(d) {return d.group+':'+d.variable;})
  //   .enter()
  //   .append("rect")
  //     .attr("x", function(d) { return x(d.group) })
  //     .attr("y", function(d) { return y(d.variable) })
  //     .attr("rx", 4)
  //     .attr("ry", 4)
  //     .attr("width", x.bandwidth() )
  //     .attr("height", y.bandwidth() )
  //     .style("fill", function(d) { return myColor(d.value)} )
  //     .style("stroke-width", 4)
  //     .style("stroke", "none")
  //     .style("opacity", 0.8)
  //   .on("mouseover", mouseover)
  //   .on("mouseleave", mouseleave)

});
})
