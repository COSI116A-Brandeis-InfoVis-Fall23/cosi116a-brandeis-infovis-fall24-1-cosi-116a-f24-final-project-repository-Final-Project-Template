var svgStates = d3.select("svg #states"),
    svgBoundary = d3.select("svg #boundary"),
    states = {},
    // currentYear = 2021;   //this will change based on year selected
    currentYear = 1999;

var width = window.innerWidth, // (1)
  height = window.innerHeight;
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]);  // (2)

var path = d3.geoPath()
    .projection(projection);  // (3)

var max = -Infinity;
var min = Infinity;

d3.json("data/usa.json", function(error, boundary) {
 svgBoundary.selectAll("path")
     .data(boundary.features)
     .enter()
   .append("path")
     .attr("d", path)
});


d3.json("data/states.json", function(error, topologies) {  // (4)
  var state = topojson.feature(topologies[12], topologies[12].objects.stdin);  // (5)
  getMax();
  getMin();
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
      return "purple";
    })
    .append("svg:title")
    .text(function(d) { return d.properties.STATENAM + ", "+ rates[currentYear][d.properties.STATENAM]; });
    d3.selectAll("#max").text(max);
    d3.selectAll("#min").text(min);

});




d3.select("#slider").on("input", function(d) {          //add slider to confirm year
  currentYear = this.value;
  svgStates.selectAll("path") 
  .style('fill-opacity', function(d, i){                            //rerender state color and details
    var name = d.properties.STATENAM.replace(" Territory", "");
    return getColor(rates[currentYear][name], max);
  })
  .select('title')                                                  //update title with new data
  .text(function(d) { return d.properties.STATENAM + ", "+ rates[currentYear][d.properties.STATENAM]; });
  d3.selectAll("#titleYear").text(currentYear);
});



function getColor(rate, max) {
  var color = (rate/max)**2;  
  return color;  // return that number to the caller
}

function getMax(){   //get range of data for color purposes
  for(let i=1999; i<2021; i++){
    let currYear = rates[i];
    for(let j=0; j<50; j++){
      let name = statenames[j].name;
      let rate = currYear[name];
      if(rate>=max && rate!="undefined"){
        max=rate;
      }    
    }
  }
}
function getMin(){   
  for(let i=1999; i<2021; i++){
    let currYear = rates[i];
    for(let j=0; j<50; j++){
      let name = statenames[j].name;
      let rate = currYear[name];
      if(rate<=min && rate!="undefined"){
        min=rate;
      }    
    }
  }
}
