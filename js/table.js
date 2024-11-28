function drawTable(selector, data) {
    const table = d3.select(selector)
        .append("table")
        .classed("my-table", true);

    const headers = Object.keys(data[0]).slice(0, -1);

    const thead = table.append("thead");
    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d =>
            d
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
        );

    const tbody = table.append("tbody");
    const rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

   rows.selectAll("td")
        .data(d => headers.map(key => {
            const value = d[key];
            return typeof value === "number" ? value.toFixed(4) : value;
        }))
        .enter()
        .append("td")
        .text(d => d);
        
    // Dispatcher method to get or set the dispatcher
    function setDispatcher(_) {
        if (!arguments.length) return dispatcher;
        dispatcher = _;
        return this;
    }

    // Return the chart function with dispatcher integration
    return {
        setDispatcher: setDispatcher
    };
}

