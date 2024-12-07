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





  let points = svg.append("g")
      .selectAll(".scatterPoint")
        .data(data);

    points.exit().remove();

    points = points.enter()
      .append("circle")
        .attr("class", "point scatterPoint")
      .merge(points)
        .attr('cx', d => x(d.week))
        .attr('cy', d => yLeft(d.totalRidership))
        .attr('r', 3);
       /* .attr('fill', 'steelblue');*/
    
    selectableElements = points;
    svg.call(brush);

    
// Highlight points when brushed
    function brush(g) {
      const brush = d3.brush() // Create a 2D interactive brush
        .on("start brush", highlight) // When the brush starts/continues do...
        .on("end", brushEnd) // When the brush ends do...
        .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);
        
      ourBrush = brush;

      g.call(brush); // Adds the brush to this element

      // Highlight the selected circles
      function highlight() {
        if (d3.event.selection === null) return;
        const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;
        
        // selection.map(x.invert); // Map pixel values to the time domain
        
        /*const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;*/

        // If within the bounds of the brush, select it
/*        points.attr('fill', 'red', d =>
          x0 <= x(d.__data__.week) && x(d.__data__.week) <= x1
          );
        */
        
        points.classed("selected", d =>
          x0 <= x(d.week) && x(d.week) <= x1 && y0 <= yLeft(d.totalRidership) && yLeft(d.totalRidership) <= y1
        );
   
          
/*
        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know about our selection
        dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());*/
      }
      
      function brushEnd(){
        // We don't want infinite recursion
        if(d3.event.sourceEvent.type!="end"){
          d3.select(this).call(brush.move, null);
          
          
          
          let filteredData = svg.selectAll(".selected").data();
          if (filteredData.length == 0) {
            filteredData =  svg.selectAll(".point").data();
          }
          
          console.log('Brushed Data:', filteredData);

          dispatch.call('lineChartUpdate', null, filteredData); // Dispatch brushed data
        }         
        
        
        
      }
    }

  


  /*
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
    });*/

/*
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
  .call(brush);*/
  
  
  
  
  
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








