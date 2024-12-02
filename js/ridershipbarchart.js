d3.csv("data/neighborhood_ridership.csv", function (error, data) {
    if (error) {
        console.error("Error loading the CSV file:", error);
        return;
    }

    console.log("Data loaded:", data);

    // Convert gated_entries to numeric values
    data.forEach(d => {
        d.gated_entries = +d.gated_entries; // Convert to number
    });

    // Set dimensions and margins for the SVG container
    let barWidth = 800;
    let barHeight = 400;
    let margin = { top: 20, right: 30, bottom: 120, left: 120 };

    // Create the SVG container
    let svg = d3.select("#interactive-chart")
        .append("svg")
        .attr("width", barWidth + margin.left + margin.right)
        .attr("height", barHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    let x = d3.scaleBand()
        .domain(data.map(d => d.Neighborhood))
        .range([0, barWidth])
        .padding(0.2);

    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gated_entries)])
        .range([barHeight, 0]);

    // Add horizontal grid lines
    svg.append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(y.ticks(5)) // Adjust the number of grid lines
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", barWidth)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0,${barHeight})`)
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
        .attr("height", d => barHeight - y(d.gated_entries))
        .attr("fill", "skyblue");

    // Add tooltip
    let tooltip = d3.select("body")
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
                .html(`Neighborhood: <strong>${event.Neighborhood}</strong><br>Ridership: <strong>${event.gated_entries.toLocaleString()}</strong>`)
                .style("display", "block");
                console.log("Tooltip HTML updated", tooltip.node()); // Debug tooltip element
        })
        .on("mousemove", (event) => {
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;
            const left = Math.min(event.pageX + 10, window.innerWidth - tooltipWidth - 10);
            const top = Math.min(event.pageY - 20, window.innerHeight - tooltipHeight - 10);
            tooltip.style("left", `${left}px`).style("top", `${top}px`);
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
            console.log("Tooltip hidden"); // Debugging
        });

    // Add X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", barWidth / 2)
        .attr("y", barHeight + 80)
        .text("Neighborhood")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    // Add Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -barHeight / 2)
        .attr("y", -80)
        .text("Total Ridership (in Millions)")
        .style("font-size", "16px")
        .style("font-weight", "bold");
});
