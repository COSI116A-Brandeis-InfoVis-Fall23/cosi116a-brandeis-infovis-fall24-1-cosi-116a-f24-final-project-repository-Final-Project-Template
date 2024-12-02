// Load the CSV data
d3.csv("data/neighborhood_ridership.csv").then(data => {
    console.log("Data loaded:", data);

    // Convert gated_entries to numeric values
    data.forEach(d => {
        d.gated_entries = +d.gated_entries;
    });

    // Set dimensions and margins for the SVG container
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 120, left: 120 };

    // Create the SVG container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.Neighborhood))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gated_entries)])
        .range([height, 0]);

    // Add horizontal grid lines
    svg.append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(y.ticks()) // Use the y-axis tick values for grid lines
        .enter()
        .append("line")
        .attr("x1", 0) // Start of the line (left edge)
        .attr("x2", width) // End of the line (right edge)
        .attr("y1", d => y(d)) // Vertical position for the line
        .attr("y2", d => y(d)) // Vertical position for the line
        .attr("stroke", "#ccc") // Light gray color
        .attr("stroke-width", 1) // Thin stroke
        .attr("stroke-dasharray", "4 4"); // Dashed line style

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add Y-axis
    svg.append("g").call(d3.axisLeft(y));

    // Add bars to the bar chart
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Neighborhood))
        .attr("y", d => y(d.gated_entries))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.gated_entries))
        .attr("fill", "skyblue");

    // Add tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("display", "none")
        .style("pointer-events", "none");

    svg.selectAll("rect")
        .on("mouseover", (event, d) => {
            tooltip
                .html(`Neighborhood: <strong>${d.Neighborhood}</strong><br>Ridership: <strong>${d.gated_entries.toLocaleString()}</strong>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("display", "block");
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // Add X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 80) // Positioned lower to avoid overlap
        .text("Neighborhood")
        .style("font-size", "16px") // Increased font size
        .style("font-weight", "bold");

    // Add Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`) // Rotate the text for the Y-axis
        .attr("x", -height / 2) // Center along the Y-axis
        .attr("y", -80) // Positioned further left to avoid overlap
        .text("Total Ridership (in Millions)")
        .style("font-size", "16px") // Increased font size
        .style("font-weight", "bold");
});
