legendMaker = g => {
    const x = d3.scaleLinear()
        .domain(d3.extent(color.domain()))
        .rangeRound([0, 260]);
  
    g.selectAll("rect")
      .data(color.range().map(d => color.invertExtent(d)))
      .join("rect")
        .attr("height", 8)
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("fill", d => color(d[0]));
  
    g.append("text")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Unemployment Rate");
  
    g.call(
      d3.axisBottom(x)
        .tickValues(getTickValues(color))
      )
      .select(".domain")
      .remove();
  }