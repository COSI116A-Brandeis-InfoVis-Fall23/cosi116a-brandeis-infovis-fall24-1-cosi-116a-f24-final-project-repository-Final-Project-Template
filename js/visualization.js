(() => {
    d3.json("data/data.json", (error, data) => {
        if (error) {
            console.error("Error loading data:", error);
            return;
        }

        const dispatcherString = "selectionUpdated"; // Dispatcher name for interaction

        // Wrapper for the stacked line chart
        function stackedLineChartWrapper() {
            let xLabelText = "YEAR",
                yLabelText = "Federal Expenditure (% of Total)",
                chartTitle = "Percentage of Federal Spending Categories from 1964 to 2017",
                dispatcher = d3.dispatch(dispatcherString);

            function chart(selector, data) {
                drawStackedLineChart(selector, data, dispatcher); // Use your chart function

                const svg = d3.select(selector).select("svg");
                const width = +svg.attr("width");
                const height = +svg.attr("height");
                const margin = { top: 40, right: 450, bottom: 60, left: 70 };

                // Append title and labels
                svg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", margin.left + width / 2 - 250)
                    .attr("y", margin.top / 2)
                    .attr("text-anchor", "middle")
                    .style("font-size", "16px")
                    .text(chartTitle);

                svg.append("text")
                    .attr("class", "axis-label")
                    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
                    .attr("y", height - 1)
                    .attr("text-anchor", "middle")
                    .text(xLabelText);

                svg.append("text")
                    .attr("class", "axis-label")
                    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
                    .attr("y", 15)
                    .attr("transform", "rotate(-90)")
                    .attr("text-anchor", "middle")
                    .text(yLabelText);

                return chart;
            }

            chart.title = function (_) {
                if (!arguments.length) return chartTitle;
                chartTitle = _;
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

            chart.selectionDispatcher = function (_) {
                if (!arguments.length) return dispatcher;
                dispatcher = _;
                return chart;
            };

            return chart;
        }

        // Initialize the stacked line chart
        let stackedChart = stackedLineChartWrapper()
            .xLabel("YEAR")
            .yLabel("Federal Expenditure (% of Total)")
            .title("Percentage of Federal Spending Categories from 1964 to 2017")
            .selectionDispatcher(d3.dispatch(dispatcherString)) // Keep dispatcher
            ("#stacked-linechart", data);

        // Add a title to the table
        d3.select("#tablet")
            .insert("h3", ":first-child")
            .attr("class", "table-title")
            .style("text-align", "center")
            .text("Federal Spending (%) in Selected Years");

        // Initialize the table
        let tableData = drawTable("#tablet", data, d3.dispatch(dispatcherString)); // Pass dispatcher

        // Connect the dispatcher for interaction
        stackedChart.selectionDispatcher().on(dispatcherString, function (selectedYears) {
            const filteredData = data.filter(d => selectedYears.includes(d.year));
            tableData.updateSelection(filteredData); // Update the table with filtered data
        });
    });
})();
