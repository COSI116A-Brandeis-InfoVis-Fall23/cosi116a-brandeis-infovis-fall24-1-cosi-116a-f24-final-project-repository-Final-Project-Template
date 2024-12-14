function drawStackedLineChart(selector, data, dispatcher) {
    const margin = { top: 40, right: 450, bottom: 30, left: 70 },
        width = (window.innerWidth * 0.8) - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let svg = d3.select(selector).select("svg");
    if (svg.empty()) {
        svg = d3.select(selector)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("display", "block")
            .style("margin", "0 auto")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    } else {
        svg = svg.select("g");
    }

    // Create key mapping
    const keys = Object.keys(data[0]).filter(d => d !== "year" && d.trim() !== "date");
    const trimmedKeys = keys.map(d => d.trim());

    const keyMapping = {};
    keys.forEach((key, index) => {
        keyMapping[trimmedKeys[index]] = key;
    });
    const customColors = [
        "#DB697A", // Color 1
        "#EE8575", // Color 2
        "#FBB482", // Color 3
        "#CDEBB8", // Color 4
        "#9CD7BC", // Color 5
        "#867BB9", // Color 6
        "#6BAED6", // Color 7
        "#FED976", // Color 8
        "#FFFFCC", // Color 9
        "#F7AC53", // Color 10
        "#CC80B3", // Color 11
        "#D98880", // Color 12
        "#F0B27A", // Color 13
        "#C39BD3", // Color 14
        "#7DCEA0", // Color 15
        "#F5CBA7", // Color 16
        "#85C1E9", // Color 17
        "#E8DAEF", // Color 18
        "#F9E79F", // Color 19
        "#EAEDED"  // Color 20
      ];
      
      const color = d3.scaleOrdinal(customColors).domain(trimmedKeys);
      
   // const color = d3.scaleOrdinal(d3.schemeCategory20).domain(trimmedKeys);
    const stackedData = d3.stack().keys(keys)(data);

    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1]))])
        .range([height, 0]);

    const area = d3.area()
        .x(d => x(d.data.year) + x.bandwidth() / 2)
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);

    // Add the stacked area layers
    svg.selectAll(".layer")
        .data(stackedData)
        .enter().append("path")
        .attr("class", d => {
            // Convert category key to a safe CSS class name by replacing spaces with underscores
            const safeKey = d.key.trim().replace(/\s+/g, '_');
            return `layer ${safeKey}`;
        })
        .attr("d", area)
        .style("fill", d => color(d.key.trim()))
        .style("opacity", 1);

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 20}, 0)`);

    legend.selectAll(".legend-item")
        .data(trimmedKeys)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .each(function (d) {
            const legendItem = d3.select(this);
            legendItem.append("rect")
                .attr("x", 0)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color(d));

            legendItem.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(d);
        });

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(x)
                .tickValues(x.domain().filter((d, i) => i % 5 === 0))
                .tickSizeOuter(0)
        );

    svg.append("g")
        .call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.8)")
        .style("border", "1px solid #333")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // Brush selection functionality
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush end", brushed);

    const brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);

    brushGroup.selectAll(".overlay")
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    function mousemove() {
        const mouse = d3.mouse(this);
        const mouseX = mouse[0];
        const mouseY = mouse[1];

        // Find the closest year
        const closestYear = x.domain().reduce((prev, curr) => {
            const prevDiff = Math.abs(x(prev) + x.bandwidth() / 2 - mouseX);
            const currDiff = Math.abs(x(curr) + x.bandwidth() / 2 - mouseX);
            return currDiff < prevDiff ? curr : prev;
        });

        if (closestYear !== undefined) {
            const index = data.findIndex(entry => entry.year == closestYear);
            const dataForYear = data[index];

            const layersAtPoint = stackedData.map(layer => ({
                key: layer.key,
                y0: layer[index][0],
                y1: layer[index][1],
            })).reverse();

            let category;
            for (let i = 0; i < layersAtPoint.length; i++) {
                const layer = layersAtPoint[i];
                const y0 = y(layer.y0);
                const y1 = y(layer.y1);

                if (mouseY >= Math.min(y0, y1) && mouseY <= Math.max(y0, y1)) {
                    const trimmedKey = layer.key.trim();
                    category = keyMapping[trimmedKey];
                    break;
                }
            }

            if (category) {
                const value = dataForYear[category];
                if (value !== undefined) {
                    tooltip.html(`
                        <strong>Category:</strong> ${category.trim()}<br>
                        <strong>Year:</strong> ${closestYear}<br>
                        <strong>Percentage:</strong> ${value.toFixed(2)}%
                    `)
                        .style("visibility", "visible")
                        .style("top", `${d3.event.pageY - 40}px`)
                        .style("left", `${d3.event.pageX + 15}px`);
                }
            } else {
                tooltip.style("visibility", "hidden");
            }
        }
    }

    function mouseout() {
        tooltip.style("visibility", "hidden");
    }

    function brushed() {
        const selection = d3.event.selection;

        if (selection) {
            const [x0, x1] = selection;
            const selectedYears = x.domain().filter(year => {
                const position = x(year) + x.bandwidth() / 2;
                return position >= x0 && position <= x1;
            });

            dispatcher.call("selectionUpdated", this, selectedYears);
        } else {
            dispatcher.call("selectionUpdated", this, []);
        }
    }

    // Highlighting logic
    let currentlyHighlighted = null;

    dispatcher.on("categoryHighlighted", function (categoryKey) {
        // Convert category key to match class names used in layers
        const trimmedCategory = categoryKey.trim().replace(/\s+/g, '_');
    
        if (currentlyHighlighted === trimmedCategory) {
            // If the user clicked the same category again, reset highlight
            currentlyHighlighted = null;
    
            // Remove the highlight class and reset all layers
            svg.selectAll(".layer")
                .classed("highlightedCategory", false) // Remove the class
                .transition()
                .duration(200)
                .style("opacity", 1.0); // Reset opacity
        } else {
            currentlyHighlighted = trimmedCategory;
    
            // De-highlight all layers by reducing opacity
            svg.selectAll(".layer")
                .classed("highlightedCategory", false) // Remove the class from all layers
                .transition()
                .duration(200)
                .style("opacity", 0.3); // Dim other layers
    
            // Highlight the selected category by adding the class
            svg.selectAll(`.layer.${trimmedCategory}`)
                .classed("highlightedCategory", true) // Add the highlight class
                .transition()
                .duration(200)
                .style("opacity", 1.0); // Ensure the layer is fully visible
        }
    });
}
