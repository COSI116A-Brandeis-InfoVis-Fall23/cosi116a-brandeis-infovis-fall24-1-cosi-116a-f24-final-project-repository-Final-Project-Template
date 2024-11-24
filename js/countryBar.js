function countryBar() {
    let margin = { top: 20, left: 50, right: 30, bottom: 50 },
        width = 500 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    function chart(selector, data) {
        const svg = d3.select(selector)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .classed("svg-content", true);

        let chartGroup = svg.select("g");
        if (chartGroup.empty()) {
            chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
        }

        // Clear previous chart elements to avoid overlap when a new country is selected
        chartGroup.selectAll("*").remove();

        // Assuming data is an array with one element for the selected country
        const countryData = data[0];  // Only using the first data element as we are displaying data for a single country

        // Calculate the maintenance percentage
        const maintenancePercentage = countryData.infrastructureMaintenance / countryData.infrastructureInvestment;
        const otherPercentage = 1 - maintenancePercentage;

        // Create the horizontal bar for maintenance (orange)
        chartGroup.append("rect")
            .attr("x", 0)
            .attr("y", height / 4)  // Position it in the middle of the container
            .attr("width", width * maintenancePercentage)  // Width proportional to maintenance spending
            .attr("height", height / 2)  // Make the bar a bit thicker for better visibility
            .attr("fill", "orange");

        // Create the horizontal bar for the other spending (blue)
        chartGroup.append("rect")
            .attr("x", width * maintenancePercentage)
            .attr("y", height / 4)
            .attr("width", width * otherPercentage)  // The remaining width for other spending
            .attr("height", height / 2)
            .attr("fill", "blue");

        // Add the country name above the bar
        chartGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 4 - 10)  // Position the text above the bar
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .text(countryData.country + " % of Infrastructure Spending on Maintenance");

        // Title for maintenance section
        chartGroup.append("text")
            .attr("x", width * maintenancePercentage / 2)
            .attr("y", height / 1 + 10)  // Position the text below the bar
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .text("Maintenance Spending");

        // Add the percentage text for the maintenance section (orange)
        chartGroup.append("text")
            .attr("x", width * maintenancePercentage / 2)  // Center the text in the maintenance section
            .attr("y", height / 3 + height / 3)  // Position it in the middle of the bar
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "white")
            .text(`${(maintenancePercentage * 100).toFixed(1)}%`);

        // Add the percentage text for the other spending section (blue)
        chartGroup.append("text")
            .attr("x", width * (maintenancePercentage + otherPercentage / 2))  // Center the text in the other section
            .attr("y", height / 3 + height / 3)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "white")
            .text(`${(otherPercentage * 100).toFixed(1)}%`);

        // Add the percentage text for the other section (blue)
        chartGroup.append("text")
            .attr("x", width * (maintenancePercentage + otherPercentage / 2))
            .attr("y", height / 1 + 10)  // Position the text below the bar
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .text("Other");

        return chart;
    }

    return chart;
}
