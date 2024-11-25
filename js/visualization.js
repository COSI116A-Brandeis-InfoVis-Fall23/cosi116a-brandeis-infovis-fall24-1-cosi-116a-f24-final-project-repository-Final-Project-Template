(() => {
  // Load the data from JSON
  d3.json("data/data.json", (error, data) => {
      if (error) {
          console.error("Error loading data:", error);
          return;
      }

      // Event dispatcher for brushing and linking
      const dispatchString = "selectionUpdated";

      // Reusable wrapper for stacked line chart
      function stackedLineChartWrapper() {
          let xLabelText = "X Axis",
              yLabelText = "Y Axis",
              dispatcher = d3.dispatch(dispatchString);

          function chart(selector, data) {
              
              drawStackedLineChart(selector, data);

              // Add labels to the SVG
              const svg = d3.select(selector).select("svg");
              const width = +svg.attr("width");
              const height = +svg.attr("height");
              const margin = { top: 40, right: 450, bottom: 60, left: 70 };

              // Add chart title
              svg.append("text")
              .attr("class", "chart-title")
              .attr("x", margin.left+width / 2-250) // Center the title
              .attr("y", margin.top / 2) // Position above the chart
              .attr("text-anchor", "middle")
              .style("font-size", "16px")
              .text(chartTitle);

              // Add X-axis label
              svg.append("text")
                  .attr("class", "axis-label")
                  .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
                  .attr("y", height - 1) // Adjust below the X-axis
                  .attr("text-anchor", "middle")
                  .text(xLabelText);

              // Add Y-axis label
              svg.append("text")
                  .attr("class", "axis-label")
                  .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
                  .attr("y", 15) // Adjust to the left of the Y-axis
                  .attr("transform", "rotate(-90)")
                  .attr("text-anchor", "middle")
                  .text(yLabelText);

              return chart;
          }

          chart.title=function(_){
            if(!arguments.length) return chartTitle;
            chartTitle=_;
            return chart;
          }

          // Methods for setting labels and dispatcher
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

          chart.selectionDispatcher = function (_) {
              if (!arguments.length) return dispatcher;
              dispatcher = _;
              return chart;
          };

          return chart;
      }

      // Render the stacked line chart with axis labels
      let stackedChart = stackedLineChartWrapper()
          .xLabel("YEAR")
          .yLabel("Federal Expenditure (% of Total)")
          .title("Percentage of Federal Spending Categories from 1964 to 2017")
          .selectionDispatcher(d3.dispatch(dispatchString))
          ("#stacked-linechart", data);
      
          d3.select("#tablet")
            .insert("h3", ":first-child")
            .attr("class", "table-title")
            .style("text-align", "center")
            .text("Federal Spending (%) in Selected Years");

      // Add table rendering logic
      let tableData = drawTable("#tablet", data);
      tableData.setDispatcher(d3.dispatch(dispatchString));

      // Linking logic example
      stackedChart.selectionDispatcher().on(dispatchString, function (selectedData) {
          tableData.updateSelection(selectedData);
      });
  });
})();







