(() => {
  // Load the data from a JSON file
  d3.json("data/data.json", (error, data) => {
      if (error) {
          console.error("Error loading data:", error);
          return;
      }

    //   // Process the data if necessary (e.g., parsing dates)
    //   data.forEach(d => {
    //       d.date = new Date(d.date); // Example: parse date fields
    //   });

      // Call the function to render the table
      drawTable("#tablet", data);

      // Call the function to render the stacked line chart
      drawStackedLineChart("#stacked-linechart", data);
  });
})();
