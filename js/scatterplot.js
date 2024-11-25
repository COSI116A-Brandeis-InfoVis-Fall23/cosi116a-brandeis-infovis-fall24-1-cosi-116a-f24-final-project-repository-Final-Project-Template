
    // Sample JSON Data
    const data = [
        {"x": 30, "y": 30},
        {"x": 50, "y": 50},
        {"x": 70, "y": 90},
        {"x": 100, "y": 120},
        {"x": 150, "y": 80},
        {"x": 180, "y": 150},
        {"x": 200, "y": 250},
        {"x": 250, "y": 200},
        {"x": 300, "y": 300}
    ];

    // Set up the SVG container
    const svg = d3.select("#scatterPlot");

    // Set up scales for the x and y axes
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x)])  // The range of data for x axis
        .range([0, 800]);  // The pixel range of the svg width

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])  // The range of data for y axis
        .range([600, 0]);  // The pixel range of the svg height (inverted because SVG Y axis grows downwards)

    // Add circles to represent data points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))   // Positioning the circle on the x-axis
        .attr("cy", d => yScale(d.y))   // Positioning the circle on the y-axis
        .attr("r", 5);                  // Set the radius of the circles

    // Optional: Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(0, 600)")  // Move the axis to the bottom of the SVG
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(0, 0)")  // Move the axis to the left side of the SVG
        .call(yAxis);
