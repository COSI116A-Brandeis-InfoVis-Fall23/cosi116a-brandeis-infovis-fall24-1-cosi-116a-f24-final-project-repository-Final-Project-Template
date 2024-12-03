// Globals
const categories = [
  'Subways',
  'Buses',
  'LIRR',
  'MetroNorth',
  'AccessARide',
  'BridgesAndTunnels',
  'StatenIslandRailway',
];

let mergedData; // Declare globally
const dispatch = d3.dispatch('selectionUpdated'); // Shared event dispatcher
const barColorScale = d3.scaleOrdinal(d3.schemeCategory10); // Bar color scale

// Load data
d3.csv('data/MTA_Daily_Ridership_Data__Beginning_2020_20241109.csv', function (d) {
  return {
    Date: new Date(d.Date),
    Subways: +d['Subways: Total Estimated Ridership'],
    Buses: +d['Buses: Total Estimated Ridership'],
    LIRR: +d['LIRR: Total Estimated Ridership'],
    MetroNorth: +d['Metro-North: Total Estimated Ridership'],
    AccessARide: +d['Access-A-Ride: Total Estimated Ridership'],
    BridgesAndTunnels: +d['Bridges and Tunnels: Total Estimated Ridership'],
    StatenIslandRailway: +d['Staten Island Railway: Total Estimated Ridership'],
    SubwaysPct: +d['Subways: % of Comparable Pre-Pandemic Day'],
    BusesPct: +d['Buses: % of Comparable Pre-Pandemic Day'],
    LIRRPct: +d['LIRR: % of Comparable Pre-Pandemic Day'],
    MetroNorthPct: +d['Metro-North: % of Comparable Pre-Pandemic Day'],
    AccessARidePct: +d['Access-A-Ride: % of Comparable Pre-Pandemic Day'],
    BridgesAndTunnelsPct: +d['Bridges and Tunnels: % of Comparable Pre-Pandemic Day'],
    StatenIslandRailwayPct: +d['Staten Island Railway: % of Comparable Pre-Pandemic Day'],
  };
}, function (error, ridershipData) {
  if (error) {
    console.error('Failed to load ridership data:', error);
    return;
  }

  d3.csv('data/New_York_State_Statewide_COVID-19_Testing_20241110.csv', function (d) {
    return {
      TestDate: new Date(d['Test Date']),
      NewPositives: +d['Total New Positives'],
    };
  }, function (error, covidData) {
    if (error) {
      console.error('Failed to load COVID data:', error);
      return;
    }
    processAndVisualize(ridershipData, covidData);
  });
});

// Process and visualize data
function processAndVisualize(ridershipData, covidData) {
  const weeklyRidership = d3.nest()
    .key(d => d3.timeWeek.floor(d.Date))
    .rollup(values => ({
      totalRidership: d3.sum(values, d => d3.sum(categories.map(cat => d[cat]))),
      avgPct: categories.map(cat => ({
        category: cat,
        avgPct: d3.mean(values, d => d[`${cat}Pct`]),
      })),
    }))
    .entries(ridershipData)
    .map(d => ({ week: new Date(d.key), ...d.value }));

  const weeklyCovid = d3.nest()
    .key(d => d3.timeWeek.floor(d.TestDate))
    .rollup(values => d3.sum(values, d => d.NewPositives))
    .entries(covidData)
    .map(d => ({ week: new Date(d.key), covidCases: d.value }));

  mergedData = weeklyRidership.map(d => ({
    ...d,
    covidCases: (weeklyCovid.find(c => c.week.getTime() === d.week.getTime()) || {}).covidCases || 0,
  }));

  if (!mergedData || mergedData.length === 0) {
    console.error('Merged data is empty.');
    return;
  }

  const defaultBarData = categories.map(cat => ({
    category: cat,
    avgPct: d3.mean(mergedData, d => {
      const categoryData = d.avgPct.find(p => p.category === cat);
      return categoryData ? categoryData.avgPct : 0;
    }),
  }));

  createLineChart(mergedData);
  createBarChart(defaultBarData);
}

function createLineChart(data) {
  if (!data || data.length === 0) {
    console.error('Line Chart: No data available to render.');
    return;
  }
  console.log('Line Chart Data:', data);
  const margin = { top: 20, right: 80, bottom: 30, left: 70 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Clear previous chart
  d3.select('#lineChart').selectAll('*').remove();

  const svg = d3.select('#lineChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.week))
    .range([0, width]);


  const yLeft = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.totalRidership)])
    .range([height, 0]);


  const yRight = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.covidCases)])
    .range([height, 0]);



  // Add axes
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6));

  svg.append('g')
    .attr('class', 'y-axis-left')
    .call(d3.axisLeft(yLeft));

  svg.append('g')
    .attr('class', 'y-axis-right')
    .attr('transform', `translate(${width},0)`)
    .call(d3.axisRight(yRight));

  // Define line generators
  const ridershipLine = d3.line()
    .x(d => x(d.week))
    .y(d => yLeft(d.totalRidership));

  const covidLine = d3.line()
    .x(d => x(d.week))
    .y(d => yRight(d.covidCases));

  // Append ridership line
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', ridershipLine);

  // Append covid cases line
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'orange')
    .attr('stroke-width', 2)
    .attr('d', covidLine);

svg.selectAll('.point')
  .data(data)
  .enter()
  .append('circle')
  .attr('class', 'point')
  .attr('cx', d => x(d.week))
  .attr('cy', d => yLeft(d.totalRidership))
  .attr('r', 3)
  .attr('fill', 'steelblue')
  .on('mouseover', (event, d) => {
    if (d) {
      showTooltip(event, `Week: ${d3.timeFormat('%B %d, %Y')(d.week)}<br>Total Ridership: ${d3.format(',')(d.totalRidership)}`);
    } else {
      console.error('Mouseover: Data is undefined.');
    }
  })
  .on('click', (event, d) => {
    if (d) {
      console.log('Point clicked:', d);
      dispatch.call('selectionUpdated', null, [d]);
    } else {
      console.error('Point clicked: Data is undefined.');
    }
  });




const brush = d3.brushX()
  .extent([[0, 0], [width, height]])
  .on('end', function (event) {
    const selection = event.selection;
    if (!selection) {
      console.warn('Brush cleared. Resetting line chart.');
      dispatch.call('selectionUpdated', null, mergedData); // Reset to full data
      return;
    }

    const [x0, x1] = selection.map(x.invert); // Map pixel values to the time domain
    const filteredData = mergedData.filter(d => d.week >= x0 && d.week <= x1);
    console.log('Brushed Data:', filteredData);

    dispatch.call('selectionUpdated', null, filteredData); // Dispatch brushed data
  });

svg.append('g')
  .attr('class', 'brush')
  .call(brush);
}



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





