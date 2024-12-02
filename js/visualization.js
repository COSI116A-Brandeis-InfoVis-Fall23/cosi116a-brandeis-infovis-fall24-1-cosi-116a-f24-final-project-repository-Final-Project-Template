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
    .x(d => d.value)
    // .xLabel("Age-Adjusted Heart Disease Death Rate in 1999")
    .y(d => d.value) //this needs to change to the other data set. currently its using the same data for x and y axis
    // .yLabel("Life Expectancy per State in 1999")
    .yLabelOffset(150)
    
scHeartDisease("#scatterplot", data);

})

})());