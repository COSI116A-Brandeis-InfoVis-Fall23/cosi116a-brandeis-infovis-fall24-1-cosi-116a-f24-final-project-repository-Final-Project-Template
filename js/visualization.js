// Immediately Invoked Function Expression to limit access to our 
// variables and prevent race conditions
((() => {

    // Load the data from a json file (you can make these using
    // JSON.stringify(YOUR_OBJECT), just remove the surrounding "")
    d3.json("data/test.json", (data) => {
  
      // General event type for selections, used by d3-dispatch
      // https://github.com/d3/d3-dispatch
      const dispatchString = "selectionUpdated";
  
      // Create a line chart given x and y attributes, labels, offsets; 
      // a dispatcher (d3-dispatch) for selection events; 
      // a div id selector to put our svg in; and the data to use.
      
      /*
      let lcYearPoverty = linechart()
        .x(d => d.year)
        .xLabel("YEAR")
        .y(d => d.poverty)
        .yLabel("POVERTY RATE")
        .yLabelOffset(40)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#linechart", data);
        */

  
      // Create a scatterplot given x and y attributes, labels, offsets; 
      // a dispatcher (d3-dispatch) for selection events; 
      // a div id selector to put our svg in; and the data to use.
      
      /*
      let spUnemployMurder = scatterplot()
        .x(d => d.unemployment)
        .xLabel("UNEMPLOYMENT RATE")
        .y(d => d.murder)
        .yLabel("MURDER RATE IN STATE PER 100000")
        .yLabelOffset(150)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#scatterplot", data);
        */
  
      // Create a table given the following: 
      // a dispatcher (d3-dispatch) for selection events; 
      // a div id selector to put our table in; and the data to use.
      d3.csv("data/transport_spend_as_per_gdp - transport_spend_as_per_gdp.csv").then(data => {
        data.forEach(d => {
          d.Year = +d.Value; // Ensure numeric conversion if necessary
        });
      
        // Initialize the table
        const myTable = table(); // Call your table function
        myTable("#table", data); // Pass data to the table function
      });
  
       /* 
      // When the line chart selection is updated via brushing, 
      // tell the scatterplot to update it's selection (linking)
      lcYearPoverty.selectionDispatcher().on(dispatchString, function(selectedData) {
        spUnemployMurder.updateSelection(selectedData);
        // ADD CODE TO HAVE TABLE UPDATE ITS SELECTION AS WELL
        tableData.updateSelection(selectedData);
      });
  
      // When the scatterplot selection is updated via brushing, 
      // tell the line chart to update it's selection (linking)
      spUnemployMurder.selectionDispatcher().on(dispatchString, function(selectedData) {
        lcYearPoverty.updateSelection(selectedData);
        // ADD CODE TO HAVE TABLE UPDATE ITS SELECTION AS WELL
        tableData.updateSelection(selectedData);
        
      });
      */
  
      // When the table is updated via brushing, tell the line chart and scatterplot
      // YOUR CODE HERE
      tableData.selectionDispatcher().on(dispatchString, function(selectedData) {
      });
    });
  
  })());