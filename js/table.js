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
        .data(d => headers.map(key => ({ key: key, value: d[key] })))
        .enter()
        .append("td")
        .attr("data-category", d => d.key)
        .text(d => (typeof d.value === "number" ? d.value.toFixed(2) : d.value));


        // Update rows with new data
        rowsEnter.merge(rows);
    }

    // Initial rendering of the table
    updateTable(data);

    // Brushing functionality
    let isMouseDown = false;

    tbody.selectAll("tr")
        .on("mouseover", function () {
            if (isMouseDown) {
                d3.select(this).classed("selected", true);
                updateSelectionFromTable();
            }
            d3.select(this).classed("highlighted", true);
        })
        .on("mouseout", function () {
            d3.select(this).classed("highlighted", false);
        })
        .on("mousedown", function () {
            isMouseDown = true;
            d3.select(this).classed("selected", !d3.select(this).classed("selected"));
            updateSelectionFromTable();
        });

    d3.select("body").on("mouseup", () => {
        isMouseDown = false;
    });

    function updateSelectionFromTable() {
        const selectedData = tbody.selectAll(".selected").data();
        dispatcher.call("selectionUpdated", this, selectedData);
    }
    dispatcher.on("selectionUpdated.table", function (selection) {
        const selectedYears = selection.selectedYears || [];
        const selectedCategories = selection.selectedCategories || [];
    
        // Update row highlighting based on selected years
        tbody.selectAll("tr").classed("selected", d => selectedYears.includes(d.year));
    
        // Update cell highlighting based on selected categories
        tbody.selectAll("tr").selectAll("td")
            .classed("selected", function(d, i) {
                const category = headers[i];
                return selectedCategories.includes(category);
            });
    });

    return {
        updateSelection: function(selection) {
            const selectedYears = selection.selectedYears || [];
            const selectedCategories = selection.selectedCategories || [];
    
            // Update row highlighting
            tbody.selectAll("tr").classed("selected", d => selectedYears.includes(d.year));
    
            // Update cell highlighting
            tbody.selectAll("tr").selectAll("td")
                .classed("selected", function(d, i) {
                    const category = headers[i];
                    return selectedCategories.includes(category);
                });
        }
    };
}
