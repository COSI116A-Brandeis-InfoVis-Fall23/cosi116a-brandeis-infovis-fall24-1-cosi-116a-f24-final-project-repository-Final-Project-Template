function scatterplot() {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  let margin = { top: 60, left: 50, right: 30, bottom: 50 },
    width = 750 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    sizeScale = d3.scaleLinear(),
    selectableElements = d3.select(null),
    dispatcher = d3.dispatch("selectionUpdated", "countrySelected");

  let isBrushing = false; // Track if brushing is happening
  let selectedCountry = null; // Track the selected country for the bar

  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
        .classed("svg-content", true);

    svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales
    xScale.domain([d3.min(data, d => xValue(d)), d3.max(data, d => xValue(d))]).rangeRound([0, width]);
    yScale.domain([d3.min(data, d => yValue(d)), d3.max(data, d => yValue(d))]).rangeRound([height, 0]);
    sizeScale.domain([0, d3.max(data, d => d.population)]).range([5, 20]);

    let xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(5));

    xAxis.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "translate(" + (width / 2) + ", 40)")
        .style("text-anchor", "middle")
        .text(xLabelText);

    let yAxis = svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)") 
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text(yLabelText);

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

      g.call(brush); 

      // Highlight the selected circles
      function highlight() {
        if (d3.event.selection === null) return;
        const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;

        // Remove "selected" class from all points
        points.classed("selected", false);

        // If within the bounds of the brush, select it
        points.classed("selected", d =>
          x0 <= xScale(xValue(d)) && xScale(xValue(d)) <= x1 && y0 <= yScale(yValue(d)) && yScale(yValue(d)) <= y1
        );

        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
       
        dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
      }

      function brushEnd() {
        if (d3.event.sourceEvent.type != "end") {
          d3.select(this).call(brush.move, null);
        }
      }
    }

    svg.call(brush);

    // Add the points
    let points = svg.append("g")
      .selectAll(".scatterPoint")
      .data(data);

    points.exit().remove();

    points = points.enter()
      .append("circle")
      .attr("class", "point scatterPoint")
    .merge(points)
    .attr("cx", X)
    .attr("cy", Y)
      .attr("r", d => sizeScale(d.population))
      .attr("fill", d => colorScale(d.country))
      .on("mouseover", function() {
        d3.select(this).classed("mouseover", true);
      })
      .on("mouseout", function() {
        d3.select(this).classed("mouseover", false);
      })
      .on("click", function(d) {
        // Remove "selected" class from all points
        points.classed("selected", false);

        // Toggle selection on click
        const isSelected = d3.select(this).classed("selected");
        d3.select(this).classed("selected", !isSelected);

        // Update selected country
        if (!isSelected) {
          selectedCountry = d.country; // Set selected country
        } else {
          selectedCountry = null; // Unselect country
        }

        // Dispatch the countrySelected event with the country name
        dispatcher.call("countrySelected", this, selectedCountry);
        
        // Update the bar visibility
        updateBar();
        
      });

    // Add the country name labels
    let countryLabels = svg.selectAll(".countryLabel")
        .data(data);

    countryLabels.exit().remove();

    countryLabels = countryLabels.enter()
        .append("text")
        .attr("class", "countryLabel")
        .merge(countryLabels)
        .attr("x", d => xScale(xValue(d)) + 5)
        .attr("y", d => yScale(yValue(d)) - 5) 
        .text(d => d.country);

    selectableElements = points;

    // The x-accessor from the datum
    function X(d) {
      return xScale(xValue(d));
    }

    // The y-accessor from the datum
    function Y(d) {
      return yScale(yValue(d));
    }

    // Add a bar element that will be shown/hidden based on selection
    const bar = svg.append("rect")
      .attr("class", "selection-bar")
      .attr("width", 0)  // Start hidden (width 0)
      .attr("height", 20)
      .attr("y", height + margin.top + 10)
      .style("fill", "steelblue");

    // Function to update the bar visibility and position
    function updateBar() {
      if (selectedCountry !== null) {
        const selectedData = data.find(d => d.country === selectedCountry);
        const xPos = xScale(xValue(selectedData));

        // Show the bar and position it based on the selected country's x value
        bar.transition()
          .duration(200)
          .attr("x", xPos)
          .attr("width", 20); // Set bar width
      } else {
        // Hide the bar when no country is selected
        bar.transition()
          .duration(200)
          .attr("width", 0);
      }
    }

    // Initial update of the bar (it will be hidden if no country is selected)
    updateBar();

    return chart;
  }

  // Setters and getters for chart configuration
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

  // Gets or sets the dispatcher for selection events
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
