function countryBarGraphs() {
    let margin = { top: 20, left: 100, right: 30, bottom: 50 },
        width = 750 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom; // Half the height of the scatterplot

    const dispatcher = d3.dispatch("selectionUpdated");

    function chart(selector, data, xValue, xLabel) {
        // Sort data by xValue
        data.sort((a, b) => xValue(a) - xValue(b));

        const svg = d3.select(selector)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .classed("svg-content", true);

        let chartGroup = svg.select("g");
        if (chartGroup.empty()) {
            chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
        }

        // Clear previous chart elements to avoid overlap
        chartGroup.selectAll("*").remove();

        // Define scales
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.country))
            .range([height, 0])
            .padding(0.1);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, width]);

        // Create axes
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => {
                if (d >= 1e9) return (d / 1e9).toFixed(1) + "B";
                if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
                if (d >= 1e3) return (d / 1e3).toFixed(1) + "K";
                return d;
            })); // Custom format for large numbers

        chartGroup.append("g")
            .call(d3.axisLeft(yScale));

        // Create bars
        const bars = chartGroup.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.country))
            .attr("width", d => xScale(xValue(d)))
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue")
            .on("click", function(event, d) {
                // Toggle selection on click
                const isSelected = d3.select(this).classed("selected");
                d3.select(this).classed("selected", !isSelected)
                    .attr("fill", !isSelected ? "green" : "steelblue");

                // Dispatch the selectionUpdated event with the selected data
                const selectedData = chartGroup.selectAll(".bar.selected").data();
                dispatcher.call("selectionUpdated", this, selectedData);

            });

        // Add x-axis label
        chartGroup.append("text")
            .attr("class", "axisLabel")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text(xLabel);

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

        // Select an element if its datum was selected
        d3.selectAll('.bar').classed("selected", function(d) {
            const isSelected = selectedData.includes(d);
            d3.select(this).attr("fill", isSelected ? "green" : "steelblue");
            return isSelected;
        });
    };

    return chart;
}