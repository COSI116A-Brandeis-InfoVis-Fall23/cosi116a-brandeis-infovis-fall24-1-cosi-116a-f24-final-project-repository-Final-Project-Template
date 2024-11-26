(() => {
  // Constants for the visualization
  const width = 960;
  const height = 600;
  const margin = { top: 20, right: 40, bottom: 60, left: 40 };

  // Create SVG container with adjusted dimensions
  const svg = d3.select("#vis-svg")
    .attr("width", width)
    .attr("height", height);

  // Create tooltip
  const tooltip = d3.select(".tooltip");

  // Create a projection and path generator
  const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(1000);

  const path = d3.geoPath()
    .projection(projection);

  // Add metric constants
  const metrics = {
    ownerCosts: "Median Monthly Owner Costs (Mortgage)",
    rent: "Median Gross Rent",
    income: "Median Income"
  };

  // Update color scale to be more flexible
  const colorScale = d3.scaleQuantile()
    .range(d3.schemeBlues[9]);

  // Load data
  Promise.all([
    d3.json("data/us-states.json"),
    d3.csv("data/8_years_median_costs_rents_income_by_state.csv")
  ]).then(([us, costData]) => {
    // Process the data
    const dataByStateYear = new Map();
    costData.forEach(d => {
      if (!dataByStateYear.has(d.State)) {
        dataByStateYear.set(d.State, new Map());
      }
      dataByStateYear.get(d.State).set(d.Year, {
        ownerCosts: +d["Median Monthly Owner Costs (Mortgage)"],
        rent: +d["Median Gross Rent"],
        income: +d["Median Income"]
      });
    });

    // Populate year dropdown
    const yearSelect = document.getElementById('year');
    for (let year = 2015; year <= 2023; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }

    // Populate metric dropdown
    const metricSelect = document.getElementById('metricSelect');
    Object.entries(metrics).forEach(([key, label]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = label;
      metricSelect.appendChild(option);
    });

    // Update function to handle both year and metric changes
    function updateVisualization(year, metric) {
      // Update color scale domain based on selected metric and year
      const valuesForYear = costData
        .filter(d => d.Year === year)
        .map(d => +d[metrics[metric]]);
      colorScale.domain(d3.extent(valuesForYear));

      // Update map colors
      svg.selectAll(".state")
        .transition()
        .duration(750)
        .style("fill", d => {
          const stateData = dataByStateYear.get(d.properties.name)?.get(year);
          return stateData ? colorScale(stateData[metric]) : "#ccc";
        });

      // Update tooltip content
      svg.selectAll(".state")
        .on("mouseover", function(event, d) {
          const stateData = dataByStateYear.get(d.properties.name)?.get(year);
          
          if (stateData) {
            tooltip.style("opacity", 0.9)
              .html(`
                <strong>${d.properties.name}</strong><br/>
                ${metrics[metric]}: $${stateData[metric].toLocaleString()}<br/>
                Year: ${year}
              `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          }
        });

      // Update legend
      updateLegend(colorScale.quantiles(), metrics[metric]);
    }

    // Create states
    svg.selectAll("path")
      .data(us.features)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", path)
      .style("stroke", "white")
      .style("stroke-width", "0.5")
      .on("mouseover", function(event, d) {
        const year = d3.select("#year").property("value");
        const stateData = dataByStateYear.get(d.properties.name)?.get(year);
        
        if (stateData) {
          tooltip.style("opacity", 0.9)
            .html(`
              <strong>${d.properties.name}</strong><br/>
              Owner Costs: $${stateData.ownerCosts.toLocaleString()}<br/>
              Rent: $${stateData.rent.toLocaleString()}<br/>
              Income: $${stateData.income.toLocaleString()}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
      });

    // Create legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 180}, ${height - 150})`);

    // Update legend function to include metric title
    function updateLegend(breaks, metricTitle) {
      const legendWidth = 20;
      const legendHeight = 20;

      legend.selectAll("*").remove();

      // Add title
      legend.append("text")
        .attr("class", "legend-title")
        .attr("x", 0)
        .attr("y", -10)
        .text(metricTitle);

      // Add color boxes
      legend.selectAll("rect")
        .data(colorScale.range())
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * legendWidth)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", d => d);

      // Add labels
      legend.selectAll(".legend-label")
        .data(breaks)
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", (d, i) => (i + 1) * legendWidth)
        .attr("y", legendHeight + 15)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .text(d => Math.round(d));
    }

    // Event listeners for dropdowns
    d3.select("#yearSelect").on("change", function() {
      const selectedMetric = d3.select("#metricSelect").property("value");
      updateVisualization(this.value, selectedMetric);
    });

    d3.select("#metricSelect").on("change", function() {
      const selectedYear = d3.select("#yearSelect").property("value");
      updateVisualization(selectedYear, this.value);
    });

    // Initial render with default values
    const initialYear = "2022";
    const initialMetric = "ownerCosts";
    updateVisualization(initialYear, initialMetric);
  });
})();