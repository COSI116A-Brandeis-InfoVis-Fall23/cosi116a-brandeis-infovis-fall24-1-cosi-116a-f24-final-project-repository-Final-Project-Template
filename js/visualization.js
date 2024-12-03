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
  console.log(rates);

  // Extract the years 
  let years = Object.keys(rates); // ['1999', '2000', ...]
  let data = years.map(year => {
    return { 
        year: year, 
        value: rates[year]["Alabama"] // Heart disease death rate for Alabama
    };
  });
console.log(data);

const scatterData = Object.entries(rates["1999"]).map(([state, value], index) => ({
  state,
  x: value, // The numerical value for x-axis
  y: Math.random() * 10 //random val, placeholder
}));

console.log("test")
console.log(scatterData);


// Create and render the line chart
let lcHeartDisease = linechart()
  .x(d => d.year)
  // .xLabel("Year")
  .y(d => d.value)
  // .yLabel("Age-Adjusted Heart Disease Death Rate")
  .yLabelOffset(40)

lcHeartDisease("#linechart", data);

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
d3.selectAll("svg").on("mouseover", (d, i, elements) =>{          //for linking
  d3.selectAll("g path").on("mouseover", (d, i, elements) =>{     //shade states on mosueover
    d3.select(elements[i]).classed("mouseover", true);
  });
  d3.selectAll("g path").on("mouseout", (d, i, elements) =>{
    d3.select(elements[i]).classed("mouseover", false);
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
  lcHeartDiseaseNew("#linechart", data);      //create new linechart with the enw data
  //scatterplot linking goes here
  d3.selectAll("#state").text(selected);
  });
});
})


})());