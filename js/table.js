function drawTable(selector, data, dispatcher) {
    // Remove any existing table to prevent duplicates
    d3.select(selector).selectAll(".table-container").remove();

    const container = d3.select(selector)
        .append("div")
        .attr("class", "table-container")
        .style("overflow", "auto") // Allow scrolling for large tables
        .style("transform-origin", "center top") // For zooming
        .style("transform", "scale(1)"); // Default zoom level

    const table = container
        .append("table")
        .classed("my-table", true);

    // Extract headers from the data keys
    const headers = Object.keys(data[0]);

    // Create table header
    const thead = table.append("thead");
    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d =>
            d
                .split("_") // Format headers to be more readable
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
        );

    // Create table body
    const tbody = table.append("tbody");

    // Function to update table rows based on filtered data
    function updateTable(filteredData) {
        // Bind data to table rows
        const rows = tbody.selectAll("tr")
            .data(filteredData, d => d.year); // Use `year` as the unique identifier for rows

        // Remove old rows
        rows.exit().remove();

        // Append new rows
        const rowsEnter = rows.enter()
            .append("tr");

        // Append cells to rows
        rowsEnter.selectAll("td")
            .data(d => headers.map(key => d[key]))
            .enter()
            .append("td")
            .text(d => (typeof d === "number" ? d.toFixed(2) : d));

        // Update rows with new data
        rowsEnter.merge(rows);
    }

    // Initial rendering of the table
    updateTable(data);

    // Listen for dispatcher updates and filter data
    dispatcher.on("selectionUpdated", selectedYears => {
        const filteredData = data.filter(d => selectedYears.includes(d.year));
        updateTable(filteredData);
    });

    // Mouse and touch zoom functionality
    let zoomLevel = 1;
    const zoomStep = 0.1;
    const maxZoom = 2; // Maximum zoom level
    const minZoom = 0.5; // Minimum zoom level

    function adjustZoom(delta) {
        // Adjust zoom level within the limits
        zoomLevel = Math.min(maxZoom, Math.max(minZoom, zoomLevel + delta));
        container.style("transform", `scale(${zoomLevel})`);
    }

    // Mouse wheel zoom
    container.on("wheel", event => {
        event.preventDefault(); // Prevent default scroll behavior
        const delta = event.deltaY < 0 ? zoomStep : -zoomStep; // Zoom in or out
        adjustZoom(delta);
    });

    // Touch gesture zoom (pinch zoom)
    let initialPinchDistance = null;

    container.on("touchstart", event => {
        if (event.touches.length === 2) {
            // Two-finger touch for pinch zoom
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            initialPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    });

    container.on("touchmove", event => {
        if (event.touches.length === 2 && initialPinchDistance) {
            // Two-finger touch movement
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const currentPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            // Calculate zoom delta based on pinch movement
            const delta = (currentPinchDistance - initialPinchDistance) * 0.001; // Adjust sensitivity
            adjustZoom(delta);
            initialPinchDistance = currentPinchDistance; // Update the distance
        }
    });

    container.on("touchend", () => {
        // Reset initial pinch distance when fingers are lifted
        initialPinchDistance = null;
    });

    return {
        updateSelection: updateTable // Expose for external use
    };
}
