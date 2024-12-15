((() => {
  d3.json("data/DoD_Budget.json", (data) => {
    var dispatchString = "selectionUpdated";

    // Create the table and heatmap instances
    let tableData = table()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#table", data);

    let heatmapData = map()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#map", data);

    // When the table is updated via brushing, update the heatmap
    tableData.selectionDispatcher().on(dispatchString, function(selectedData) {
    // heatmapData.updateSelection(selectedData.map(d => d.State)); // Ensure proper mapping
      heatmapData.updateSelection(selectedData);
    });

    // When the heatmap is updated via brushing, update the table
    heatmapData.selectionDispatcher().on(dispatchString, function(selectedData) {
      tableData.updateSelection(selectedData);
    });
  });
}))();
