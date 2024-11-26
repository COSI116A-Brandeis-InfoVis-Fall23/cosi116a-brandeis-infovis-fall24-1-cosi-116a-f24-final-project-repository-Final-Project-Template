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
      </div>
              `;
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
      });
});


