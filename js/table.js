
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

    return chart;
  }
      d3.selectAll("tr")
      .on("mouseover", (d, i, elements) => {
        d3.select(elements[i]).classed("highlighted", true)
      })
      .on("mouseout", (d, i, elements) => {
        d3.select(elements[i]).classed("highlighted", false)
      });


   chart.selectionDispatcher = function (_) {
     if (!arguments.length) return dispatcher;
     dispatcher = _;
     return chart;
   };


   chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

     // Select an element if its datum was selected
     d3.selectAll('tr').classed("selected", d => {
       return selectedData.includes(d)
    });
   };

   console.log(chart);


    d3.selectAll("tr")
    .on("mouseover", (d, i, elements) => {
      d3.select(elements[i]).classed("highlighted", true)
    })
    .on("mouseout", (d, i, elements) => {
      d3.select(elements[i]).classed("highlighted", false)
    });




    
  return chart;
}


