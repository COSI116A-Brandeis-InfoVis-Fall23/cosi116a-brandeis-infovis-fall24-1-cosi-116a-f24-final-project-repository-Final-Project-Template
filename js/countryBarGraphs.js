function countryBarGraphs() {
    let margin = { top: 20, left: 100, right: 30, bottom: 50 },
        width = 750 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom; // Half the height of the scatterplot

    const dispatcher = d3.dispatch("selectionUpdated");

    function chart(selector, data, xValue, xLabel) {
        // Sort data by xValue
        data.sort((a, b) => xValue(a) - xValue(b));

        const svg = d3.select(selector)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .classed("svg-content", true);

        let chartGroup = svg.select("g");
        if (chartGroup.empty()) {
            chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
        }

        // Clear previous chart elements to avoid overlap
        chartGroup.selectAll("*").remove();

        // Define scales
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.country))
            .range([height, 0])
            .padding(0.1);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, width]);
    
        // Create axes
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => {
                if (d >= 1e9) return (d / 1e9).toFixed(1) + "B";
                if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
                if (d >= 1e3) return (d / 1e3).toFixed(1) + "K";
                return d;
            })); // Custom format for large numbers

        chartGroup.append("g")
            .call(d3.axisLeft(yScale));

        // Create bars
        const bars = chartGroup.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.country))
            .attr("width", d => xScale(xValue(d)))
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue")
            .on("click", function(event, d) {
                // Toggle selection on click
                const isSelected = d3.select(this).classed("selected");
                d3.select(this).classed("selected", !isSelected)
                    .attr("fill", !isSelected ? "green" : "steelblue");

                // Dispatch the selectionUpdated event with the selected data
                const selectedData = chartGroup.selectAll(".bar.selected").data();
                dispatcher.call("selectionUpdated", this, selectedData);

            });

        // Add x-axis label
        chartGroup.append("text")
            .attr("class", "axisLabel")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text(xLabel);

        // Add info button (SVG circle)
        const infoGroup = chartGroup.append("g")
        .attr("transform", `translate(${0}, ${height + margin.bottom - 15})`);

        infoGroup.append("circle")
        .attr("r", 10)
        .attr("fill", "#007BFF")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("cursor", "pointer");

        // Add "i" icon inside the button
        infoGroup.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "15px")
       
        .style("font-style", "italic")
        .text("i");

        const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

        // Hover events
        infoGroup.on("mouseover", function (d) {
            d3.select(this).classed("mouseover", true);
            let currentHeight = 0; 
            let currentWidth = 0;
            let tooltipContent = '';
            if(xValue == 'd => d.quality'){
                tooltipContent = "WEF Global Competitiveness Index for rail quality, measured on a scale of 1-7 in 2019. "+
                "Respondants to a survey report 1 for poor quality and 7 for amongst the best quality.";
                currentHeight = 55;
                currentWidth = 360;
            }else if(xValue == 'd => d.access'){
                tooltipContent = "Share of the urban population who can access a public transport stop within "+
                "a walking distance of 500 meters (for low-capacity public transport systems) or 1000 meters "+ 
                "(for high-capacity public transport systems) in the year 2020.";
                currentHeight = 68;
                currentWidth = 365;
            }else if(xValue == 'd => d.density'){
                tooltipContent = "Density of the rail system measured in kilometers of rail per 100 square kilometers."+
                 " Measured in the year 2021.";
                 currentHeight = 40;
                 currentWidth = 360;
            }
            else if(xValue == 'd => d.infrastructureInvestment'){
                tooltipContent = "Investment in rail infrastructure in 2021 per country.";
                currentHeight = 20;
                currentWidth = 300;
            }
            else if(xValue == 'd => d.railUsageTotalPassengers2022 / d.population'){
                tooltipContent = "Usage of rail systems per country in 2022 measured in total passengers per capita, "+
                "or total passengers divided by the population in order to keep measures proporitional to population.";
                currentHeight = 55;
                currentWidth = 390;
            }
            else{
                tooltipContent = "<strong>Country:</strong>" + xValue+ " " + `<br><strong>Population: </strong>`;

            }
            


    
    
            tooltip
              .style("opacity", 1)
              .style("visibility", "visible")
              .style("height", currentHeight +"px")
              .style("width", currentWidth + "px")
              .html(tooltipContent);  // Display the tooltip content
          })
          .on("mousemove", function () {
            const mouseX = d3.event.pageX; // Mouse X position relative to the page
            const mouseY = d3.event.pageY; // Mouse Y position relative to the page
        
            tooltip
                .style("opacity", 1)
                .style("visibility", "visible")
                .style("left", `${mouseX + 10}px`) // Offset tooltip slightly to the right
                .style("top", `${mouseY - 20}px`); // Offset tooltip slightly above the mouse
        })
          .on("mouseout", function () {
            d3.select(this).classed("mouseover", false);
            tooltip.style("opacity", 0); // Hide tooltip
          })

        return chart;
    }

    // Gets or sets the dispatcher we use for selection events
    chart.selectionDispatcher = function (_) {
        if (!arguments.length) return dispatcher;
        dispatcher = _;
        return chart;
    };

    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    chart.updateSelection = function (selectedData) {
        if (!arguments.length) return;

        // Select an element if its datum was selected
        d3.selectAll('.bar').classed("selected", function(d) {
            const isSelected = selectedData.includes(d);
            d3.select(this).attr("fill", isSelected ? "green" : "steelblue");
            return isSelected;
        });
    };

    return chart;
}