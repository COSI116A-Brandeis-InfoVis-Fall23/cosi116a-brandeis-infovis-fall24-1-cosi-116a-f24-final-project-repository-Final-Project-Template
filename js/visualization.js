(() => {
  d3.json("data/InfrastructureData.json", (data) => {
    const dispatchString = "selectionUpdated";
    const countrySelectedString = "countrySelected";  // Add the countrySelected event name

    // Initialize scatterplot
    const scatter = scatterplot()
      .x(d => d.infrastructureInvestment)
      .xLabel("Transportation Investment (USD)")
      .y(d => d.railUsageTotalPassengers2022 / d.population)
      .yLabel("Rail Passengers per Capita")
      .yLabelOffset(150)
      .selectionDispatcher(d3.dispatch(dispatchString, countrySelectedString)) // Register both events
    ("#scatterplot", data);

    // Listen to the "countrySelected" event after initializing scatterplot
    scatter.selectionDispatcher().on("countrySelected", function(countryName) {

      // Find the data for the selected country
      const countryData = data.find(d => d.country === countryName);

      // Make sure that the necessary properties exist
      if (countryData && countryData.infrastructureInvestment && countryData.infrastructureMaintenance) {
        const countryBarData = [
          {
            country: countryData.country,
            infrastructureInvestment: countryData.infrastructureInvestment,
            infrastructureMaintenance: countryData.infrastructureMaintenance
          }
        ];
        countryBarChart("#bar-container", countryBarData);
      } else {
        countryBarChart("#bar-container");
        console.log("Missing required data for the selected country");
      }
    });

    // Initialize the bar chart
    const countryBarChart = countryBar();

    // Handle selection updates
    scatter.selectionDispatcher().on("selectionUpdated", (selectedData) => {
    });
  });
})();
