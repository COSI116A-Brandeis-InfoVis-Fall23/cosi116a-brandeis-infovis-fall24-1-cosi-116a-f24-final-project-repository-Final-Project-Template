((() => {
  
  const dispatchString = "selectionUpdated";

    
  //d3.json("data/comparisonByYear.json", function(error, data) {
    d3.json("data/data.json", function(error, data) {
    if (error) {
        console.error("Error loading JSON data:", error);
        return;
    }


    console.log("Data loaded:", data);

      // Default year to display
      let yearSelected = "2017"; 
      let currData = data[yearSelected];
  
      currData = currData.filter(d => d.Rating !== "N/A");

      document.getElementById("selected-year").textContent = yearSelected;
  

  
      let tableData = table()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#table", currData);


      let spRatingGDPComparison = scatterplot()
      .x(d => d.Transportation_Spending) // Map GDP to x-axis
      .xLabel("Transportation Spending (as % of GDP)")
      .y(d => +d.Rating) // Convert Rating to numeric for y-axis
      .yLabel("Transportation Rating (0-7)")
      .yLabelOffset(150)
      .selectionDispatcher(d3.dispatch("selectionUpdated"))
      ("#scatterplot", currData);

      function updateYear(year) {
        yearSelected = year;
        let currData = data[yearSelected];

        currData = currData.filter(d => d.Rating !== "N/A");
        
        d3.select("#scatterplot").selectAll("*").remove();

        let spRatingGDPComparison = scatterplot()
        .x(d => d.Transportation_Spending) 
        .xLabel("Transportation Spending (as % of GDP)")
        .y(d => +d.Rating) // Convert Rating to numeric for y-axis
        .yLabel("Transportation Rating (0-7)")
        .yLabelOffset(150)
        .selectionDispatcher(d3.dispatch("selectionUpdated"))
        ("#scatterplot", currData);

        d3.select("table").remove();
        tableData = table()
            .selectionDispatcher(d3.dispatch(dispatchString))
            ("#table", currData);
        
        spRatingGDPComparison.selectionDispatcher().on(dispatchString, function(selectedData) {
          tableData.updateSelection(selectedData);
        });

        tableData.selectionDispatcher().on(dispatchString, function(selectedData) {
          spRatingGDPComparison.updateSelection(selectedData);
        });
        
        document.getElementById("selected-year").textContent = yearSelected;
      }

       // Add event listeners to the buttons
      document.getElementById("2007").addEventListener("click", () => updateYear("2007"));
      document.getElementById("2008").addEventListener("click", () => updateYear("2008"));
      document.getElementById("2009").addEventListener("click", () => updateYear("2009"));
      document.getElementById("2010").addEventListener("click", () => updateYear("2010"));
      document.getElementById("2011").addEventListener("click", () => updateYear("2011"));
      document.getElementById("2012").addEventListener("click", () => updateYear("2012"));
      document.getElementById("2013").addEventListener("click", () => updateYear("2013"));
      document.getElementById("2014").addEventListener("click", () => updateYear("2014"));
      document.getElementById("2015").addEventListener("click", () => updateYear("2015"));
      document.getElementById("2016").addEventListener("click", () => updateYear("2016"));
      document.getElementById("2017").addEventListener("click", () => updateYear("2017"));


    spRatingGDPComparison.selectionDispatcher().on(dispatchString, function(selectedData) {
      tableData.updateSelection(selectedData);
    });

    tableData.selectionDispatcher().on(dispatchString, function(selectedData) {
      spRatingGDPComparison.updateSelection(selectedData);
    });
  });

}))();
