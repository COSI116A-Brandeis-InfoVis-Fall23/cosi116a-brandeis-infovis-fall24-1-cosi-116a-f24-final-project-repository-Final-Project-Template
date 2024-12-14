// Load the CSV data
d3.csv("data/neighborhood_ridership.csv", function(data) {
    console.log("Data loaded:", data);

    // Convert gated_entries to numeric values
    data.forEach(d => {
        d.gated_entries = +d.gated_entries;
    });

    // Set up chart dimensions and margins
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 120, left: 120 };

    // Create the SVG container
    const svg = d3.select("#ridership-chart")
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
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add Y-axis
    svg.append("g").call(d3.axisLeft(y));

    // Tooltip setup
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

    // Add bars to the bar chart
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Neighborhood))
        .attr("y", d => d.gated_entries === 0 ? height : y(d.gated_entries))  // Handle 0 ridership data differently
        .attr("width", x.bandwidth())
        .attr("height", d => d.gated_entries === 0 ? 5 : height - y(d.gated_entries))  // Mini bar for 0 ridership
        .attr("fill", d => d.gated_entries === 0 ? "#B0B0B0" : "skyblue")  // Darker grey for missing data

        // Add interactivity
        .on("mouseover", function(d) {
            tooltip
                .html(d.gated_entries === 0 ? `<strong>${d.Neighborhood}</strong><br>No ridership data available` 
                        : `<strong>${d.Neighborhood}</strong><br>Ridership: <strong>${d.gated_entries.toLocaleString()}</strong>`)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 20) + "px")
                .style("display", "block");
        })
        .on("mousemove", function() {
            tooltip
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    // Add X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 80)
        .text("Neighborhood")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    // Add Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -height / 2)
        .attr("y", -80)
        .text("Total Ridership (in Millions)")
        .style("font-size", "16px")
        .style("font-weight", "bold");
});
