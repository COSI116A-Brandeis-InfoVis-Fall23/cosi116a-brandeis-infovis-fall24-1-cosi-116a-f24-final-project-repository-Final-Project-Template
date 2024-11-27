document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM is fully loaded and parsed!");
    var svg = d3.select("svg");
    var path = d3.geoPath();
    var colorScale;
  
    // State name to FIPS code mapping
    const stateNameToFips = {
        'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05', 'California': '06',
        'Colorado': '08', 'Connecticut': '09', 'Delaware': '10', 'Florida': '12', 'Georgia': '13',
        'Hawaii': '15', 'Idaho': '16', 'Illinois': '17', 'Indiana': '18', 'Iowa': '19',
        'Kansas': '20', 'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
        'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28', 'Missouri': '29',
        'Montana': '30', 'Nebraska': '31', 'Nevada': '32', 'New Hampshire': '33', 'New Jersey': '34',
        'New Mexico': '35', 'New York': '36', 'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39',
        'Oklahoma': '40', 'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
        'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49', 'Vermont': '50',
        'Virginia': '51', 'Washington': '53', 'West Virginia': '54', 'Wisconsin': '55', 'Wyoming': '56'
    };
  
    // Create reverse mapping (FIPS to state name)
    const fipsToStateName = {};
    for (let state in stateNameToFips) {
        fipsToStateName[stateNameToFips[state]] = state;
    }
  
    // Load both files using d3.v4 syntax
    d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .defer(d3.csv, "data/updated_data.csv")
        .await(function(error, us, csvData) {
            if (error) {
                console.error("Error loading data:", error);
                return;
            }
  
            // Process the data
            var dataMap = {};
            csvData.forEach(d => {
                const fips = stateNameToFips[d.State];
                if (!fips) {
                    console.warn(`Skipping: ${d.State}`);
                    return;
                }
  
                if (!dataMap[fips]) dataMap[fips] = {};
                dataMap[fips][d.Year] = {
                    mortgage: +d["Mortgage/Income (%)"] / 100,
                    rent: +d["Rent/Income (%)"] / 100,
                    income: +d["Median Income"]
                };
            });
  
            // Draw the base map
            svg.append("g")
                .attr("class", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "state-path")
                .attr("fill", "#ccc")
                .attr("stroke", "#fff");
  
            // Draw state borders
            svg.append("path")
                .attr("class", "state-borders")
                .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)))
                .attr("fill", "none")
                .attr("stroke", "#fff");
  
            function createDetailedTooltip(d, selectedYear) {
                var stateData = dataMap[d.id] && dataMap[d.id][selectedYear];
                
                if (!stateData) return '';
  
                const stateName = fipsToStateName[d.id] || 'Unknown State';
                const mortgageValue = (stateData.mortgage * 100).toFixed(1);
                const rentValue = (stateData.rent * 100).toFixed(1);
                const incomeValue = Math.round(stateData.income).toLocaleString();
                
                return `
                   <div class="tooltip-container">
            <div class="tooltip-state-header">
                <strong class="tooltip-state-name">${stateName}</strong>
                <span class="tooltip-year">${selectedYear}</span>
            </div>
            <div class="tooltip-state-details">
                <div class="tooltip-metric-row">
                    <span class="tooltip-metric-label">Median Income:</span>
                    <span class="tooltip-metric-value">$${stateData.income.toLocaleString()}</span>
                </div>
                <div class="tooltip-metric-row">
                    <span class="tooltip-metric-label">Mortgage Burden:</span>
                    <span class="tooltip-metric-value">${(stateData.mortgage * 100).toFixed(1)}%</span>
                </div>
                <div class="tooltip-metric-row">
                    <span class="tooltip-metric-label">Rent Burden:</span>
                    <span class="tooltip-metric-value">${(stateData.rent * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>`
                ;
            }
  
            function updateMap() {
                var selectedYear = d3.select("#yearSelect").property("value");
                var selectedMetric = d3.select("#costBurden").property("value");
                
                // Get valid values for the selected metric and year
                var values = [];
                for (let fips in dataMap) {
                    if (dataMap[fips][selectedYear] && dataMap[fips][selectedYear][selectedMetric] != null) {
                        values.push(dataMap[fips][selectedYear][selectedMetric]);
                    }
                }
  
                if (values.length === 0) {
                    console.warn("No data for selected year and metric");
                    return;
                }
  
                var minValue = d3.min(values);
                var maxValue = d3.max(values);
  
                // Create color scale based on metric
                if (selectedMetric === 'income') {
                    colorScale = d3.scaleLinear()
                        .domain([minValue, maxValue])
                        .range(["#f7fbff", "#084594"]); // Light to dark blue
                } else {
                    colorScale = d3.scaleLinear()
                        .domain([minValue, maxValue])
                        .range(["#fcfafd", "#54278f"]); // Light to dark purple
                }
  
                // Update colors
                svg.selectAll(".state-path")
                    .transition()
                    .duration(750)
                    .style("fill", function(d) {
                        if (!dataMap[d.id] || !dataMap[d.id][selectedYear]) {
                            return "#ccc";
                        }
                        var value = dataMap[d.id][selectedYear][selectedMetric];
                        return value != null ? colorScale(value) : "#ccc";
                    });
  
                // Update tooltips
                svg.selectAll(".state-path")
                    .on("mouseover", function(d) {
                        d3.select(this)
                            .style("opacity", 0.8);
  
                        d3.select("#tooltip")
                            .style("opacity", 1)
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 10) + "px")
                            .html(createDetailedTooltip(d, selectedYear));
                    })
                    .on("mousemove", function() {
                        d3.select("#tooltip")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 10) + "px");
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .style("opacity", 1);
                        d3.select("#tooltip")
                            .style("opacity", 0);
                    });
            }
  
            // Add event listeners
            d3.select("#yearSelect").on("change", updateMap);
            d3.select("#costBurden").on("change", updateMap);
  
            // Initial render
            updateMap();
            renderBarAndLineCharts();
        });
        
        // Add tooltip div if it doesn't exist
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none");
  
        function renderBarAndLineCharts() {

            const dataPath = "data/bar_line_chart_data.csv";
            const margin = { top: 20, right: 30, bottom: 20, left: 30 };
            const width = 550 - margin.left - margin.right;
            const height = 280 - margin.top - margin.bottom;

            // Fixed y-axis range for both charts (10% to 40%)
            const yDomain = [15, 35];

            const color = d3.scaleOrdinal()
                .domain(['Mortgage', 'Rent'])
                .range(['#3498db', '#34495e']);  // Blue for Mortgage, Dark Blue for Rent

            d3.csv(dataPath, function(error, rawData) {
                if (error) {
                    console.error("Error loading CSV data:", error);
                    return;
                }

                // Format data
                const data = rawData.map(d => ({
                    Year: d.Year,
                    Mortgage: +d.Mortgage,
                    Rent: +d.Rent,
                    Income: +d.Income,
                }));

                // === Bar Chart Setup ===
                const xBar = d3.scaleBand()
                    .domain(data.map(d => d.Year))
                    .range([0, width])
                    .padding(0.2);

                const yBar = d3.scaleLinear()
                    .domain(yDomain)  // Set fixed range 10-40%
                    .range([height, 0]);

                const barSvg = d3.select("#bar-chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

                // Add title with updated styling
                barSvg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", width / 2)
                    .attr("y", -margin.top/2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .text("Housing Cost Burden by Year");

                // Draw bars
                ['Mortgage', 'Rent'].forEach((key, i) => {
                    barSvg.selectAll(`.bar-${key}`)
                        .data(data)
                        .enter().append("rect")
                        .attr("class", `bar-${key}`)
                        .attr("x", d => xBar(d.Year) + (i * xBar.bandwidth() / 2))
                        .attr("y", d => yBar(d[key]))
                        .attr("width", xBar.bandwidth() / 2)
                        .attr("height", d => height - yBar(d[key]))
                        .attr("fill", color(key))
                        .attr("opacity", 0.8)  // Slightly transparent
                        .on("mouseover", function() {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr("opacity", 1)
                                .attr("stroke", "#2c3e50")
                                .attr("stroke-width", 1);
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr("opacity", 0.8)
                                .attr("stroke-width", 0);
                        });
                });

                // Add legend
                const legend = barSvg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${width - 50}, -10)`);

                ['Mortgage', 'Rent'].forEach((key, i) => {
                    const legendRow = legend.append("g")
                        .attr("transform", `translate(0, ${i * 20})`);
                    
                    legendRow.append("rect")
                        .attr("width", 15)
                        .attr("height", 15)
                        .attr("fill", color(key))
                        .attr("opacity", 0.8);
                    
                    legendRow.append("text")
                        .attr("x", 20)
                        .attr("y", 12)
                        .style("font-size", "12px")
                        .text(key);
                });

                // Add axes
                barSvg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(xBar)
                        .tickValues(xBar.domain().filter((_, i) => i % 2 === 0))); // Show every other year

                barSvg.append("g")
                    .call(d3.axisLeft(yBar)
                        .tickFormat(d => `${d}%`)
                        .ticks(6)); // Adjust number of ticks

                // === Scatter/Line Chart Setup ===
                const xLine = d3.scaleBand()
                    .domain(data.map(d => d.Year))
                    .range([0, width])
                    .padding(0.2);

                const yLine = d3.scaleLinear()
                    .domain(yDomain)  // Set fixed range 10-40%
                    .range([height, 0]);

                const scatterSvg = d3.select("#line-chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);


                // Add title for line chart
                scatterSvg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", width / 2)
                    .attr("y", -margin.top/2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .text("Housing Cost Burden Trends");

                // Add legend for line chart
                const lineLegend = scatterSvg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${width - 50}, -10)`);

                ['Mortgage', 'Rent'].forEach((key, i) => {
                    const legendRow = lineLegend.append("g")
                        .attr("transform", `translate(0, ${i * 20})`);
                    
                    legendRow.append("circle")  // Use circle instead of rect to match the dots
                        .attr("cx", 6)  // Half of the circle size
                        .attr("cy", 6)
                        .attr("r", 6)
                        .attr("fill", color(key))
                        .attr("opacity", 0.85);
                    
                    legendRow.append("text")
                        .attr("x", 20)
                        .attr("y", 9)
                        .style("font-size", "12px")
                        .style("font-weight", "500")
                        .text(key);
                });

                // Add axes
                scatterSvg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(xLine)
                        .tickValues(xLine.domain().filter((_, i) => i % 2 === 0))); // Show every other year

                scatterSvg.append("g")
                    .call(d3.axisLeft(yLine)
                        .tickFormat(d => `${d}%`)
                        .ticks(6));

                // Add mouseout handler to scatter plot area
                scatterSvg.append("rect")
                    .attr("class", "mouse-capture")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .on("mouseout", function(event) {
                        const e = event || window.event;
                        const relatedTarget = e.relatedTarget || e.toElement;
                        if (!relatedTarget || relatedTarget.tagName === "svg") {
                            // Clear brush when mouse leaves scatter plot
                            barSvg.select(".brush").call(brush.move, null);
                            updateScatterPlot(data);
                        }
                    });

                // Helper function to get year from x position
                function getYearFromX(xPos) {
                    const bandwidth = xBar.bandwidth();
                    const step = xBar.step();
                    const index = Math.floor(xPos / step);
                    return xBar.domain()[index];
                }

                // Create brush
                const brush = d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("brush end", brushed);

                function brushed() {
                    // Get brush selection
                    const selection = d3.event.selection;
                    if (!selection) {
                        updateScatterPlot(data);
                        return;
                    }

                    // Convert brush coordinates to years
                    const [startX, endX] = selection;
                    const startYear = getYearFromX(startX);
                    const endYear = getYearFromX(endX);

                    // Filter data for selected years
                    const filteredData = data.filter(d => {
                        return d.Year >= startYear && d.Year <= endYear;
                    });

                    // Update scatter plot
                    updateScatterPlot(filteredData);
                }

                function updateScatterPlot(filteredData) {
                    const selectedYears = filteredData.map(d => d.Year);
                    const isFiltered = filteredData.length !== data.length;

                    ['Mortgage', 'Rent'].forEach(metric => {
                        // Remove existing dots and lines
                        scatterSvg.selectAll(`.dot-${metric}`).remove();
                        scatterSvg.selectAll(`.line-${metric}`).remove();

                        // Add dots
                        scatterSvg.selectAll(`.dot-${metric}`)
                            .data(data)
                            .enter().append("circle")
                            .attr("class", `dot-${metric}`)
                            .attr("cx", d => xLine(d.Year) + xLine.bandwidth() / 2)
                            .attr("cy", d => yLine(d[metric]))
                            .attr("r", 5)
                            .attr("fill", color(metric))
                            .attr("opacity", d => selectedYears.includes(d.Year) ? 1 : 0.2)
                            .attr("stroke", "white")
                            .attr("stroke-width", 1.5)
                            .on("mouseover", function(d) {
                                // Highlight dot
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("r", 7);

                                // Highlight legend item
                                lineLegend.selectAll("g")
                                    .filter(g => g === metric)
                                    .style("opacity", 1);

                                // Show tooltip
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                tooltip.html(`${metric}: ${d[metric]}%<br/>Year: ${d.Year}`)
                                    .style("left", (d3.event.pageX + 5) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                            })
                            .on("mouseout", function() {
                                // Reset dot
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("r", 5);

                                // Reset legend
                                lineLegend.selectAll("g")
                                    .style("opacity", 0.85);

                                // Hide tooltip
                                tooltip.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                            });

                        // Add connecting lines only when filtered
                        if (isFiltered && filteredData.length > 0) {
                            const line = d3.line()
                                .x(d => xLine(d.Year) + xLine.bandwidth() / 2)
                                .y(d => yLine(d[metric]));

                            scatterSvg.append("path")
                                .datum(filteredData)
                                .attr("class", `line-${metric}`)
                                .attr("fill", "none")
                                .attr("stroke", color(metric))
                                .attr("stroke-width", 2)
                                .attr("opacity", 0.7)
                                .attr("d", line);
                        }
                    });

                    // Update x-axis to match bar chart format
                    scatterSvg.selectAll(".x-axis").remove();
                    scatterSvg.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0, ${height})`)
                        .call(d3.axisBottom(xLine)
                            .tickValues(xLine.domain().filter((_, i) => i % 2 === 0))); // Show every other year

                    // Update y-axis
                    scatterSvg.selectAll(".y-axis").remove();
                    scatterSvg.append("g")
                        .attr("class", "y-axis")
                        .call(d3.axisLeft(yLine)
                            .tickFormat(d => `${d}%`)
                            .ticks(6));

                    // Make sure not to remove the title when updating
                    scatterSvg.selectAll(".chart-title").raise();

                    // Make sure legend stays on top
                    scatterSvg.select(".legend").raise();
                }

                // Add brush to bar chart
                barSvg.append("g")
                    .attr("class", "brush")
                    .call(brush);

                // Initial render showing all dots without lines
                updateScatterPlot(data);
            });
        }
        
        });
            
    