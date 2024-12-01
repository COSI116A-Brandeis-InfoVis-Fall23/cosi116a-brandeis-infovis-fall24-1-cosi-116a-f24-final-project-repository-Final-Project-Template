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
  .xLabel("Year")
  .y(d => d.value)
  .yLabel("Age-Adjusted Heart Disease Death Rate")
  .yLabelOffset(40)

lcHeartDisease("#linechart", data);
}).catch((error) => {
  console.error("Error loading the JSON file:", error);

});

})());