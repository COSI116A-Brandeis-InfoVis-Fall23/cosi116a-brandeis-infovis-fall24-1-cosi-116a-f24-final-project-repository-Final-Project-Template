// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  // Load the data from a json file (you can make these using
  // JSON.stringify(YOUR_OBJECT), just remove the surrounding "")
  d3.json("data/DoD_Budget.json", (data) => {

    // General event type for selections, used by d3-dispatch
    // https://github.com/d3/d3-dispatch
    const dispatchString = "selectionUpdated";

 

    // Create a table given the following: 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our table in; and the data to use.
    let tableData = table()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#table", data);


    // When the table is updated via brushing, tell the line chart and scatterplot
	tableData.selectionDispatcher().on(dispatchString, function(selectedData) {
		//spUnemployMurder.updateSelection(selectedData);
		//lcYearPoverty.updateSelection(selectedData);
		
	});
});

})());