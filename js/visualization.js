// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  d3.json("data/heartratesALL.json", (rates) => {

  // Extract the years 
  let years = Object.keys(rates); // ['1999', '2000', ...]
  let data = years.map(year => {
    return { 
        year: year, 
        value: rates[year]["Alabama"] // Heart disease death rate for Alabama
    };
  });

d3.json("data/lifeExpectancy.json", (expectancy) => {
let scatterData = Object.entries(rates["1999"]).map(([state, value], index) => ({
  state,
  x: value, // The numerical value for x-axis
  y: expectancy['1999'][state] //random val, placeholder
}));


// Create and render the line chart
let lcHeartDisease = linechart()
  .x(d => d.year)
  // .xLabel("Year")
  .y(d => d.value)
  // .yLabel("Age-Adjusted Heart Disease Death Rate")
  .yLabelOffset(40)

lcHeartDisease("#linechart", data);

//highlight starting year
d3.selectAll("circle")
.filter(function() {
  return d3.select(this).attr("year") == 1999; // link to scatterplot
})
.classed("selected", true);

    // Create a scatterplot given x and y attributes, labels, offsets; 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our svg in; and the data to use.
let scHeartDisease = scatterplot()
    .x(d => d.x)
    .y(d => d.y) 
    .yLabelOffset(150)
    
scHeartDisease("#scatterplot", scatterData);



//on mousedown, highlight point on scatterplot and change linechart
d3.selectAll("svg").on("mouseover", (d, i, elements) =>{          
  d3.selectAll("g path").on("mouseover", (d, i, elements) =>{     //shade states on mosueover
    d3.select(elements[i]).classed("mouseover", true);
    var selected = d.properties.STATENAM;
    d3.selectAll("circle")
    .filter(function() {
      return d3.select(this).attr("state") == selected; // link to scatterplot
    })
    .classed("selected", true);
  });
  d3.selectAll("g path").on("mouseout", (d, i, elements) =>{
    d3.select(elements[i]).classed("mouseover", false);
    var selected = d.properties.STATENAM;
    d3.selectAll("circle")
    .filter(function() {
      return d3.select(this).attr("state") == selected; // link to scatterplot
    })
    .classed("selected", false);
  });
  d3.selectAll("g path").on("mousedown", (d, i, elements) =>{     //linking when click state
    var selected = d.properties.STATENAM;
    let data = years.map(year => {            //make new data for selected state
      return { 
          year: year, 
          value: rates[year][selected] 
      };
    });

    d3.select("#linechart svg").remove();     //delete old linechart

    let lcHeartDiseaseNew = linechart()
    .x(d => d.year)
    // .xLabel("Year")
    .y(d => d.value)
    // .yLabel("Age-Adjusted Heart Disease Death Rate")
    .yLabelOffset(40)

  lcHeartDiseaseNew("#linechart", data);      //create new linechart with the new data

  d3.select("#state").text(selected);     //replace old state name
  d3.select("#legendState").text(selected);     //replace old state name

  d3.selectAll("circle")                                          //highlight new year
    .filter(function() {
      return d3.select(this).attr("year") == currentYear; // rehighlight year
    })
    .classed("selected", true);

    d3.selectAll("circle")                                          //highlight new year
    .filter(function() {
      return d3.select(this).attr("state") == selected; 
    })
    .classed("permaselected", true);
  });
  
});


//on year change, highlight linechart and change scatterplot
d3.select("#slider").on("change", function(d) {                   
  d3.selectAll("circle").classed("selected", false);
  d3.selectAll("path").classed("selected", false);          //reset previously selected elements from scatterplot linking
  currentYear = this.value;                                       //recolor map on update
  d3.selectAll("circle")                                          //highlight new year
    .filter(function() {
    return d3.select(this).attr("year") == currentYear; // link to scatterplot
  })
.classed("selected", true);
  svgStates.selectAll("path") 
  .style('fill-opacity', function(d, i){                            //rerender state color and details
    var name = d.properties.STATENAM.replace(" Territory", "");
    return getColor(rates[currentYear][name], max);
  })
  .select('title')                                                  //update title with new data
  .text(function(d) { return d.properties.STATENAM + ", "+ rates[currentYear][d.properties.STATENAM]; });
  d3.select("#scatterplot svg").remove();     //delete old scatterplot

  let scatterData = Object.entries(rates[this.value]).map(([state, value], index) => ({
    state,
    x: value, // The numerical value for x-axis
    y: expectancy[this.value][state] //random val, placeholder
  }));
  let scHeartDiseaseNew = scatterplot()
  .x(d => d.x)
  .y(d => d.y) 
  .yLabelOffset(150)
  
scHeartDiseaseNew("#scatterplot", scatterData);
d3.selectAll("#titleYear").text(currentYear);
});


});
});


})());