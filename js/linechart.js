/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
// document.getElementById("state").textContent = "Georgia"; //Georgia as a placeholder
function linechart() {

  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 60,
      left: 60,
      right: 30,
      bottom: 60,
    },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scalePoint(),
    yScale = d3.scaleLinear();


  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data) {
  const tooltip = d3.select("#tooltip");

    let svg = d3.select(selector)
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
        .classed("svg-content", true);

    svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Define scales
    xScale
      .domain(d3.map(data, xValue).keys())
      .rangeRound([0, width]);


    yScale
      .domain([
        // d3.min(data, d => yValue(d)),
        110,
        350
      ])
      .rangeRound([height, 0]);

    // X axis
    let xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisBottom(xScale));
    
    // Put X axis tick labels at an angle
    xAxis.selectAll("text") 
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    //Y axis 
    let yAxis = svg.append("g")
      .call(d3.axisLeft(yScale));
    
    // X axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height + 50)
        .text("Year");

    //Y axis label
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -margin.top) // Move the label left
      .attr("y", -margin.left) // Move to the left of the linechrt
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Age Adjusted Heart Disease Death Rate");

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("class", "linePath")
        .attr("d", d3.line()
          // Just add that to have a curve instead of segments
          .x(X)
          .y(Y)
        );

      let points = svg.append("g")
        .selectAll(".linePoint")
        .data(data);  // Data binding
      
      console.log(data);
      points = points.enter()
        .append("circle")
        .attr("class", "point linePoint")
        .merge(points)
          .attr("cx", X)   // Position on x-axis
          .attr("cy", Y)   // Position on y-axis
          .attr("r", 6)
          .attr('year', getYear)
          .append("svg:title").text(getVal);

    //create a legend
    let legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, 50)`);

    //data for the legend
    let legendData = [
        {id: "state"},
        { color: "red", stroke: "red", label: "Current Year on Map" }
      ];

   // Add legend items
  legend.selectAll(".legend-item")
  .data(legendData)
  .enter()
  .append("g")
  .attr("class", "legend-item")
  .attr("transform", (d, i) => `translate(0, ${i * 20})`) 
  .each(function (d) {
    if (d.id === "state") { //function to display the state name and updated it when user clicks
      d3.select(this)
        .append("text")
        .attr("x", 10) 
        .attr("y", 5) 
        .text(() => "Current State: " + document.getElementById("state").textContent) // gets state from HTML
    } else { //create red circle legend item
      d3.select(this)
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .style("fill", d.color)
        .style("stroke", d.stroke)
        .style("stroke-width", 2);

      // Add label for the red legend item
      d3.select(this)
        .append("text")
        .attr("x", 10) 
        .attr("y", 5) 
        .text(d.label)
        .attr("alignment-baseline", "middle");
    }
  });
    
//     // Add legend item
//     legend.selectAll(".legend-item")
//       .data(legendData)
//       .enter()
//       .append("g")
//       .attr("class", "legend-item")
//       .attr("transform", (d, i) => `translate(0, ${i * 20})`) // Space out items vertically
//       .each(function(d) {
//         //adds colors to the legend
//         d3.select(this)
//           .append("circle")
//           .attr("cx", 0)
//           .attr("cy", 0)
//           .attr("r", 6) 
//           .style("fill", d.color)
//           .style("stroke",d.stroke)
//           .style("stroke-width", 2);
//          // Add labels
//         d3.select(this)
//           .append("text")
//           .attr("x", 10) 
//           .attr("y", 5) 
//           .text(d.id)
//           .text(d.label)
//           .attr("alignment-baseline", "middle");
// });

    
    function brush(g) {
      const brush = d3.brush()
        .on("start brush", highlight)
        .on("end", brushEnd)
        .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);

      ourBrush = brush;

      g.call(brush); // Adds the brush to this element

      // Highlight the selected circles.
      function highlight() {
        if (d3.event.selection === null) return;
        const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;
        points.classed("selected", d =>
          x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
        );

    //     // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

    //     // Let other charts know
        dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
      }
      
      function brushEnd() {
        // We don't want an infinite recursion
        if (d3.event.sourceEvent.type != "end") {
          d3.select(this).call(brush.move, null);
        }
      }
    }

    return chart;
  }

  // The x-accessor from the datum
  // function X(d) {
  //   return xScale(xValue(d));
  // }

  // The y-accessor from the datum
  // function Y(d) {
  //   return yScale(yValue(d));
  // }
  function X(d) {
    return xScale(d.year);  // Correctly access the 'year' for X position
  }
  
  function Y(d) {
    return yScale(d.value);  // Correctly access the 'value' for Y position
  }

  function getVal(d){
    return d.value;
  }
  function getYear(d){
    return d.year;
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function (_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function (_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xLabel = function (_) {
    if (!arguments.length) return xLabelText;
    xLabelText = _;
    return chart;
  };

  chart.yLabel = function (_) {
    if (!arguments.length) return yLabelText;
    yLabelText = _;
    return chart;
  };

  chart.yLabelOffset = function (_) {
    if (!arguments.length) return yLabelOffsetPx;
    yLabelOffsetPx = _;
    return chart;
  };

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
    selectableElements.classed("selected", d => {
      return selectedData.includes(d)
    });
  };

  return chart;
}