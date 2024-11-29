document.addEventListener('DOMContentLoaded', function () {
    // Raw data (population counts for each region and category)
    const rawData = [
        { region: "Allston", "0-17 years old": 740, "18-34 years old": 15405, "35+ years old": 3116 },
        { region: "Back Bay", "0-17 years old": 1169, "18-34 years old": 8398, "35+ years old": 8216 },
        { region: "Beacon Hill", "0-17 years old": 862, "18-34 years old": 4564, "35+ years old": 4222 },
        { region: "Brighton", "0-17 years old": 5275, "18-34 years old": 30631, "35+ years old": 19391 },
        { region: "Charlestown", "0-17 years old": 3974, "18-34 years old": 5789, "35+ years old": 10127 },
        { region: "Dorchester", "0-17 years old": 28122, "18-34 years old": 39249, "35+ years old": 59538 },
        { region: "Downtown", "0-17 years old": 1507, "18-34 years old": 8249, "35+ years old": 8550 },
        { region: "East Boston", "0-17 years old": 9176, "18-34 years old": 15775, "35+ years old": 22312 },
        { region: "Fenway", "0-17 years old": 699, "18-34 years old": 26568, "35+ years old": 6222 },
        { region: "Hyde Park", "0-17 years old": 8288, "18-34 years old": 8827, "35+ years old": 21809 },
        { region: "Jamaica Plain", "0-17 years old": 6621, "18-34 years old": 13960, "35+ years old": 20286 },
        { region: "Longwood", "0-17 years old": 51, "18-34 years old": 5172, "35+ years old": 128 },
        { region: "Mattapan", "0-17 years old": 6568, "18-34 years old": 6157, "35+ years old": 13934 },
        { region: "Mission Hill", "0-17 years old": 1485, "18-34 years old": 10023, "35+ years old": 5878 },
        { region: "North End", "0-17 years old": 509, "18-34 years old": 5227, "35+ years old": 3013 },
        { region: "Roslindale", "0-17 years old": 5979, "18-34 years old": 6865, "35+ years old": 17177 },
        { region: "Roxbury", "0-17 years old": 11846, "18-34 years old": 17728, "35+ years old": 24587 },
        { region: "South Boston", "0-17 years old": 4661, "18-34 years old": 17242, "35+ years old": 14869 },
        { region: "South Boston Waterfront", "0-17 years old": 189, "18-34 years old": 2081, "35+ years old": 2133 },
        { region: "South End", "0-17 years old": 3965, "18-34 years old": 11389, "35+ years old": 17217 },
        { region: "West End", "0-17 years old": 422, "18-34 years old": 2645, "35+ years old": 3552 },
        { region: "West Roxbury", "0-17 years old": 6895, "18-34 years old": 6381, "35+ years old": 20250 },
    ];

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

        
    // Tooltip div
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip") // Ensure it's styled properly
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // Keys for stacking
    const keys = ["0-17 years old", "18-34 years old", "35+ years old"];

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding(0.2).domain(["Selected Regions"]); // Single bar
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, 100]); // Fixed Y-Axis domain [0, 100]
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Add axes
    const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
    const yAxis = svg.append("g");

    // Function to aggregate and normalize data
    function aggregateData(selectedRegions) {
        if (selectedRegions.length === 0) return null;

        // Aggregate values
        const aggregated = keys.reduce((acc, key) => {
            acc[key] = selectedRegions.reduce(
                (sum, region) => sum + rawData.find(d => d.region === region)[key],
                0
            );
            return acc;
        }, {});

        // Calculate total population
        const totalPopulation = Object.values(aggregated).reduce((sum, value) => sum + value, 0);

        // Normalize to percentages
        return keys.map(key => ({
            key,
            percentage: (aggregated[key] / totalPopulation) * 100,
            breakdown: selectedRegions.map(region => ({
                region,
                population: rawData.find(d => d.region === region)[key],
            })),
        }));
    }

    // Function to update the chart
    function updateChart(selectedRegions) {

        // Aggregate and normalize data
        const aggregatedData = aggregateData(selectedRegions);
        if (!aggregatedData) {
            // If no regions are selected, clear the chart
            svg.selectAll(".layer").remove();
            xAxis.call(d3.axisBottom(xScale));
            yAxis.call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
            return;
        }

        // Stack data for single bar
        const stackedData = d3.stack().keys(keys)([aggregatedData.reduce((obj, d) => {
            obj[d.key] = d.percentage;
            return obj;
        }, {})]);

        // Update axes
        xAxis.call(d3.axisBottom(xScale));
        yAxis.call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));

        // Bind data and update bar
        const layers = svg.selectAll(".layer").data(stackedData);

        const newLayers = layers
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("fill", d => colorScale(d.key));

        layers.merge(newLayers)
            .each(function (layerData, layerIndex) {
                const layer = d3.select(this);

                const rects = layer.selectAll("rect").data(layerData);

                rects
                    .enter()
                    .append("rect")
                    .merge(rects)
                    .attr("x", () => xScale("Selected Regions"))
                    .attr("y", d => yScale(d[1]))
                    .attr("height", d => Math.max(0, yScale(d[0]) - yScale(d[1]))) // Prevent negative heights
                    .attr("width", xScale.bandwidth())
                    .on("mouseover", function (d, i, elements) {
                        // Show tooltip
                        const ageCategory = keys[layerIndex];
                        const breakdown = aggregatedData[layerIndex].breakdown;
                        const overallPercentage = aggregatedData[layerIndex].percentage.toFixed(2);

                        const tooltipContent = `
                            <strong>${ageCategory}</strong><br>
                            ${breakdown
                                .map(b => `${b.region}: ${b.population}`)
                                .join("<br>")}<br>
                            <strong>Overall: ${overallPercentage}%</strong>
                        `;

                        tooltip
                            .html(tooltipContent)
                            .style("visibility", "visible")
                            .style("top", `${d3.event.pageY + 10}px`)
                            .style("left", `${d3.event.pageX + 10}px`);
                    })
                    .on("mouseout", function () {
                        // Hide tooltip
                        tooltip.style("visibility", "hidden");
                    });

                rects.exit().remove();
            });

        layers.exit().remove();
    }

    // Create checkboxes for regions
    const regionChecklist = d3
        .select("#controls")
        .selectAll("div")
        .data(rawData.map(d => d.region))
        .enter()
        .append("div");

    regionChecklist
        .append("input")
        .attr("type", "checkbox")
        .attr("id", d => `checkbox-${d}`)
        .attr("value", d => d)
        .property("checked", true)
        .on("change", function () {
            const selectedRegions = regionChecklist
                .selectAll("input:checked")
                .nodes()
                .map(input => input.value);

            updateChart(selectedRegions);
        });

    regionChecklist
        .append("label")
        .attr("for", d => `checkbox-${d}`)
        .text(d => d);

    // Initial chart rendering with all regions
    updateChart(rawData.map(d => d.region));








    // Append a legend container group to the SVG
    const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(50, ${height + 30})`); // Position the legend below the chart

    // Bind the keys array to legend items
    const legendItems = legend
        .selectAll(".legend-item")
        .data(keys)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 120}, 0)`); // Adjust horizontal spacing

    // Append color rectangles for the legend
    legendItems
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    // Append text labels to the legend
    legendItems
        .append("text")
        .attr("x", 20) // Space the text from the rectangle
        .attr("y", 12) // Align text vertically with the rectangle
        .text(d => d)
        .style("font-size", "12px")
        .style("fill", "black");
});