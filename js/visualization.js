// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
d3.csv('data/MTA_Daily_Ridership_Data__Beginning_2020_20241109.csv', function(d) {
  return {
    Date: new Date(d.Date), // Parse date
    Subways: +d['Subways: Total Estimated Ridership'], // Parse numeric data
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
    StatenIslandRailwayPct: +d['Staten Island Railway: % of Comparable Pre-Pandemic Day']
  };
}, function(error, ridershipData) {
  if (error) throw error;

  d3.csv('data/New_York_State_Statewide_COVID-19_Testing_20241110.csv', function(d) {
    return {
      TestDate: new Date(d['Test Date']), // Parse date
      NewPositives: +d['Total New Positives'] // Parse numeric data
    };
  }, function(error, covidData) {
    if (error) throw error;

    processAndVisualize(ridershipData, covidData);
  });
});

function processAndVisualize(ridershipData, covidData) {
  const categories = ['Subways', 'Buses', 'LIRR', 'MetroNorth', 'AccessARide', 'BridgesAndTunnels', 'StatenIslandRailway'];

  // Aggregate ridership data by week
  const weeklyRidership = d3.nest()
    .key(d => d3.timeWeek.floor(d.Date)) // Group by week
    .rollup(values => ({
      totalRidership: d3.sum(values, d => d3.sum(categories.map(cat => d[cat]))),
      avgPct: categories.map(cat => ({
        category: cat,
        avgPct: d3.mean(values, d => d[`${cat}Pct`])
      }))
    }))
    .entries(ridershipData)
    .map(d => ({ week: new Date(d.key), ...d.value }));

  // Aggregate COVID data by week
  const weeklyCovid = d3.nest()
    .key(d => d3.timeWeek.floor(d.TestDate))
    .rollup(values => d3.sum(values, d => d.NewPositives))
    .entries(covidData)
    .map(d => ({ week: new Date(d.key), covidCases: d.value }));

  // Merge the data
  const mergedData = weeklyRidership.map(d => ({
    ...d,
    covidCases: (weeklyCovid.find(c => c.week.getTime() === d.week.getTime()) || {}).covidCases || 0
  }));

  // Create visualizations
  createLineChart(mergedData);
  createBarChart(mergedData);
}

function createLineChart(data) {
  const margin = { top: 20, right: 80, bottom: 30, left: 150 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#lineChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X-Axis
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.week))
    .range([0, width]);

  // Y-Axis for Ridership
  const yLeft = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.totalRidership)])
    .range([height, 0]);

  // Y-Axis for COVID Cases
  const yRight = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.covidCases)])
    .range([height, 0]);

  // Lines
  const ridershipLine = d3.line()
    .x(d => x(d.week))
    .y(d => yLeft(d.totalRidership));

  const covidLine = d3.line()
    .x(d => x(d.week))
    .y(d => yRight(d.covidCases));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', ridershipLine);

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('d', covidLine);

  // X-Axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Left Y-Axis (Ridership)
  svg.append('g')
    .call(d3.axisLeft(yLeft))
    .append('text')
    .attr('fill', 'steelblue')
    .attr('x', -70)
    .attr('y', -10)
    .attr('text-anchor', 'end')
    .text('Total Ridership');

  // Right Y-Axis (COVID Cases)
  svg.append('g')
    .attr('transform', `translate(${width},0)`)
    .call(d3.axisRight(yRight))
    .append('text')
    .attr('fill', 'red')
    .attr('x', 40)
    .attr('y', -10)
    .attr('text-anchor', 'end')
    .text('COVID Cases');
}

function createBarChart(data) {
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 300;

  const svg = d3.select('#barChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const categories = data[0].avgPct.map(d => d.category);
  const avgPct = categories.map(cat => ({
    category: cat,
    percentage: d3.mean(data.map(d => d.avgPct.find(p => p.category === cat).avgPct))
  }));

  // Define color scale
  const color = d3.scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10); // Use D3's category color scheme

  const x = d3.scaleBand()
    .domain(categories)
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  svg.selectAll('.bar')
    .data(avgPct)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.category))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.percentage))
    .attr('height', d => height - y(d.percentage))
    .attr('fill', d => color(d.category)); // Assign color by category

  // X-Axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y-Axis
  svg.append('g')
    .call(d3.axisLeft(y));
}
