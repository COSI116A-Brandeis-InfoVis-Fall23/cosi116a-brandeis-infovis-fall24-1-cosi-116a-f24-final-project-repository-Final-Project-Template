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
    .on('click', (event, d) => {
  if (d && d.category) {
    console.log('Bar clicked:', d.category);
    dispatch.call('selectionUpdated', null, [d.category]); // Pass the selected category
  } else {
    console.error('Bar clicked: Data is undefined or missing category.');
  }
});


  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text') 
    .style('text-anchor', 'end') 
    .attr('dx', '-0.8em') 
    .attr('dy', '0.15em') 
    .attr('transform', 'rotate(-45)');

  svg.append('g').call(d3.axisLeft(y));
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



dispatch.on('selectionUpdated', function (selectedData) {
  if (Array.isArray(selectedData)) {
    console.log('Filtered data from brushing:', selectedData);

    // Update bar chart with brushed data
    createBarChart(
      categories.map(cat => ({
        category: cat,
        avgPct: d3.mean(selectedData, d => {
          const categoryData = d.avgPct.find(p => p.category === cat);
          return categoryData ? categoryData.avgPct : 0;
        }),
      }))
    );
  } else if (typeof selectedData === 'string') {
    console.log('Bar clicked:', selectedData);

    // Filter line chart for the clicked category
    const filteredData = mergedData.map(d => ({
      week: d.week,
      totalRidership: d[selectedData],
      covidCases: d.covidCases,
    }));

    createLineChart(filteredData);
  } else {
    console.log('Point clicked or hovered:', selectedData);
  }
});





