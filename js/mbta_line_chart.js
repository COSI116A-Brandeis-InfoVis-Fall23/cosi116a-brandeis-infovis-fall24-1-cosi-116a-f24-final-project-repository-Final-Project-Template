/* To create the brushing and Linking, we used the following articles as refrence: 
 1)Enhancing The Clickable Area Size --> https://ishadeed.com/article/clickable-area/ by Ahmad Shadeed
 
 Information above also Included in the Acknowledgments portion of the html file.
 */

// Initialize selectedFuelTypes globally to keep track of the fuel types currently selected to allow for interactivity between views.
window.selectedFuelTypes = [];

// Load the data
d3.json("data/Fuel_and_Energy_cleaned.json").then((data) => {
    // Aggregate the data by Year and Fuel_Source
    const aggregatedData = d3.rollups(
        data,
        (v) => d3.sum(v, (d) => d.Miles_Traveled),
        (d) => d.Year,
        (d) => d.Fuel_Source
    );

    const flatData = [];
    aggregatedData.forEach(([year, fuelSources]) => {
        fuelSources.forEach(([fuelSource, miles]) => {
            flatData.push({
                Year: +year,
                FuelType: fuelSource,
                Miles: miles,
            });
        });
    });

    const nestedData = d3.groups(flatData, (d) => d.FuelType);

    // Tooltip for details on demand.
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .text("a simple tooltip");

    // Set up dimensions and margins
    const margin = { top: 20, right: 200, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#linechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create X scale
    const xScale = d3.scalePoint()
        .domain(flatData.map((d) => d.Year))
        .range([0, width])
        .padding(0.5);

    // Create Y scale
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(flatData, (d) => d.Miles)])
        .range([height, 0]);

    // Map a color for each fuel type
    const colorScale = d3.scaleOrdinal()
        .domain([
            "Diesel",
            "Gasoline",
            "Electric Propulsion",
            "Other Fuel",
            "Compressed Natural Gas",
        ])
        .range(["#FF0000", "#1E90FF", "#008000", "#8A2BE2", "#FFA500"]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1e6}M`));

    // Line generator
    const line = d3.line()
        .x((d) => xScale(d.Year))
        .y((d) => yScale(d.Miles));

    // Create lines for each fuel type
    svg.selectAll(".line-group")
        .data(nestedData)
        .enter()
        .append("g")
        .attr("class", "line-group")
        .each(function ([fuelType, values]) {
            const group = d3.select(this);

            // Made the clickable area bigger the user doesn't have to click precisly on the line for the brushing and linking to work.
            // Meaning, the user can click a little above/bellow the line and the functionality will still work
            group.append("path")
                .attr("class", "line-click-area")
                .attr("fill", "none")
                .attr("stroke-width", 20)
                .attr("stroke", "transparent")
                .attr("d", line(values))
                .on("click", function () {
                    const isAlreadySelected = window.selectedFuelTypes.includes(fuelType);
                    if (!isAlreadySelected) {
                        // Adds the clicked lines to the global variable selectedFuelTypes to keep track of the fule types selected.
                        window.selectedFuelTypes.push(fuelType);
                    } else {
                        // Removes the clicked line 
                        window.selectedFuelTypes = window.selectedFuelTypes.filter(
                            (f) => f !== fuelType
                        );
                    }
                    svg.selectAll(".line")
                        .style("opacity", ([fuelType]) =>
                            window.selectedFuelTypes.length === 0 ||
                                window.selectedFuelTypes.includes(fuelType)
                                ? 1
                                : 0.25
                        );

                    
                    svg.selectAll(".point")
                        .style("opacity", function (d) {
                            return window.selectedFuelTypes.length === 0 ||
                                window.selectedFuelTypes.includes(d.FuelType)
                                ? 1
                                : 0.1
                        }
                        );
                    // Updates the Sankey diagram 
                    updateSankey(window.selectedFuelTypes);
                });

            group.append("path")
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", colorScale(fuelType))
                .attr("stroke-width", 2)
                .attr("d", line(values));

            //adds points to each data point
            for (const element of nestedData) {
                svg.selectAll(".circle")
                    .data(element[1])
                    .enter()
                    .append("circle")
                    .attr("class", "point")
                    .attr("cx", function (d) { return xScale(d.Year) })
                    .attr("cy", function (d) { return yScale(d.Miles) })
                    .attr("r", 3)
                    .on('mouseover', function (event, d) {
                        // check if tooltip should appear and shows tooltip
                        if(selectedFuelTypes.includes(d.FuelType) || selectedFuelTypes.length === 0){
                        const milesInMillions = (d.Miles / 1e6).toFixed(1);
                        const tooltipMiles = `${milesInMillions}M`;
                        tooltip.html(
                            `<strong>Year:</strong> ${d.Year}<br>
                                                <strong>Miles Traveled:</strong> ${tooltipMiles}<br>
                                                 <strong>Fuel Source:</strong> ${d.FuelType}`
                        ).style("visibility", "visible");
                    }})
                    .on("mousemove", function (event) {
                        tooltip.style("top", `${event.pageY - 100}px`)
                            .style("left", `${event.pageX - 100}px`);
                    })
                    .on('mouseout', function (event, d) {
                        //hide tooltip
                        tooltip.style("visibility", "hidden");
                    });
            }


        });


    // Creates legend
    svg.selectAll(".legend")
        .data(nestedData)
        .enter()
        .append("text")
        .attr("x", width + 30)
        .attr("y", (d, i) => i * 20)
        .attr("fill", ([fuelType]) => colorScale(fuelType))
        .style("font-size", "12px")
        .text(([fuelType]) => fuelType);
});
