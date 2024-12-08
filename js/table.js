function drawTable(selector, data, dispatcher) {
    d3.select(selector).selectAll(".table-container").remove();

    const container = d3.select(selector)
        .append("div")
        .attr("class", "table-container")
        .style("overflow", "auto") 
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
        const rows = tbody.selectAll("tr")
            .data(filteredData, d => d.year);

        rows.exit().remove();

        const rowsEnter = rows.enter().append("tr");

        rowsEnter.selectAll("td")
            .data(d => headers.map(key => d[key]))
            .enter()
            .append("td")
            .text(d => (typeof d === "number" ? d.toFixed(2) : d))
            .on("click", function(d, i) {
                const categoryKey = headers[i];
                // Only trigger highlight if it's not the 'Year' column
                if (categoryKey.toLowerCase() !== "year") {
                    dispatcher.call("categoryHighlighted", this, categoryKey);
                }
            });

        rowsEnter.merge(rows);
    }

    // Initial rendering of the table
    updateTable(data);

    // Listen for selection updates and filter data
    dispatcher.on("selectionUpdated", selectedYears => {
        const filteredData = data.filter(d => selectedYears.includes(d.year));
        updateTable(filteredData);
    });

    // Zooming and panning functionality
    let zoomLevel = 1;
    const zoomStep = 0.1;
    const maxZoom = 2;
    const minZoom = 0.5;

    function adjustZoom(delta) {
        zoomLevel = Math.min(maxZoom, Math.max(minZoom, zoomLevel + delta));
        container.style("transform", `scale(${zoomLevel})`);
    }

    // Mouse wheel zoom
    container.on("wheel", function() {
        d3.event.preventDefault();
        const delta = d3.event.deltaY < 0 ? zoomStep : -zoomStep;
        adjustZoom(delta);
    });

    // Touch gesture zoom (pinch zoom)
    let initialPinchDistance = null;

    container.on("touchstart", function() {
        if (d3.event.touches.length === 2) {
            const touch1 = d3.event.touches[0];
            const touch2 = d3.event.touches[1];
            initialPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    });

    container.on("touchmove", function() {
        if (d3.event.touches.length === 2 && initialPinchDistance) {
            const touch1 = d3.event.touches[0];
            const touch2 = d3.event.touches[1];
            const currentPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            const delta = (currentPinchDistance - initialPinchDistance) * 0.001;
            adjustZoom(delta);
            initialPinchDistance = currentPinchDistance;
        }
    });

    container.on("touchend", function() {
        initialPinchDistance = null;
    });

    return {
        updateSelection: updateTable
    };
}