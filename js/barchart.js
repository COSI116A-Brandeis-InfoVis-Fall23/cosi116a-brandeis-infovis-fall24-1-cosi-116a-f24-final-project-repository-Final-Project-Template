function createBarChart(data) {
  if (!data || data.length === 0) {
    console.error('Bar Chart: No data available to render.');
    return;
  }
  console.log('Bar Chart Data:', data);
  const margin = { top: 20, right: 50, bottom: 80, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Clear previous chart
  d3.select('#barChart').selectAll('*').remove();

  const svg = d3.select('#barChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  x.domain(data.map(d => d.category));
  y.domain([0, 100]);

  // Log data to debug
  console.log('Bar Chart Data:', data);

  // Add bars
  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.category))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.avgPct))
    .attr('height', d => height - y(d.avgPct))
    .attr('fill', d => barColorScale(d.category))
    .on('click', (d, event) => {
  if (d && d.category) {
    console.log('Bar clicked:', d.category);
    dispatch.call('barChartUpdate', null, [d.category]); // Pass the selected category
  } else {
    console.error('Bar clicked: Data is undefined or missing category.');
  }
});




//Add reset button
svg.append("rect")
  .attr('x', 0)
  .attr('y', -20)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', 'black')
  .on('click', (d, event) => {
    console.log('reset');
    dispatch.call('barChartUpdate', null, "None"); // Pass the selected category
});
svg.append('text')
    .attr("x", 35)
    .attr("y", -9)
    .text("RESET")
    .style("font-size", "14px")
    .style('text-anchor', 'middle')
    .attr("fill", "white")
    .attr("alignment-baseline","middle")
    .on('click', (d, event) => {
    console.log('reset');
    dispatch.call('barChartUpdate', null, "None"); // Pass the selected category
});





  // Add axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text') 
    .style('text-anchor', 'end') 
    .attr('dx', '-0.8em') 
    .attr('dy', '0.15em') 
    .attr('transform', 'rotate(-45)')
    .text(d => d.replace(/([a-z])([A-Z])/g, '$1 $2')); 

  svg.append('g').call(d3.axisLeft(y));
  
  
  
  // adding axis label

svg.append('text')
  .attr('class', 'y-axis-label')
  .attr('transform', 'rotate(-90)')
  .attr('y', -30)
  .attr('x', -height / 2) 
  .style('text-anchor', 'middle')
  .style('font-size', '14px')
  .attr('fill', 'black')
  .text('% of Pre-covid ridership');
  
}





function showTooltip(event, content) {
  d3.select('.tooltip')
    .style('visibility', 'visible')
    .style('top', `${event.pageY - 10}px`)
    .style('left', `${event.pageX + 10}px`)
    .html(content);
}




function hideTooltip() {
  d3.select('.tooltip').style('visibility', 'hidden');
}





