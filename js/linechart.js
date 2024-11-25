function createCharts(data) {
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Line chart
  const svgLine = d3.select('#lineChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.week))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.totalRidership, d.covidCases))])
    .range([height, 0]);

  // Lines
  const lineRidership = d3.line()
    .x(d => x(d.week))
    .y(d => y(d.totalRidership));

  const lineCovid = d3.line()
    .x(d => x(d.week))
    .y(d => y(d.covidCases));

  svgLine.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('d', lineRidership);

  svgLine.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('d', lineCovid);

  // Axes
  svgLine.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svgLine.append('g')
    .call(d3.axisLeft(y));

  // Brushing
  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', ({ selection }) => brushed(selection, data));

  svgLine.append('g')
    .attr('class', 'brush')
    .call(brush);
}
