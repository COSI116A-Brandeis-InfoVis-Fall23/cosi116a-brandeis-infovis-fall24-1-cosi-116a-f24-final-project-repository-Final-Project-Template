function createLineChart(data, category = 'None') {
  if (!data || data.length === 0) {
    console.error('Line Chart: No data available to render.');
    return;
  }
  console.log('Line Chart Data:', data);
  const margin = { top: 20, right: 80, bottom: 30, left: 70 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  const ptRadius = 3

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
    .domain([0, d3.max(data, d => d.totalRidership) + 5000000] )
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



/*https://d3-graph-gallery.com/graph/custom_legend.html*/
  
  // Add legend
  svg.append("circle")
    .attr("cx",width-150)
    .attr("cy",10)
    .attr("r", 5)
    .style("fill", "black");
  svg.append("text")
    .attr("x", width-140)
    .attr("y", 10)
    .text("Total Ridership")
    .style("font-size", "13px")
    .attr("fill", "black")
    .attr("alignment-baseline","middle");
  svg.append("circle")
    .attr("cx",width-150)
    .attr("cy",30)
    .attr("r", 5)
    .style("fill", "black");
  svg.append("text")
    .attr("x", width-140)
    .attr("y", 30)
    .text("New Covid Cases")
    .style("font-size", "13px")
    .attr("fill", "black")
    .attr("alignment-baseline","middle");
  
  if (category != "None") {
    svg.append("circle")
    .attr("cx",width-150)
    .attr("cy",50)
    .attr("r", 5)
    .style("fill", barColorScale(category));
  svg.append("text")
    .attr("x", width-140)
    .attr("y", 50)
    .text(category)
    .style("font-size", "13px")
    .attr("fill", "black")
    .attr("alignment-baseline","middle");
  }
    
    
    /*
  svg.append("circle")
    .attr("cx",200)
    .attr("cy",160)
    .attr("r", 6).style("fill", "#404080");
  
  svg.append("text")
    .attr("x", 220)
    .attr("y", 160)
    .text("variable B")
    .style("font-size", "15px")
    .attr("alignment-baseline","middle");*/
  










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
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('d', ridershipLine);

  // Append covid cases line
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'orange')
    .attr('stroke-width', 2)
    .attr('d', covidLine);
    
    
  // Append category line
  if (category != "None") {
   const catLine = d3.line()
    .x(d => x(d.week))
    .y(d => yLeft(d.totalCat.filter(item => item.category === category[0])[0].totRide));
  
  svg.append('path')
    .datum(data)
  /*  .classed(category, true)*/
    .attr('fill', 'none')
/*    .attr('stroke', 'orange')*/
    .attr('stroke', d => barColorScale(category))
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('d', catLine);

  }


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
        .attr('r', ptRadius);
    
  selectableElements = points;
  
    
  svg.call(brush);
    
// Highlight points when brushed
    function brush(g) {
      const brush = d3.brushX() // Create a 2D interactive brush'
        .on("start brush", highlight) // When the brush starts/continues do...
        .on("end", brushEnd) // When the brush ends do...
        .extent([[0, 0], [width, height]]);
        
        
        
        
       /* .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);*/
        
      ourBrush = brush;


      g.call(brush); // Adds the brush to this element
      
      
      let single = false
      let selection = undefined
      


      // Highlight the selected circles
      function highlight() {
        if (d3.event.selection === null) return;
          hideTooltip()
        
        
        const [x0, x1] = d3.event.selection;
        
   /*       const [
            [x0, y0],
            [x1, y1]
          ] = d3.event.selection;*/
        
     /*
        points.classed("selected", d =>
          x0 <= x(d.week)+ptRadius && x(d.week)-ptRadius <= x1 && y0 <= yLeft(d.totalRidership)+ptRadius && yLeft(d.totalRidership)-ptRadius <= y1
        );
        
        if ((x0 - x1 == 0) && (y0 - y1 == 0)) {
          selection = svg.select(".selected")
        } else {
          selection = svg.selectAll(".selected")
        }
         single = (selection.data().length == 1)
         */
         
         
         
         
         points.classed("selected", d =>
          x0 <= x(d.week) && x(d.week) <= x1
        );
        
        
        
        if (x0 - x1 == 0){
          let pos = d3.mouse(this);  
          
          points.classed("selected", d =>
          pos[0] <= x(d.week)+ptRadius && x(d.week)-ptRadius <= pos[0] && pos[1] <= yLeft(d.totalRidership)+ptRadius && yLeft(d.totalRidership)-ptRadius <= pos[1]
          );
          
          selection = svg.select(".selected")
          single = (selection.data().length == 1)
        }
    
    
      }
      
      function brushEnd(){
        // We don't want infinite recursion
        if(d3.event.sourceEvent.type!="end"){
          d3.select(this).call(brush.move, null);
          thisBrush = svg._groups[0][0].__brush
          d3.select(thisBrush).remove()
          
  
          if (single){
            d = selection.data()[0]
            showTooltip(event, `Week: ${d3.timeFormat('%B %d, %Y')(d.week)}<br>Total Ridership: ${d3.format(',')(d.totalRidership)}`);
            
            
            svg.selectAll(".selected")
              .classed("selected", false)
            selection.classed("selected", true)
          }
          
          
          
          let filteredData = svg.selectAll(".selected").data();
          if (filteredData.length == 0) {
            filteredData =  svg.selectAll(".point").data();
          }
          
          console.log('Brushed Data:', filteredData);

          dispatch.call('lineChartUpdate', null, filteredData); // Dispatch brushed dat
          
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








