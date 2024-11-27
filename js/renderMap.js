var svgStates = d3.select("svg #states"),
    svgBoundary = d3.select("svg #boundary"),
    states = {},
    currentYear = 2021;   //this will change based on year selected

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
});

var min = Infinity, max = -Infinity;

d3.json("data/states.json", function(error, topologies) {  // (4)
  var state = topojson.feature(topologies[12], topologies[12].objects.stdin);  // (5)
  setMinMax();      //set the minimum and maximum values
  svgStates.selectAll("path")  
      .data(state.features)
      .enter()
    .append("path")
    .attr("d", path)
    .style('fill-opacity', function(d, i){
      var name = d.properties.STATENAM.replace(" Territory", "");
      return getColor(rates[currentYear][name], max);
    })
    .style("fill", function(d, i) { 
      return "red";
    })
    .append("svg:title")
    .text(function(d) { return d.properties.STATENAM + ", "+ rates[currentYear][d.properties.STATENAM]; });
});


d3.selectAll("svg").on("mouseover", (d, i, elements) =>{          //highlight states on mouseover - add brushing later
  d3.selectAll("g path").on("mouseover", (d, i, elements) =>{
    d3.select(elements[i]).classed("mouseover", true);
  });
  d3.selectAll("g path").on("mouseout", (d, i, elements) =>{
    d3.select(elements[i]).classed("mouseover", false);
  });
});




function getColor(rate, max) {
  var color = (rate/max)**2;  
  return color;  // return that number to the caller
}

function setMinMax(){   //get range of data for color purposes
  for (let i=0; i<50; i++){
  let name = statenames[i].name;
  let rate = rates[currentYear][name];
  if (rate<=min && rate!="undefined"){
    min=rate;
  }
  if(rate>=max && rate!="undefined"){
    max=rate;
  }
}
return min, max;
}