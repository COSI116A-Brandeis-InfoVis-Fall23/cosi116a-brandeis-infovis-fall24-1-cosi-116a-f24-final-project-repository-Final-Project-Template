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

    // Initialize the bar graphs
    const barGraph1 = countryBarGraphs();
    const barGraph2 = countryBarGraphs();

    barGraph1("#bar-graph-1", data, d => d.railUsageTotalPassengers2022 / d.population, "Rail Passengers per Capita");
    barGraph2("#bar-graph-2", data, d => d.infrastructureInvestment, "Transportation Investment");

    barGraph1.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
    });

    barGraph2.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph1.updateSelection(selectedData);
    });

    // When clicking on a scatterplot point, update the countryBar.js bar and countryBarGraphs.js bar charts
    scatter.selectionDispatcher().on(countrySelectedString, function(countryName) {
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
        countryBarChart("#bar-chart", countryBarData);
        barGraph1.updateSelection([countryData]);
        barGraph2.updateSelection([countryData]);
      } else {
        countryBarChart("#bar-chart");
        console.log("Missing required data for the selected country");
      }
    });

    // Initialize the bar chart
    const countryBarChart = countryBar();

    // Handle selection updates
    scatter.selectionDispatcher().on(dispatchString, (selectedData) => {
      barGraph1.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
    });

    document.getElementById("clear-button").addEventListener("click", function() {
      scatter.updateSelection([]);
      barGraph1.updateSelection([]);
      barGraph2.updateSelection([]);
      countryBarChart("#bar-chart", []);
    });
  });
})();
