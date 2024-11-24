
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
    tr.selectAll('th').data(tableHeaders).enter().append('th').text((d) => d)

    // Then, you add a row for each row of the data.  Within each row, you
    // add a cell for each piece of data in the row.
    // HINTS: For each piece of data, you should add a table row.
    // Then, for each table row, you add a table cell.  You can do this with
    // two different calls to enter() and data(), or with two different loops.

    // Add body to the table
    let tbody = table.append('tbody')
    
    // Makes all the rows
    let rows = tbody.selectAll("tr")
    .data(data)
    .enter()
    .append("tr")

    // Creates cells for each row
    rows.selectAll("td")
    .data(d => tableHeaders.map(key => d[key])) // Map the row's data to match table headers
    .enter()
    .append("td")
    .text(e => e);

    return chart;
  }
      d3.selectAll("tr")
      .on("mouseover", (d, i, elements) => {
        d3.select(elements[i]).classed("highlighted", true)
      })
      .on("mouseout", (d, i, elements) => {
        d3.select(elements[i]).classed("highlighted", false)
      });

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

   console.log(chart);


     // Then, add code to allow for brushing.  Note, this is handled differently
    // than the line chart and scatter plot because we are not using an SVG.
    // Look at the readme of the assignment for hints.
    // Note: you'll also have to implement linking in the updateSelection function
    // at the bottom of this function.
    // Remember that you have to dispatch that an object was highlighted.  Look
    // in linechart.js and scatterplot.js to see how to interact with the dispatcher.

    // HINT for brushing on the table: keep track of whether the mouse is down or up, 
    // and when the mouse is down, keep track of any rows that have been mouseover'd
    d3.selectAll("tr")
    .on("mouseover", (d, i, elements) => {
      d3.select(elements[i]).classed("highlighted", true)
    })
    .on("mouseout", (d, i, elements) => {
      d3.select(elements[i]).classed("highlighted", false)
    });




    
  return chart;
}