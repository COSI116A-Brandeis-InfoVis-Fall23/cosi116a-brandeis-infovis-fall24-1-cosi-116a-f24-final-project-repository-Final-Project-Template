/* global D3 */

function table() {

  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
   
    let ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;
  
	
  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data) {
    let table = d3.select(selector)
      .append("table")
		.classed("my-table", true);

	// Append a <thead> to the table and a <tr> to the thead
    let tableHeaders = Object.keys(data[0]);
	
    
	
    let tr = table.append('thead').append('tr')
    tr.selectAll('th').data(tableHeaders).enter().append('th').text((d) => d);

	let tbody = table.append("tbody");

	// Append a <tr> for each item in data
	let rows = tbody.selectAll("tr")
		.data(data)
		.enter()
		.append("tr")
		.attr("id", function(d){ //VERY IMPORTANT: This is how we can select the row by the state name
			return d.State;
		});
		 

	
	

	// Append <td> cells to each <tr>
	rows.selectAll("td")
		.data(d => Object.values(d))  // Use the values of each data object
		.enter()
		.append("td")
		.text(d => d)
    
	let isMouseDown = false;

	d3.selectAll("tr")
	.on("mousedown", function () {
		//Clears all rows of being selected
		d3.selectAll("tr").classed("selected", false);
		
		//Instantiates a dispatch string, and dispatches that all rows are no longer selected
		let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
		dispatcher.call(dispatchString, this, d3.select("tr").data());
		

		//Sets the row clicked to selected
		d3.select(this).classed("selected", true);

		//Dispatches the row that it was selected
		dispatcher.call(dispatchString, this, d3.selectAll(".selected").data());

		
		isMouseDown = true;
	})
	.on("mouseup", function () {
		isMouseDown = false;
	})
	.on("mouseover", function () {
		if (isMouseDown) {
			//If the mouse is down and is on the row, make it selected
			d3.select(this).classed("selected", true);

			//Instantiates the dispatch string, and dispatches all rows selected
			let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
			dispatcher.call(dispatchString, this, d3.selectAll(".selected").data());

		}
		else{
			//If mouse is up and goes over a selected row, make the background color red
			if (d3.select(this).classed("selected")){
				d3.select(this).style("background-color", "red")
			}
			//If mouse is up and goes over a unselected row, make the background color gray
			else{
				d3.select(this).style("background-color", "lightgray")
			}
		}
	})
	//Resets the background color on the row after the mouse leaves the row
	.on("mouseout", function() {
		d3.select(this).style("background-color", null);
});


    return chart;
  }



  // Gets or sets the dispatcher we use for selection events
  chart.selectionDispatcher = function (_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return chart;
  };

  // Given selected data from another visualization 
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

      // Select all table rows
	  d3.selectAll('tr').classed("selected", function () {
        // Get the id of the current row
        let rowId = d3.select(this).attr('id');

        // Check if the row's id matches the selectedData (state name)
        return rowId === selectedData;
    });
	

}
		
	
	
  return chart;
}