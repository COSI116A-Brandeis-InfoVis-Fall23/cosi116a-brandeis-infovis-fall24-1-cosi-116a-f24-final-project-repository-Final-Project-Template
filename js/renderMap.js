var svgStates = d3.select("svg #states"),
    svgBoundary = d3.select("svg #boundary"),
    states = {},
    // currentYear = 2021;   //this will change based on year selected
    currentYear = document.getElementById('years').value;

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


d3.json("data/states.json", function(error, topologies) {  // (4)
  var state = topojson.feature(topologies[12], topologies[12].objects.stdin);  // (5)
  svgStates.selectAll("path")  
      .data(state.features)
      .enter()
    .append("path")
    .attr("d", path)
    .style('fill-opacity', function(d, i){
      var name = d.properties.STATENAM.replace(" Territory", "");
      return getColor(rates[currentYear][name], getMax());
    })
    .style("fill", function(d, i) { 
      return "red";
    })
    .append("svg:title")
    .text(function(d) { return d.properties.STATENAM + ", "+ rates[currentYear][d.properties.STATENAM]; });
    d3.selectAll("#max").text(getMax());
    d3.selectAll("#min").text(getMin());

});


d3.selectAll("svg").on("mouseover", (d, i, elements) =>{          //highlight states on mouseover - add brushing later
  d3.selectAll("g path").on("mouseover", (d, i, elements) =>{
    d3.select(elements[i]).classed("mouseover", true);
  });
  d3.selectAll("g path").on("mouseout", (d, i, elements) =>{
    d3.select(elements[i]).classed("mouseover", false);
  });
  d3.selectAll("g path").on("mousedown", (d, i, elements) =>{     //linking
    var selected = d.properties.STATENAM;
    d3.selectAll("#state").text(selected);
  });
});
//eventually need to add a on mousedown thing here for linking

d3.selectAll("button").on("mousedown", (d, i, elements) =>{          //add button to confirm year
  currentYear = document.getElementById('years').value;
  svgStates.selectAll("path") 
  .style('fill-opacity', function(d, i){                            //rerender state color and details
    var name = d.properties.STATENAM.replace(" Territory", "");
    return getColor(rates[currentYear][name], getMax());
  })
  .select('title')                                                  //update title with new data
  .text(function(d) { return d.properties.STATENAM + ", "+ rates[currentYear][d.properties.STATENAM]; });
  d3.selectAll("#titleYear").text(currentYear);
  d3.selectAll("#max").text(getMax());
  d3.selectAll("#min").text(getMin());
});



function getColor(rate, max) {
  var color = (rate/max)**2;  
  return color;  // return that number to the caller
}

function getMax(){   //get range of data for color purposes
  let max = -Infinity;
  for (let i=0; i<50; i++){
  let name = statenames[i].name;
  let rate = rates[currentYear][name];
  if(rate>=max && rate!="undefined"){
    max=rate;
  }
}
return max;
}
function getMin(){   
  let min = Infinity;
  for (let i=0; i<50; i++){
  let name = statenames[i].name;
  let rate = rates[currentYear][name];
  if(rate<=min && rate!="undefined"){
    min=rate;
  }
}
return min;
}