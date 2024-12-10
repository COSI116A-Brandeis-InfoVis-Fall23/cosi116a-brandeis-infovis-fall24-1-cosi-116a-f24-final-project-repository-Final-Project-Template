(() => {
  d3.json("data/InfrastructureData.json", (data) => {
    const dispatchString = "selectionUpdated";
    const countrySelectedString = "countrySelected";  // Add the countrySelected event name

    // Initialize scatterplot
    const scatter = scatterplot()
      .x(d => d.infrastructureInvestment)
      .xLabel("Transportation Investment (USD)")
      .y(d => d.railUsageTotalPassengers2022 / d.population)
      .yLabel("Rail Passengers per Capita")
      .yLabelOffset(150)
      .selectionDispatcher(d3.dispatch(dispatchString, countrySelectedString)) // Register both events
    ("#scatterplot", data);

    // Initialize the bar graphs
    const barGraph1 = countryBarGraphs();
    const barGraph2 = countryBarGraphs();
    const barGraphAccess = countryBarGraphs();
    const barGraphQuality = countryBarGraphs();
    const barGraphDensity = countryBarGraphs();

    barGraph1("#bar-graph-1", data, d => d.railUsageTotalPassengers2022 / d.population, "Rail Passengers per Capita");
    barGraph2("#bar-graph-2", data, d => d.infrastructureInvestment, "Rail Investment");
    barGraphAccess("#bar-graph-access", data, d => d.access, "Percentage Access to Public Transportation");
    barGraphQuality("#bar-graph-quality", data, d => d.quality, "Quality Ranking (1-7)");
    barGraphDensity("#bar-graph-density", data, d => d.density, "Density (km of Rail per 100 square km)");

    barGraph1.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
      barGraphAccess.updateSelection(selectedData);
      barGraphQuality.updateSelection(selectedData);
      barGraphDensity.updateSelection(selectedData);
    });

    barGraph2.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph1.updateSelection(selectedData);
      barGraphAccess.updateSelection(selectedData);
      barGraphQuality.updateSelection(selectedData);
      barGraphDensity.updateSelection(selectedData);
    });

    barGraphAccess.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph1.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
      barGraphQuality.updateSelection(selectedData);
      barGraphDensity.updateSelection(selectedData);
    });

    barGraphQuality.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph1.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
      barGraphAccess.updateSelection(selectedData);
      barGraphDensity.updateSelection(selectedData);
    });

    barGraphDensity.selectionDispatcher().on(dispatchString, (selectedData) => {
      scatter.updateSelection(selectedData);
      barGraph1.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
      barGraphAccess.updateSelection(selectedData);
      barGraphQuality.updateSelection(selectedData);
    });

    // When clicking on a scatterplot point, update the countryBar.js bar and countryBarGraphs.js bar charts
    scatter.selectionDispatcher().on(countrySelectedString, function(countryName) {
      // Find the data for the selected country
      const countryData = data.find(d => d.country === countryName);
      const inlandRailData = [
        {
          country: countryData.country,
          infrastructureInvestment: countryData.infrastructureInvestment,
          inlandInfrastructureInvestment: countryData.inlandInfrastructureInvestment
        }
      ];

      // Check if inlandRailData has valid data
      if (countryData && countryData.infrastructureInvestment && countryData.inlandInfrastructureInvestment) {
        inlandBar("#inland-bar", inlandRailData);
        d3.select("#inland-bar").style("display", "block");
      } else {
        d3.select("#inland-bar").style("display", "none");
      }

      // Make sure that the necessary properties exist for countryBarChart
      if (countryData && countryData.infrastructureInvestment && countryData.infrastructureMaintenance) {
        const countryBarData = [
          {
            country: countryData.country,
            infrastructureInvestment: countryData.infrastructureInvestment,
            infrastructureMaintenance: countryData.infrastructureMaintenance
          }
        ];
        countryBarChart("#bar-chart", countryBarData);
        d3.select("#bar-chart").style("display", "block");
      } else {
        countryBarChart("#bar-chart");
        d3.select("#bar-chart").style("display", "none");
      }

      // Center the remaining bar if one is hidden and ensure the width stays the same
      const barWidth = "50%"; // Adjust this value as needed
      if (d3.select("#inland-bar").style("display") === "none") {
        d3.select("#bar-chart").style("width", barWidth);
      } else if (d3.select("#bar-chart").style("display") === "none") {
        d3.select("#inland-bar").style("width", barWidth);
      } else {
        d3.select("#bar-chart").style("width", "");
        d3.select("#inland-bar").style("width", "");
      }

      barGraph1.updateSelection([countryData]);
      barGraph2.updateSelection([countryData]);
    });

    // Initialize the bar chart
    const countryBarChart = countryBar();
    const inlandBar = inlandRailBar();

    // Handle selection updates
    scatter.selectionDispatcher().on(dispatchString, (selectedData) => {
      barGraph1.updateSelection(selectedData);
      barGraph2.updateSelection(selectedData);
    });

    document.getElementById("clear-button").addEventListener("click", function() {
      scatter.updateSelection([]);
      barGraph1.updateSelection([]);
      barGraph2.updateSelection([]);
      barGraphAccess.updateSelection([]);
      barGraphQuality.updateSelection([]);
      barGraphDensity.updateSelection([]);
      countryBarChart("#bar-chart", []);
      inlandBar('#inland-bar', [])
    });
  });
})();

document.addEventListener('DOMContentLoaded', function() {
  function initializeCarousel(carouselId) {
    const carousel = document.querySelector(`#${carouselId} .carousel-inner`);
    const items = document.querySelectorAll(`#${carouselId} .carousel-item`);
    const prevButton = document.querySelector(`#${carouselId} .carousel-control-prev`);
    const nextButton = document.querySelector(`#${carouselId} .carousel-control-next`);
    const dots = document.querySelectorAll(`#${carouselId} .dot`);
    let currentIndex = 0;

    function updateCarousel() {
      const offset = -currentIndex * 100;
      carousel.style.transform = `translateX(${offset}%)`;
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    prevButton.addEventListener('click', function(event) {
      event.preventDefault();
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
      updateCarousel();
    });

    nextButton.addEventListener('click', function(event) {
      event.preventDefault();
      currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
      updateCarousel();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        currentIndex = index;
        updateCarousel();
      });
    });
  }

  initializeCarousel('carouselFigma');
  initializeCarousel('carouselSketch');
});
