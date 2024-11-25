function drawStackedLineChart(selector, data){
  const margin = {top: 40, right: 450, bottom: 30, left: 50},
      width = (window.innerWidth * 0.8) - margin.left - margin.right, // Set width to 80% of the window width
      height = 500 - margin.top - margin.bottom;

  const svg = d3.select(selector)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("display", "block") // Center the chart
      .style("margin", "0 auto")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const keys = Object.keys(data[0]).filter(d => d !== "year" && d !== "date");

  const color = d3.scaleOrdinal(d3.schemeCategory20).domain(keys);

  const stackedData = d3.stack().keys(keys)(data);

  const x = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, width])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

  const area = d3.area()
      .x(d => x(d.data.year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveBasis);

  svg.selectAll(".layer")
      .data(stackedData)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", d => color(d.key))
      .style("opacity", 0.8);

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 5 === 0)).tickSizeOuter(0));

  svg.append("g")
      .call(d3.axisLeft(y));

  const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

  keys.forEach((key, index) => {
      const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${index * 20})`);

      legendRow.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(key));

      legendRow.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("text-anchor", "start")
          .text(key);
  });

  function setDispatcher(_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return this;
  }

  return {
    setDispatcher: setDispatcher
  };
};
