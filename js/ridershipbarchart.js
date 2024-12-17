// Load the CSV data
d3.csv("data/neighborhood_ridership.csv", function(data) {
    // Convert gated_entries to numeric values
    data.forEach(d => {
        d.gated_entries = +d.gated_entries; // Parse 'gated_entries' as numeric values
    });

    // Set up chart dimensions and margins
    const width = 800;  // Width of the chart (excluding margins)
    const height = 400; // Height of the chart (excluding margins)
    const margin = { top: 20, right: 30, bottom: 160, left: 100 }; // Margins for the chart container

    // Create the SVG container and append it to the #ridership-chart div
    const svg = d3.select("#ridership-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right) // Total width including margins
        .attr("height", height + margin.top + margin.bottom) // Total height including margins
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`); // Shift SVG group to respect margins

    // Set up the scales for the X and Y axes
    const x = d3.scaleBand()
        .domain(data.map(d => d.Neighborhood)) // Map neighborhoods to x-axis
        .range([0, width]) // Scale x-axis to the chart width
        .padding(0.2); // Add padding between bars

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gated_entries)]) // Map gated_entries values to y-axis
        .range([height, 0]); // Invert y-axis so 0 is at the bottom

    // Add horizontal grid lines to improve readability
    svg.append("g")
        .attr("class", "grid") // Apply class for styling
        .selectAll("line")
        .data(y.ticks()) // Create grid lines at each tick position
        .enter()
        .append("line")
        .attr("x1", 0) // Grid line starts at the left edge
        .attr("x2", width) // Grid line ends at the right edge
        .attr("y1", d => y(d)) // Vertical position of grid line
        .attr("y2", d => y(d)) // Same position as y1
        .attr("stroke", "#ccc") // Light gray grid lines
        .attr("stroke-width", 1) // Thin grid lines
        .attr("stroke-dasharray", "4 4"); // Dashed line styling

    // Add X-axis with neighborhood names
    svg.append("g")
        .attr("transform", `translate(0,${height})`) // Position X-axis at the bottom of the chart
        .call(d3.axisBottom(x)) // Generate X-axis using the scaleBand 'x'
        .selectAll("text") // Style the axis labels
        .style("font-size", "20px") // Set font size
        .attr("transform", "rotate(-45)") // Rotate labels for better fit
        .style("text-anchor", "end"); // Align rotated text to the end

    // Add Y-axis with tick formatting for values in millions
    svg.append("g")
        .call(d3.axisLeft(y) // Generate Y-axis using the scaleLinear 'y'
            .ticks(11) // Set the number of ticks on the Y-axis
            .tickFormat(d => d / 1_000_000) // Format tick values to display in millions
        )
        .selectAll("text") // Style the axis labels
        .style("font-size", "20px"); // Set font size

    // Tooltip setup for interactivity
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip") // Apply tooltip styling
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("display", "none") // Hide tooltip initially
        .style("pointer-events", "none"); // Tooltip does not block mouse events

    // Add bars to the bar chart
    svg.selectAll("rect")
        .data(data) // Bind the data to the bars
        .enter()
        .append("rect")
        .attr("x", d => x(d.Neighborhood)) // X position of the bar based on neighborhood
        .attr("y", d => d.gated_entries === 0 ? height : y(d.gated_entries)) // Position bars; handle 0 values
        .attr("width", x.bandwidth()) // Width of each bar based on scaleBand
        .attr("height", d => d.gated_entries === 0 ? 5 : height - y(d.gated_entries)) // Height of the bar; handle 0 values
        .attr("fill", d => d.gated_entries === 0 ? "#B0B0B0" : "skyblue") // Color bars; gray for missing data

        // Add tooltip interactivity
        .on("mouseover", function(d) { // Show tooltip on mouseover
            tooltip
                .html(d.gated_entries === 0 
                    ? `<strong>${d.Neighborhood}</strong><br>No ridership data available`
                    : `<strong>${d.Neighborhood}</strong><br>Gated Entries: <strong>${d.gated_entries.toLocaleString()}</strong>`)
                .style("left", (d3.event.pageX + 10) + "px") // Position tooltip
                .style("top", (d3.event.pageY - 20) + "px")
                .style("display", "block"); // Display tooltip
        })
        .on("mousemove", function() { // Adjust tooltip position on mousemove
            tooltip
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
        })
        .on("mouseout", function() { // Hide tooltip on mouseout
            tooltip.style("display", "none");
        });

    // Add X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2) // Center the label horizontally
        .attr("y", height + 140) // Position label below the axis
        .text("Neighborhood") // Text content for X-axis label
        .style("font-size", "20px")
        .style("font-weight", "bold");

    // Add Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`) // Rotate label for vertical axis
        .attr("x", -height / 2) // Center the label vertically
        .attr("y", -60) // Position label to the left of the axis
        .text("Total Gated Entries (in Millions) (2023)") // Text content for Y-axis label
        .style("font-size", "20px")
        .style("font-weight", "bold");
});