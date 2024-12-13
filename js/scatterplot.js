/* global D3 */

// Initialize a scatterplot. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function scatterplot() {

    // Based on Mike Bostock's margin convention
    // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 60
      },
      width = 600 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      xValue = d => d[0],
      yValue = d => d[1],
      xLabelText = "",
      yLabelText = "",
      yLabelOffsetPx = 0,
      xScale = d3.scaleLinear(),
      yScale = d3.scaleLinear(),
      ourBrush = null,
      selectableElements = d3.select(null),
      dispatcher;
  
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
        .domain([
          110,
          350
        ])
        .rangeRound([0, width]);
  
      yScale
        .domain([
          70,
          84
        ])
        .rangeRound([height, 0]);
  
      
      //creates Y axis
      let yAxis = svg.append("g")
          .call(d3.axisLeft(yScale));
      
      svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -margin.top) // Moves the label horizontally
      .attr("y", -margin.left) // Moves the label vertically
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Life Expectancy per State in " + currentYear);
          
    
      //creates X axis
    let xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisBottom(xScale));

    // X axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .text("Age-Adjusted Heart Disease Death Rate per State in "+currentYear);

      // Add the points
      let points = svg.append("g")
        .selectAll(".scatterPoint")
          .data(data);
  
      points.exit().remove();
      console.log(data);
      points = points.enter()
        .append("circle")
          .attr("class", "point scatterPoint")
        .merge(points)
          .attr("cx", X)
          .attr("cy", Y)
          .attr("r", 6)
          .attr("state", getState)
          .attr("opacity", 0.5) //make the points semi-transparent to prevent occlusion
          
      points.append("svg:title").text(getD);
      
      selectableElements = points;

    //create a legend
    let legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, 20)`);

    //data for the legend
    let legendData = [
        { color: "red", stroke: "red", label: "Selected" },
        { color: "blue", stroke: "blue", label: "Hovering Over" }
      ];
    
    // Add legend item
    legend.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`) // Space out items vertically
      .each(function(d) {
        //adds colors to the legend
        d3.select(this)
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 6) 
          .style("fill", d.color)
          .style("stroke",d.stroke)
          .style("stroke-width", 2);
         // Add labels
        d3.select(this)
          .append("text")
          .attr("x", 10) 
          .attr("y", 5) 
          .text(d.label)
          // .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
});

      
      svg.call(brush);

      // Highlight points when brushed
      function brush(g) {
        const brush = d3.brush() // Create a 2D interactive brush
          .on("start brush", highlight) // When the brush starts/continues do...
          .on("end", brushEnd) // When the brush ends do...
          .extent([
            [-margin.left, -margin.bottom],
            [width + margin.right, height + margin.top]
          ]);
          
        ourBrush = brush;
  
        g.call(brush); // Adds the brush to this element

  
        // Highlight the selected circles
        function highlight() {
          if (d3.event.selection === null) return;
          const [
            [x0, y0],
            [x1, y1]
          ] = d3.event.selection;
  
          // If within the bounds of the brush, select it
          points.classed("permaselected", d =>
            x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
          );



        }
        
        function brushEnd(){
          d3.selectAll("path").classed("selected", false);          //reset previously selected elements from scatterplot linking
          // We don't want infinite recursion
          if(d3.event.sourceEvent.type!="end"){
            d3.select(this).call(brush.move, null);

            for (let i=0; i<50; i++){                                //link brushing with map
              let point = points._groups[0][i];
              if (point.getAttribute("class")=="point scatterPoint permaselected"){
                let pointState = point.getAttribute("state");
                d3.selectAll("path").filter(function() {
                  return d3.select(this).attr("state") == pointState; // link to scatterplot
                }).classed("selected", true);
              }
            }
          }         
        }
      }
      /*
        // Highlight the selected circles
        function highlight() {
          if (d3.event.selection === null) return;
          const [
            [x0, y0],
            [x1, y1]
          ] = d3.event.selection;
  
          // If within the bounds of the brush, select it
          points.classed("selected", d =>
            x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
          );
  
          // Get the name of our dispatcher's event
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
  
          // Let other charts know about our selection
          dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
        }   
          */
        
  
  
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

    function getState(d){
      return d.state;
    }

    function getD(d){
      return d.state + ", x= " + d.x + ", y=" + d.y
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