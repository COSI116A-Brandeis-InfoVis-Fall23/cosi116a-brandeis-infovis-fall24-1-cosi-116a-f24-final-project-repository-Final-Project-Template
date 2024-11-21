// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  d3.json("data/InfrastructureData.json", (data) => {
  const dispatchString = "selectionUpdated";


    let spBusPassengers = scatterplot()
    .x(d => d.infrastructureInvestment)
    .xLabel("Transportation Investment (USD)")
    .y(d => d.railUsageTotalPassengers2022 / d.population)
    .yLabel("Rail Passengers per Capita")
    .yLabelOffset(150)
    .selectionDispatcher(d3.dispatch(dispatchString))
    ("#scatterplot", data);

  });
    
})()); 