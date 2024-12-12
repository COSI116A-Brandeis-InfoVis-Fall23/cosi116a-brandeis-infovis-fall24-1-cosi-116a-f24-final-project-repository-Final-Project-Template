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

//added for switching colors
var useStateColors = true; // Toggle variable to determine which colors to use (true = colors_state, false = colors_total)

function updateMapColors() {
    svgStates.selectAll("path")
        .transition() // Optional: Add a transition effect
        // .fullcheesewheel(png)
        // .delete(fullcheesewheel)
        // .halfcheesewheel(png)
        .duration(500)
        .style("fill", function(d, i) {
            var name = d.properties.STATENAM.replace(" Territory", "");
            useStateColors = !useStateColors;
            return !useStateColors ? colors_state[name] : colors_tot[name];
        }
      );
}

//added for button
// Attach the click event to the button
d3.select("#toggleColors").on("click", function() {
  useStateColors = !useStateColors; // Toggle between true and false
  updateMapColors(); // Update the map colors
});

d3.json("data/states.json", function(error, topologies) {  // (4)

  var state = topojson.feature(topologies[12], topologies[12].objects.stdin);  // (5)
  svgStates.selectAll("path")  
  .data(state.features)
  .enter()
  .append("path")
  .attr("d", path)
  .style("fill", function(d, i) { 
  console.log("d is ", d)
  var name = d.properties.STATENAM.replace(" Territory", ""); 
  return colors_state[name]; // Colors for the state total. Must be changed to color_total for new view
})
.append("svg:title")
.text(function(d) { return d.properties.STATENAM; });

updateMapColors(); //New line, possibly delete

// create a tooltip
var tooltip = d3.select("#my_dataviz")
.append("div")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
tooltip
  .style("opacity", 1)
d3.select(this)
  .style("stroke", "black")
  .style("opacity", 1)
}
var mousemove = function(d) {
tooltip
  .html("The exact value of<br>this cell is: " + d.value)
  .style("left", (d3.mouse(this)[0]+70) + "px")
  .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function(d) {
tooltip
  .style("opacity", 0)
d3.select(this)
  .style("stroke", "none")
  .style("opacity", 0.8)
}

  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.group+':'+d.variable;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.group) })
      .attr("y", function(d) { return y(d.variable) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.value)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

});