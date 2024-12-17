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
  
      // YOUR CODE HERE
      let tr = table.append('thead').append('tr')
      tr.selectAll('th').data(tableHeaders).enter().append('th').text((d) => d)
  
      // Then, you add a row for each row of the data.  Within each row, you
      // add a cell for each piece of data in the row.
      // HINTS: For each piece of data, you should add a table row.
      // Then, for each table row, you add a table cell.  You can do this with
      // two different calls to enter() and data(), or with two different loops.
  
      // YOUR CODE HERE
  
      let tb = table.append('tbody');
      tb.selectAll('tr').data(data).enter().append('tr').selectAll('td').data((d) => Object.values(d)).enter().append('td').text((d) => d)
  
      // Then, add code to allow for brushing.  Note, this is handled differently
      // than the line chart and scatter plot because we are not using an SVG.
      // Look at the readme of the assignment for hints.
      // Note: you'll also have to implement linking in the updateSelection function
      // at the bottom of this function.
      // Remember that you have to dispatch that an object was highlighted.  Look
      // in linechart.js and scatterplot.js to see how to interact with the dispatcher.
  
      // HINT for brushing on the table: keep track of whether the mouse is down or up, 
      // and when the mouse is down, keep track of any rows that have been mouseover'd
  
      // YOUR CODE HERE
      // Implement brushing
      let isMouseDown = false;
      let selectedRows = new Set();
      
      // Function to toggle row selection
      function toggleRowSelection(row) {
          const dataIndex = row.datum().year; // Using 'year' as a unique identifier, adjust if needed
          if (selectedRows.has(dataIndex)) {
              selectedRows.delete(dataIndex);
              row.classed("selected", false);
          } else {
              selectedRows.add(dataIndex);
              row.classed("selected", true);
          }
      }
      
      // Mouse events for brushing
      tb.selectAll('tr')
        .on("mousedown", function() {
            isMouseDown = true;
            toggleRowSelection(d3.select(this));
        })
        .on("mouseover", function() {
            if (isMouseDown) {
                toggleRowSelection(d3.select(this));
            }
        });
      
      // Handle mouse up event to stop brushing and dispatch selected rows
      d3.select(window).on("mouseup", () => {
          if (isMouseDown) {
              isMouseDown = false;
              dispatchSelectedRows();
          }
      });
  
      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
      
      // Dispatch event with selected data
      function dispatchSelectedRows() {
          const selectedData = data.filter(d => selectedRows.has(d.year)); // Adjust if a different unique identifier is needed
          dispatcher.call(dispatchString, this, selectedData);
      }
  
      
      
      // Handle selection update from external interactions
      dispatcher.on(dispatchString, function(selectedData) {
          tb.selectAll('tr').classed("selected", false); // Clear previous selection
          selectedData.forEach(d => {
              tb.selectAll('tr')
                .filter(rowData => rowData.year === d.year) // Adjust as needed for unique identifier
                .classed("selected", true);
          });
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