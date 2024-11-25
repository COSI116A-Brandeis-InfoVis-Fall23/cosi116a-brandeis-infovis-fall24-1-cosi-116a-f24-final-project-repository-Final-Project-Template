function brushed(selection, data) {
  if (!selection) {
    updateBarChart(data.map(d => d.avgPct));
  } else {
    const [x0, x1] = selection.map(x.invert);
    const filtered = data.filter(d => d.week >= x0 && d.week <= x1);
    updateBarChart(d3.mean(filtered.map(d => d.avgPct)));
  }
}

function updateBarChart(data) {
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 300;

  const svgBar = d3.select('#barChart')
    .select('svg');

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  svgBar.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('x', d => x(d.category))
    .attr('width', xBar.bandwidth())
    .attr('y', d => y(d.percentage))
    .attr('height', d => height - y(d.percentage))
    .attr('fill', 'orange');

  svgBar.select('.y-axis')
    .call(d3.axisLeft(y));
}
