function scatterplot() {
  let margin = { top: 60, left: 50, right: 30, bottom: 50 },
    width = 750 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    sizeScale = d3.scaleSqrt(), //!!scaleLinear
    selectableElements = d3.select(null),
    dispatcher = d3.dispatch("selectionUpdated", "countrySelected");

  let selectedCountry = null;
  let click = false;


  function chart(selector, data) {

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    const tooltip2 = d3.select("body")
      .append("div")
      .attr("class", "tooltip");
    
    

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

    //Create info bubble icon
    const infoGroup = svg.append("g")
      .attr("transform", `translate(${-40}, ${-50})`);

    infoGroup.append("circle")
        .attr("r", 9)
        .attr("fill", "#007BFF")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("cursor", "pointer");

        // Add "i" icon inside the button
    infoGroup.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "12px")
       
        .style("font-style", "italic")
        .text("i");
      
    infoGroup.on("mouseover", function (d) {
        d3.select(this).classed("mouseover", true);
        let tooltipContentInfo = "Rail usage per capita in 2021 vs rail infrastructure investment in 2022 per country. Investment is measured in euros, and usage is measured in total passengers on rail by country, proportioned to the country's population.";

  
  
        tooltip2
          .style("opacity", 1)
          .style("visibility", "visible")
          .style("height", "80px")
          .style("width", "350px")
          .html(tooltipContentInfo);  // Display the tooltip content
        })
        .on("mousemove", function () {
          const mouseX = d3.event.pageX; // Mouse X position relative to the page
          const mouseY = d3.event.pageY; // Mouse Y position relative to the page
      
          tooltip2
              .style("opacity", 1)
              .style("visibility", "visible")
              .style("left", `${mouseX + 10}px`) // Offset tooltip slightly to the right
              .style("top", `${mouseY - 20}px`); // Offset tooltip slightly above the mouse
      })
        .on("mouseout", function () {
          d3.select(this).classed("mouseover", false);
          tooltip2.style("opacity", 0); // Hide tooltip
        });
    
    
      
    // Highlight points when brushed
    function brush(g) {
       brush = d3.brush()
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
        points.classed("selected", (d =>
          x0 <= xScale(xValue(d)) && xScale(xValue(d)) <= x1 && y0 <= yScale(yValue(d)) && yScale(yValue(d)) <= y1
        ));

        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
      }}

      function brushEnd() {
        if (d3.event.sourceEvent.type != "end") {
          d3.select(this).call(brush.move, null);
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
      .attr("fill", d => "steelblue")
      .on("mouseover", function (d) {
        d3.select(this).classed("mouseover", true);
        let currentCount = 0; //Used to dynamically update tooltip height to match the data per country  
        let tooltipContent = "<strong>Country:</strong>" + " " + d.country + `<br><strong>Population: </strong> ${d3.format(",")(d.population)}`;

        if (d.infrastructureInvestment) {
          tooltipContent += `<br><strong>Infrastructure Investment: </strong> $${d3.format(",.2f")(d.infrastructureInvestment)}`;
   
          currentCount ++;
        }
        if (d.infrastructureMaintenance) {
          tooltipContent += `<br><strong>Maintenance Investment: </strong> $${d3.format(",.2f")(d.infrastructureMaintenance)}`;
          currentCount ++;
        }
        let currentHeight = 30 + (40 * currentCount); //Updates tooltip height


        tooltip
          .style("opacity", 1)
          .style("visibility", "visible")
          .style("height", currentHeight +"px")
          .html(tooltipContent);  // Display the tooltip content
      })
      .on("mousemove", function () {
        const mouseX = d3.event.pageX; // Mouse X position relative to the page
        const mouseY = d3.event.pageY; // Mouse Y position relative to the page
    
        tooltip
            .style("opacity", 1)
            .style("visibility", "visible")
            .style("left", `${mouseX + 10}px`) // Offset tooltip slightly to the right
            .style("top", `${mouseY - 20}px`); // Offset tooltip slightly above the mouse
    })
      .on("mouseout", function () {
        d3.select(this).classed("mouseover", false);
        tooltip.style("opacity", 0); // Hide tooltip
      })
      .on("click", function (d) {
        // Remove "selected" class from all points
        points.classed("selected", false);

        click = true;
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
      })
      .on("mouseup", function () {
       click = false;
      });

      // Add labels
      let labels = svg.append("g")
      .selectAll(".scatterLabel")
      .data(data);

      labels.exit().remove();

      labels = labels.enter()
      .append("text")
      .attr("class", "scatterLabel")
      .merge(labels)
      .attr("x", X)
      .attr("y", Y)
      .attr("dy", -20) 
      .attr("dx", 27) 
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "black")
      .text(d => d.country);

      // Add lines
      let lines = svg.append("g")
      .selectAll(".labelLine")
      .data(data);

      lines.exit().remove();

      lines = lines.enter()
      .append("line")
      .attr("class", "labelLine")
      .merge(lines)
      .attr("x1", X)
      .attr("y1", Y)
      .attr("x2", X)
      .attr("y2", Y)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", 0.4);

      // Apply force simulation to avoid overlapping labels
      d3.forceSimulation(data)
      .force("x", d3.forceX(d => X(d)).strength(1))
      .force("y", d3.forceY(d => Y(d)).strength(1))
      .force("collide", d3.forceCollide(36)) // Adjust the radius as needed
      .on("tick", () => {
        labels
          .attr("x", (d, i) => data[i].x)
          .attr("y", (d, i) => data[i].y);
        
        lines
          .attr("x1", (d, i) => X(d))
          .attr("y1", (d, i) => Y(d))
          .attr("x2", (d, i) => data[i].x + 20 + 7) // Adjust for dx
          .attr("y2", (d, i) => data[i].y - 20 + 5); // Adjust for dy
      });

      
      appendLegend(svg, data, sizeScale);
      
      //add legend to scatterplot for population size
      function appendLegend(svg, data, sizeScale){
        let legend = svg.append("g")
          .attr("class", "legend")
          .attr("transform",  "translate(" + (width + margin.right - 100) + ",30)")
          .style("pointer-events", "none");
        
        legend.append("text")
          .attr("x", -70)
          .attr("y", -25)
          .attr("class", "legendTitle")
          .style("fill", "black")
          .text("Population (Millions)");

        //get range of populations 
        let populationRanges = [
          [d3.max(data, d => d.population) / 2, d3.max(data, d => d.population)],
          [d3.mean(data, d => d.population), d3.max(data, d => d.population) / 2],
          [d3.min(data, d => d.population), d3.mean(data, d => d.population)],
          [0, d3.min(data, d => d.population)]
        ];
        
        //create circles in legend 
        legend.selectAll(".legendCircle")
          .data(populationRanges)
          .enter()
          .append("circle")
            .attr("class", "legendCircle")
            .attr("cx", 0)
            .attr("cy", (d, i) => i * (25 + sizeScale(d[1]))) 
            .attr("r", d => sizeScale(d[1]))
            .style("fill", "black");
        
        //add legend text 
        legend.selectAll(".legendText")
            .data(populationRanges)
            .enter()
            .append("text")
              .attr("x", 30)
              .attr("y", (d, i) => i * (27 + sizeScale(d[1]))) 
              .style("font-size", "12px")
              .style("fill", "black")
              .text(function(d) {
                // Format population as millions
                return `${d3.format(".0f")(d[0] / 1000000)} - ${d3.format(".0f")(d[1] / 1000000)}`;
            });
          
          //Add border to legend
          const bbox = legend.node().getBBox();
          legend.insert("rect", ":first-child")
             .attr("x", bbox.x - 10) // Add padding
             .attr("y", bbox.y - 10)
             .attr("width", bbox.width + 20)
             .attr("height", bbox.height + 20)
             //.attr("fill", "lightgray") // Background color
             .attr("stroke", "black") // Border color
             .attr("stroke-width", 2);
      }


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
