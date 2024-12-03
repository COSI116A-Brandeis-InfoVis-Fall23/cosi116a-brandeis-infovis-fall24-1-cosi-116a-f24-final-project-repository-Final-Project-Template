d3.json("data/Fuel_and_Energy_cleaned.json").then((data) => {
  // Aggregate the data by Year and Fuel_Source
  const aggregatedData = d3.rollups(
      data,
      (v) => d3.sum(v, (d) => d.Miles_Traveled), 
      (d) => d.Year,                            
      (d) => d.Fuel_Source                     
  );

  // Pass the data into an array
  const flatData = [];
  aggregatedData.forEach(([year, fuelSources]) => {
      fuelSources.forEach(([fuelSource, miles]) => {
          flatData.push({
              Year: +year,
              FuelType: fuelSource,
              Miles: miles,
          });
      });
  });

  const nestedData = d3.groups(flatData, (d) => d.FuelType);

  // Sets up dimensions and margins
  const margin = { top: 20, right: 200, bottom: 50, left: 60 }, 
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#linechart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Creates X scale
  const xScale = d3.scalePoint()
      .domain(flatData.map(d => d.Year)) 
      .range([0, width])
      .padding(0.5); 

  // Creates Y scale
  const yScale = d3.scaleLinear()
      .domain([0, d3.max(flatData, (d) => d.Miles)])
      .range([height, 0]);

  // Maps a color for each fuel type
  const colorScale = d3.scaleOrdinal()
      .domain(["Diesel", "Gasoline", "Electric Propulsion", "Other Fuel", "Compressed Natural Gas"])
      .range(["#FF0000", "#1E90FF", "#008000", "#8A2BE2", "#FFA500"]);

  // Add axes formatting years as integers and converting miles traveled to million
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); 
  svg.append("g")
      .call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1e6}M`)); 

  // Line generator
  const line = d3.line()
      .x((d) => xScale(d.Year))
      .y((d) => yScale(d.Miles));

  // Creates a line per FuelType
  svg.selectAll(".line")
      .data(nestedData)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", ([fuelType]) => {
          const color = colorScale(fuelType);
          return color;
      })
      .attr("stroke-width", 2)
      .attr("d", ([fuelType, values]) => line(values));

  // Creates legend
  svg.selectAll(".legend")
      .data(nestedData)
      .enter()
      .append("text")
      .attr("x", width + 30) 
      .attr("y", (d, i) => i * 20)
      .attr("fill", ([fuelType]) => {
          const color = colorScale(fuelType);
          console.log(`Legend - FuelType: ${fuelType}, Color: ${color}`); // Debugging
          return color;
      })
      .style("font-size", "12px")
      .text(([fuelType]) => fuelType);

  // Details on Demand

  let dimensions = {
    width: 1000,
    height: 500,
    margins: 50,
  };


  const container = svg
    .append("g")
    .attr(
        "transform",
        `translate(${dimensions.margins}, ${dimensions.margins})`
    )
    .append("path")
    .datum(nestedData)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "#30475e")
    .attr("stroke-width",2)
    .on('touchmouse mousemove', function(event){
        const mouse = d3.pointer(event, this)
        console.log(mouse)
    })
    .on('mouseleave', function(event){

    });

    const tooltip = d3.select("#tooltip")
    const tooltipDot = container
        .append("circle")
        .attr("r",5)
        .attr("fill", "#fc8781")
        .attr("smoke", "black")
        .attr("stroke-width",2)
        .style("opacity",0)
        .style('pointer-events','none');

  //test

});
