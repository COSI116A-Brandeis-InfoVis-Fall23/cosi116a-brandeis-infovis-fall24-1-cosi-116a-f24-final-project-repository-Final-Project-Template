function bubbleChart() {


    let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 20
      },
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      xValue = d => d[0],
      yValue = d => d[1],
      xLabelText = "",
      yLabelText = "",
      yLabelOffsetPx = 0,
      xScale = d3.scaleLinear(),
      yScale = d3.scaleLinear(),
      ourBrush = null,
      selectableElements = d3.select(null),
      dispatcher;

      
}