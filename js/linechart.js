/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
document.getElementById("state").textContent = "Georgia"; //Georgia as a placeholder
function linechart() {

  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 60,
      left: 50,
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
    // ourBrush = null,
    // selectableElements = d3.select(null),
    // dispatcher;

  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data) {
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

    // let xScale = d3.scalePoint()
    //     .domain(d3.range(1999, 2023)) // Creates an array of years from 1999 to 2022
    //     .rangeRound([0, width]);

    yScale
      .domain([
        d3.min(data, d => yValue(d)),
        d3.max(data, d => yValue(d))
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
      .attr("y", -margin.left + 20) // Move to the left of the linechrt
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

    // Add the points
    let points = svg.append("g")
      .selectAll(".linePoint")
        .data(data);
    
    // points.exit().remove();
          
    points = points.enter()
      .append("circle")
        .attr("class", "point linePoint")
      .merge(points)
        .attr("cx", X)
        .attr("cy", Y)        
        .attr("r",3);
        
    // selectableElements = points;

    // svg.call(brush);
      
    // Highlight points when brushed

    
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
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor from the datum
  function Y(d) {
    return yScale(yValue(d));
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