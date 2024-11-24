function drawTable(selector, data) {
    const table = d3.select(selector)
        .append("table")
        .classed("my-table", true);

    const headers = Object.keys(data[0]);

    const thead = table.append("thead");
    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d => d);

    const tbody = table.append("tbody");
    const rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    rows.selectAll("td")
        .data(d => headers.map(key => d[key]))
        .enter()
        .append("td")
        .text(d => d);
}

