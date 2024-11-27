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


// Create and render the line chart
let lcHeartDisease = linechart()
  .xLabel("Year")
  .yLabel("Age-Adjusted Heart Disease Death Rate")
  .yLabelOffset(40);

lcHeartDisease("#linechart", linechartData);

})());