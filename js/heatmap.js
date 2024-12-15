function heatmap() {

  // Create a color scale for the heatmap
  const colorScale = d3.scaleQuantize()
    .domain([0, d3.max(Object.values(data))]) // Adjust domain based on your dataset
    .range(d3.schemeReds[5]); // Adjust range based on your dataset

      var map = d3.choropleth()
      .geofile('/d3-geomap/topojson/countries/USA.json')
      .colors(colorbrewer.Reds[9])
      .projection(d3.geoAlbersUsa)
      .column("DoD Spending in State")
      .format(d3.format('$,'))
      .unitId('fips')
      .scale(1000)
      .legend(true);

      d3.json('../data/DoD_Budget.json').then(data => {
      map.draw(d3.select('#map').datum(data));
      }).catch(error => console.error('Error loading data:', error));

}