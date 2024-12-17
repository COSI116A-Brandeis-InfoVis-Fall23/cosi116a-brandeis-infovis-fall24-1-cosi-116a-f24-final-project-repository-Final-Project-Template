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
    //tr.selectAll('th').data(tableHeaders).enter().append('th').text((d) => d)
    tr.selectAll('th').data(["Country", "ABV", "Rating", "GDP", "Transportation Spending (as % of GDP)"]).enter().append('th').text((d) => d)

    let tbody = table.append('tbody')
    

    let rows = tbody.selectAll("tr")
    .data(data)
    .enter()
    .append("tr")


    rows.selectAll("td")
    .data(d => tableHeaders.map(key => d[key])) // Map the row's data to match table headers
    .enter()
    .append("td")
    .text(e => e);

    let mouseDown;
    d3.selectAll("tr").on("mouseover", (d, i, elements) => {
      d3.select(elements[i]).classed("mouseover", true)
      if (mouseDown) {
        d3.select(elements[i]).classed("selected", true)
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
        dispatcher.call(dispatchString, this, table.selectAll(".selected").data());
      }
    })
    .on("mouseup", (d, i, elements) => {
      mouseDown = false
    })
    .on("mousedown", (d, i, elements) => {
      d3.selectAll(".selected").classed("selected", false)
      mouseDown = true
      d3.select(elements[i]).classed("selected", true)
      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
      dispatcher.call(dispatchString, this, table.selectAll(".selected").data());
    })
    .on("mouseout", (d, i, elements) => {
      d3.select(elements[i]).classed("mouseover", false)
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

    d3.selectAll('tr').classed("selected", d => {
      return selectedData.includes(d)
    });

  };

  return chart;
}

