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

    // Here, we grab the labels of the first item in the dataset
    //  and store them as the headers of the table.
    let tableHeaders = Object.keys(data[0]);
	
    // You should append these headers to the <table> element as <th> objects inside
    // a <th>
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table
	
    let tr = table.append('thead').append('tr')
    tr.selectAll('th').data(tableHeaders).enter().append('th').text((d) => d);
	
    // Then, you add a row for each row of the data.  Within each row, you
    // add a cell for each piece of data in the row.
    // HINTS: For each piece of data, you should add a table row.
    // Then, for each table row, you add a table cell.  You can do this with
    // two different calls to enter() and data(), or with two different loops.
	
	let tbody = table.append("tbody");

	// Append a <tr> for each item in data, then append <td> cells within each <tr>
	let rows = tbody.selectAll("tr")
		.data(data)
		.enter()
		.append("tr");
		
	rows.selectAll("td")
		.data(d => Object.values(d))  // Use the values of each data object
		.enter()
		.append("td")
		.text(d => d);

	
    // HINT for brushing on the table: keep track of whether the mouse is down or up, 
    // and when the mouse is down, keep track of any rows that have been mouseover'd
	
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

    // Select an element if its datum was selected
    d3.selectAll('tr').classed("selected", d => {
	return selectedData.includes(d)
    });
  };
  
	
	
  return chart;
}