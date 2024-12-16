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
const dispatch = d3.dispatch('lineChartUpdate', 'barChartUpdate'); // Shared event dispatcher
const barColorScale = d3.scaleOrdinal(d3.schemeCategory10); // Bar color scale

// Load data
d3.csv('data/MTA_Daily_Ridership_Data__Beginning_2020_20241109.csv', function (d) {
  return {
    Date: new Date(d.Date),
    Subways: +d['Subways: Total Estimated Ridership'],
    Buses: +d['Buses: Total Estimated Ridership'],
    LIRR: +d['LIRR: Total Estimated Ridership'],
    MetroNorth: +d['Metro-North: Total Estimated Ridership'],
    AccessARide: +d['Access-A-Ride: Total Scheduled Trips'],
    BridgesAndTunnels: +d['Bridges and Tunnels: Total Traffic'],
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
      totalCat: categories.map(cat => ({
        category: cat,
        totRide: d3.sum(values, d => d[cat]),
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



dispatch.on('barChartUpdate', function (selectedData) {
    console.log('Bar clicked:', selectedData);
    createLineChart(mergedData, selectedData);
});



dispatch.on('lineChartUpdate', function (selectedData) {
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
    
    // update heatmap with new date range
    let firstDate = selectedData[0].week;
    let lastDate = selectedData[selectedData.length-1].week;
    
    window.updateDateRange(firstDate, lastDate);
    
    
});













