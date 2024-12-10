// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  console.log("Hello, world!");

  //temporary line chart data "junk data"
  const linechartData = [
    [1999, 50],
    [2000, 100],
    [2005, 200],
    [2010, 150],
    [2015, 300],
    [2020, 250],
    [2022, 250],
  ];

  d3.json("data/heartratesALL.json", (rates) => {
  // console.log(rates);

  // Extract the years 
  let years = Object.keys(rates); // ['1999', '2000', ...]
  let data = years.map(year => {
    return { 
        year: year, 
        value: rates[year]["Alabama"] // Heart disease death rate for Alabama
    };
  });
// console.log(data);
d3.json("data/lifeExpectancy.json", (expectancy) => {
let scatterData = Object.entries(rates["1999"]).map(([state, value], index) => ({
  state,
  x: value, // The numerical value for x-axis
  y: expectancy['1999'][state] //random val, placeholder
}));

// });
// console.log("test")
// console.log(scatterData);


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
    // .xLabel("Age-Adjusted Heart Disease Death Rate in 1999")
    .y(d => d.y) //this needs to change to the other data set. currently its using the same data for x and y axis
    // .yLabel("Life Expectancy per State in 1999")
    .yLabelOffset(150)
    
scHeartDisease("#scatterplot", scatterData);




//on mosuedown, highlight point on scatterplot and change linechart
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
    console.log(selected);
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
  d3.selectAll("circle")                                          //highlight new year
    .filter(function() {
      return d3.select(this).attr("year") == currentYear; // rehighlight year
    })
    .classed("selected", true);

    d3.selectAll("circle")                                          //highlight new year
    .filter(function() {
      return d3.select(this).attr("state") == selected; // rehighlight year
    })
    .classed("permaselected", true);
  });
  
});


//on year change, highlight linechart and change scatterplot
d3.select("#slider").on("change", function(d) {                   
  d3.selectAll("circle").classed("selected", false);
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
  .y(d => d.y) //this needs to change to the other data set. currently its using the same data for x and y axis
  .yLabelOffset(150)
  
scHeartDiseaseNew("#scatterplot", scatterData);
d3.selectAll("#titleYear").text(currentYear);

});

});
});


})());