// Immediately Invoked Function Expression to limit access to our 
// variables and prevent race conditions
((() => {

    // Load the data from a json file (you can make these using
    // JSON.stringify(YOUR_OBJECT), just remove the surrounding "")
    d3.json("data/comparisonByYear.json", (data) => {
  
      // General event type for selections, used by d3-dispatch
      // https://github.com/d3/d3-dispatch
      const dispatchString = "selectionUpdated";
      let yearSelected = "2017";
      let allData = data;
      let currData = allData[yearSelected];

      function updateYear(year) {
        yearSelected = year;
        currData = allData[yearSelected];

        d3.select("table").remove();
        let tableData = table()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#table", currData);

      }


      let tableData = table()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#table", currData);

      /*let bcData = bubbleChart()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#bubble-chart", data["2007"]);
      */

      
      let bcData = bubbleChart()
       .x(d => d["gdp"])
       .xLabel("GDP Per Capita")
       .y(d => d["Rating"])
       .yLabel("Transportation Rating")
       .yLabelOffset(150)
       .selectionDispatcher(d3.dispatch(dispatchString))
       ("#scatterplot", currData);
      

       // Add event listeners to the buttons
       document.getElementById("2007").addEventListener("click", () => updateYear("2007"));
       document.getElementById("2008").addEventListener("click", () => updateYear("2008"));
       document.getElementById("2009").addEventListener("click", () => updateYear("2009"));
       document.getElementById("2010").addEventListener("click", () => updateYear("2010"));
       document.getElementById("2011").addEventListener("click", () => updateYear("2011"));
       document.getElementById("2012").addEventListener("click", () => updateYear("2012"));
       document.getElementById("2013").addEventListener("click", () => updateYear("2013"));
       document.getElementById("2014").addEventListener("click", () => updateYear("2014"));
       document.getElementById("2015").addEventListener("click", () => updateYear("2015"));
       document.getElementById("2016").addEventListener("click", () => updateYear("2016"));
       document.getElementById("2017").addEventListener("click", () => updateYear("2017"));
    });
})());
    