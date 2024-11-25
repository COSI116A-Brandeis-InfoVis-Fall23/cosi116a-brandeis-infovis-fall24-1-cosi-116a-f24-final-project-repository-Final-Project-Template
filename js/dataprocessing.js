d3.csv('MTA_Daily_Ridership_Data__Beginning_2020_20241109.csv', d3.autoType).then(ridershipData => {
  d3.csv('New_York_State_Statewide_COVID-19_Testing_20241110.csv', d3.autoType).then(covidData => {
    // Process ridership data
    const categories = ['Subways', 'Buses', 'LIRR', 'Metro-North', 'Access-A-Ride', 'Bridges and Tunnels', 'Staten Island Railway'];
    const weeklyRidership = d3.rollups(
      ridershipData,
      v => ({
        totalRidership: d3.sum(v, d => d3.sum(categories.map(cat => d[`${cat}: Total Estimated Ridership`] || 0))),
        avgPct: categories.map(cat => ({
          category: cat,
          avgPct: d3.mean(v, d => d[`${cat}: % of Comparable Pre-Pandemic Day`] || 0)
        }))
      }),
      d => d3.timeWeek.floor(new Date(d.Date))
    ).map(([week, values]) => ({ week, ...values }));

    // Process COVID data
    const weeklyCovid = d3.rollups(
      covidData,
      v => d3.sum(v, d => d['Total New Positives']),
      d => d3.timeWeek.floor(new Date(d['Test Date']))
    ).map(([week, totalPositives]) => ({ week, totalPositives }));

    // Merge weekly data
    const mergedData = weeklyRidership.map(d => ({
      ...d,
      covidCases: (weeklyCovid.find(c => c.week.getTime() === d.week.getTime()) || {}).totalPositives || 0
    }));

    // Call function to create charts
    createCharts(mergedData);
  });
});
