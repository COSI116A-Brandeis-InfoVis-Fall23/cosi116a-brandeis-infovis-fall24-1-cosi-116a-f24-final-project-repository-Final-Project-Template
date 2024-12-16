document.addEventListener('DOMContentLoaded', function () {
    // Raw data (population counts for each region and category)
    const rawData = [
        { 'region': 'Roslindale', 'series': 'Race', 'type': 'Census', 'White': 15291, 'Black/African-American': 5805, 'Asian': 750, 'Other Races': 8175 },
        { 'region': 'Jamaica Plain', 'series': 'Race', 'type': 'Census', 'White': 22533, 'Black/African-American': 5825, 'Asian': 2004, 'Other Races': 10505 },
        { 'region': 'Roxbury', 'series': 'Race', 'type': 'Census', 'White': 5937, 'Black/African-American': 27243, 'Asian': 1905, 'Other Races': 19076 },
        { 'region': 'Fenway', 'series': 'Race', 'type': 'Census', 'White': 18856, 'Black/African-American': 1810, 'Asian': 7071, 'Other Races': 5752 },
        { 'region': 'Brighton', 'series': 'Race', 'type': 'Census', 'White': 36019, 'Black/African-American': 2379, 'Asian': 8160, 'Other Races': 8739 },
        { 'region': 'West Roxbury', 'series': 'Race', 'type': 'Census', 'White': 22584, 'Black/African-American': 4094, 'Asian': 2500, 'Other Races': 4348 },
        { 'region': 'Hyde Park', 'series': 'Race', 'type': 'Census', 'White': 8719, 'Black/African-American': 18042, 'Asian': 763, 'Other Races': 11400 },
        { 'region': 'South End', 'series': 'Race', 'type': 'Census', 'White': 18044, 'Black/African-American': 3669, 'Asian': 4974, 'Other Races': 5884 },
        { 'region': 'Back Bay', 'series': 'Race', 'type': 'Census', 'White': 13044, 'Black/African-American': 761, 'Asian': 1917, 'Other Races': 2061 },
        { 'region': 'East Boston', 'series': 'Race', 'type': 'Census', 'White': 16011, 'Black/African-American': 1171, 'Asian': 2167, 'Other Races': 27914 },
        { 'region': 'Charlestown', 'series': 'Race', 'type': 'Census', 'White': 14692, 'Black/African-American': 1019, 'Asian': 1613, 'Other Races': 2566 },
        { 'region': 'Downtown', 'series': 'Race', 'type': 'Census', 'White': 10172, 'Black/African-American': 730, 'Asian': 5701, 'Other Races': 1703 },
        { 'region': 'Mission Hill', 'series': 'Race', 'type': 'Census', 'White': 7156, 'Black/African-American': 2662, 'Asian': 3419, 'Other Races': 4149 },
        { 'region': 'Chinatown', 'series': 'Race', 'type': 'Census', 'White': 2528, 'Black/African-American': 167, 'Asian': 3596, 'Other Races': 580 },
        { 'region': 'North End', 'series': 'Race', 'type': 'Census', 'White': 7692, 'Black/African-American': 29, 'Asian': 287, 'Other Races': 741 },
        { 'region': 'West End', 'series': 'Race', 'type': 'Census', 'White': 4436, 'Black/African-American': 463, 'Asian': 706, 'Other Races': 1014 },
        { 'region': 'Beacon Hill', 'series': 'Race', 'type': 'Census', 'White': 8074, 'Black/African-American': 138, 'Asian': 578, 'Other Races': 858 },
        { 'region': 'Mattapan', 'series': 'Race', 'type': 'Census', 'White': 1612, 'Black/African-American': 19821, 'Asian': 499, 'Other Races': 4727 },
        { 'region': 'Dorchester', 'series': 'Race', 'type': 'Census', 'White': 28244, 'Black/African-American': 55787, 'Asian': 12540, 'Other Races': 30338 },
        { 'region': 'South Boston Waterfront', 'series': 'Race', 'type': 'Census', 'White': 3640, 'Black/African-American': 93, 'Asian': 425, 'Other Races': 245 },
        { 'region': 'South Boston', 'series': 'Race', 'type': 'Census', 'White': 28008, 'Black/African-American': 2064, 'Asian': 2070, 'Other Races': 4630 },
        { 'region': 'Allston', 'series': 'Race', 'type': 'Census', 'White': 9839, 'Black/African-American': 1099, 'Asian': 4811, 'Other Races': 3512 },

        { 'region': 'Roslindale', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'Jamaica Plain', 'series': 'Race', 'type': 'MBTA', 'White': 43.47, 'Black/African-American': 39.65, 'Asian': 9.65, 'Other Races': 16.95 },
        { 'region': 'Roxbury', 'series': 'Race', 'type': 'MBTA', 'White': 36.33, 'Black/African-American': 38.75, 'Asian': 17.79, 'Other Races': 13.42 },
        { 'region': 'Fenway', 'series': 'Race', 'type': 'MBTA', 'White': 57.57, 'Black/African-American': 17.88, 'Asian': 17.83, 'Other Races': 14.19 },
        { 'region': 'Brighton', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'West Roxbury', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'Hyde Park', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'South End', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'Back Bay', 'series': 'Race', 'type': 'MBTA', 'White': 60.24, 'Black/African-American': 18.02, 'Asian': 16.37, 'Other Races': 11.73 },
        { 'region': 'East Boston', 'series': 'Race', 'type': 'MBTA', 'White': 58.13, 'Black/African-American': 12.88, 'Asian': 6.63, 'Other Races': 30.32 },
        { 'region': 'Charlestown', 'series': 'Race', 'type': 'MBTA', 'White': 51.65, 'Black/African-American': 21.57, 'Asian': 16.24, 'Other Races': 19.37 },
        { 'region': 'Downtown', 'series': 'Race', 'type': 'MBTA', 'White': 88.47, 'Black/African-American': 33.19, 'Asian': 21.71, 'Other Races': 26.56 },
        { 'region': 'Mission Hill', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'Chinatown', 'series': 'Race', 'type': 'MBTA', 'White': 47.86, 'Black/African-American': 23.33, 'Asian': 22.54, 'Other Races': 13.23 },
        { 'region': 'North End', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'West End', 'series': 'Race', 'type': 'MBTA', 'White': 88.05, 'Black/African-American': 31.3, 'Asian': 22.13, 'Other Races': 18.2 },
        { 'region': 'Beacon Hill', 'series': 'Race', 'type': 'MBTA', 'White': 50.14, 'Black/African-American': 15.17, 'Asian': 15.03, 'Other Races': 24.51 },
        { 'region': 'Mattapan', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'Dorchester', 'series': 'Race', 'type': 'MBTA', 'White': 32.63, 'Black/African-American': 45.38, 'Asian': 13.13, 'Other Races': 14.77 },
        { 'region': 'South Boston Waterfront', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },
        { 'region': 'South Boston', 'series': 'Race', 'type': 'MBTA', 'White': 55.29, 'Black/African-American': 27.13, 'Asian': 11.14, 'Other Races': 12.66 },
        { 'region': 'Allston', 'series': 'Race', 'type': 'MBTA', 'White': 0.0, 'Black/African-American': 0.0, 'Asian': 0.0, 'Other Races': 0.0 },

        { 'region': 'Roslindale', 'series': 'Age', 'type': 'Census', '0-18': 5979, '19-34': 6865, '35-64': 11224, '65+': 5953 },
        { 'region': 'Jamaica Plain', 'series': 'Age', 'type': 'Census', '0-18': 6621, '19-34': 13960, '35-64': 13387, '65+': 6899 },
        { 'region': 'Roxbury', 'series': 'Age', 'type': 'Census', '0-18': 11846, '19-34': 17728, '35-64': 15564, '65+': 9023 },
        { 'region': 'Fenway', 'series': 'Age', 'type': 'Census', '0-18': 699, '19-34': 26568, '35-64': 3981, '65+': 2241 },
        { 'region': 'Brighton', 'series': 'Age', 'type': 'Census', '0-18': 5275, '19-34': 30631, '35-64': 11485, '65+': 7906 },
        { 'region': 'West Roxbury', 'series': 'Age', 'type': 'Census', '0-18': 6895, '19-34': 6381, '35-64': 11182, '65+': 9068 },
        { 'region': 'Hyde Park', 'series': 'Age', 'type': 'Census', '0-18': 8288, '19-34': 8827, '35-64': 13392, '65+': 8417 },
        { 'region': 'South End', 'series': 'Age', 'type': 'Census', '0-18': 3965, '19-34': 11389, '35-64': 10922, '65+': 6295 },
        { 'region': 'Back Bay', 'series': 'Age', 'type': 'Census', '0-18': 1169, '19-34': 8398, '35-64': 4893, '65+': 3323 },
        { 'region': 'East Boston', 'series': 'Age', 'type': 'Census', '0-18': 9176, '19-34': 15775, '35-64': 16270, '65+': 6042 },
        { 'region': 'Charlestown', 'series': 'Age', 'type': 'Census', '0-18': 3974, '19-34': 5789, '35-64': 6824, '65+': 3303 },
        { 'region': 'Downtown', 'series': 'Age', 'type': 'Census', '0-18': 1507, '19-34': 8249, '35-64': 4923, '65+': 3627 },
        { 'region': 'Mission Hill', 'series': 'Age', 'type': 'Census', '0-18': 1485, '19-34': 10023, '35-64': 3163, '65+': 2715 },
        { 'region': 'Chinatown', 'series': 'Age', 'type': 'Census', '0-18': 728, '19-34': 3240, '35-64': 1898, '65+': 1007 },
        { 'region': 'North End', 'series': 'Age', 'type': 'Census', '0-18': 509, '19-34': 5227, '35-64': 1818, '65+': 1195 },
        { 'region': 'West End', 'series': 'Age', 'type': 'Census', '0-18': 422, '19-34': 2645, '35-64': 2168, '65+': 1384 },
        { 'region': 'Beacon Hill', 'series': 'Age', 'type': 'Census', '0-18': 862, '19-34': 4564, '35-64': 2540, '65+': 1682 },
        { 'region': 'Mattapan', 'series': 'Age', 'type': 'Census', '0-18': 6568, '19-34': 6157, '35-64': 9031, '65+': 4903 },
        { 'region': 'Dorchester', 'series': 'Age', 'type': 'Census', '0-18': 28122, '19-34': 39249, '35-64': 38890, '65+': 20648 },
        { 'region': 'South Boston Waterfront', 'series': 'Age', 'type': 'Census', '0-18': 189, '19-34': 2081, '35-64': 1546, '65+': 587 },
        { 'region': 'South Boston', 'series': 'Age', 'type': 'Census', '0-18': 4661, '19-34': 17242, '35-64': 10206, '65+': 4663 },
        { 'region': 'Allston', 'series': 'Age', 'type': 'Census', '0-18': 740, '19-34': 15405, '35-64': 2307, '65+': 809 },

        { 'region': 'Roslindale', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'Jamaica Plain', 'series': 'Age', 'type': 'MBTA', '0-18': 7.42, '19-34': 59.95, '35-64': 31.07, '65+': 1.56 },
        { 'region': 'Roxbury', 'series': 'Age', 'type': 'MBTA', '0-18': 8.64, '19-34': 67.99, '35-64': 22.18, '65+': 1.18 },
        { 'region': 'Fenway', 'series': 'Age', 'type': 'MBTA', '0-18': 2.74, '19-34': 69.29, '35-64': 25.68, '65+': 2.27 },
        { 'region': 'Brighton', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'West Roxbury', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'Hyde Park', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'South End', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'Back Bay', 'series': 'Age', 'type': 'MBTA', '0-18': 2.19, '19-34': 70.03, '35-64': 25.24, '65+': 3.16 },
        { 'region': 'East Boston', 'series': 'Age', 'type': 'MBTA', '0-18': 4.59, '19-34': 60.61, '35-64': 32.47, '65+': 2.33 },
        { 'region': 'Charlestown', 'series': 'Age', 'type': 'MBTA', '0-18': 7.42, '19-34': 63.74, '35-64': 28.13, '65+': 0.72 },
        { 'region': 'Downtown', 'series': 'Age', 'type': 'MBTA', '0-18': 3.49, '19-34': 44.97, '35-64': 47.61, '65+': 3.93 },
        { 'region': 'Mission Hill', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'Chinatown', 'series': 'Age', 'type': 'MBTA', '0-18': 1.58, '19-34': 62.97, '35-64': 33.43, '65+': 2.0 },
        { 'region': 'North End', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'West End', 'series': 'Age', 'type': 'MBTA', '0-18': 2.13, '19-34': 93.5, '35-64': 49.33, '65+': 5.03 },
        { 'region': 'Beacon Hill', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 47.01, '35-64': 52.06, '65+': 0.93 },
        { 'region': 'Mattapan', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'Dorchester', 'series': 'Age', 'type': 'MBTA', '0-18': 8.96, '19-34': 63.45, '35-64': 26.12, '65+': 1.47 },
        { 'region': 'South Boston Waterfront', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 },
        { 'region': 'South Boston', 'series': 'Age', 'type': 'MBTA', '0-18': 2.7, '19-34': 62.26, '35-64': 32.3, '65+': 2.74 },
        { 'region': 'Allston', 'series': 'Age', 'type': 'MBTA', '0-18': 0.0, '19-34': 0.0, '35-64': 0.0, '65+': 0.0 }
    ];

    const censusData = rawData.filter(d => d.type === "Census");
    const mbtaData = rawData.filter(d => d.type === "MBTA");

    document.addEventListener("regionSelected", function (e) {
        const selectedRegions = e.detail;
        updateChart(selectedRegions); // Use the existing updateChart function
    });

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
        .select("#stacked-bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Tooltip div
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip") // Ensure it's styled properly
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // Keys for stacking
    const seriesKeys = {
        Age: ["0-18", "19-34", "35-64", "65+"],
        Race: ["White", "Black/African-American", "Asian", "Other Races"],
    };

    let currentSeries = "Age"; // Default series
    let keys = seriesKeys[currentSeries]; // Default keys

    document.getElementById("age-btn").addEventListener("click", () => {
        currentSeries = "Age";
        keys = seriesKeys[currentSeries];
        updateChart(censusData.map(d => d.region)); // Re-render chart
        updateLegend();
    });

    document.getElementById("race-btn").addEventListener("click", () => {
        currentSeries = "Race";
        keys = seriesKeys[currentSeries];
        updateChart(censusData.map(d => d.region)); // Re-render chart
        updateLegend();
    });

    // Create scales
    const xScale = d3.scaleBand().range([0, width]).padding(0.2).domain(["Selected Regions"]); // Single bar
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, 100]); // Fixed Y-Axis domain [0, 100]

    // Add axes
    const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
    const yAxis = svg.append("g");

    // Function to aggregate and normalize data
    function aggregateData(selectedRegions, dataset) {
        if (selectedRegions.length === 0) return null;

        // Filter dataset by the current series. ADDEDDDDD
        const filteredData = dataset.filter(d => d.series === currentSeries);
        // Aggregate values for the selected keys
        const aggregated = keys.reduce((acc, key) => {
            acc[key] = selectedRegions.reduce(
                (sum, region) => sum + (filteredData.find(d => d.region === region)?.[key] || 0),
                0
            );
            return acc;
        }, {});

        // Calculate total population
        const totalPopulation = Object.values(aggregated).reduce((sum, value) => sum + value, 0);

        // Normalize to percentages
        return keys.map(key => ({
            key,
            percentage: (aggregated[key] / totalPopulation) * 100,
            breakdown: selectedRegions.map(region => ({
                region,
                population: dataset.find(d => d.region === region)[key],
            })),
        }));
    }

    // Define hard-coded colors for Age and Race
    const ageColors = ["#ccf9ff", "	#55d0ff", "#00acdf", "#0080bf"]; // Gradient-like blues for Age
    const raceColors = ["#ff4500", "#ffa500", "#32cd32", "#4682b4"]; // Specific colors for Race

    // Combine Age and Race colors into one scale
    const colorScale = d3.scaleOrdinal()
        .domain([...seriesKeys.Age, ...seriesKeys.Race])
        .range([...ageColors, ...raceColors]);

    // Function to update the chart
    function updateChart(selectedRegions) {
        const aggregatedCensus = aggregateData(selectedRegions, censusData);
        const aggregatedMBTA = aggregateData(selectedRegions, mbtaData);

        if (!aggregatedCensus || !aggregatedMBTA) {
            svg.selectAll(".layer").remove();
            xAxis.call(d3.axisBottom(xScale));
            yAxis.call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
            return;
        }

        // Combine Census and MBTA data into a single array
        const combinedData = {
            Census: aggregatedCensus.reduce((acc, d) => {
                acc[d.key] = d.percentage;
                return acc;
            }, {}),
            MBTA: aggregatedMBTA.reduce((acc, d) => {
                acc[d.key] = d.percentage;
                return acc;
            }, {}),
        };

        const stackedData = d3.stack().keys(keys)([
            combinedData.Census,
            combinedData.MBTA,
        ]);

        // Update x-axis domain
        xScale.domain(["Census", "MBTA"]);
        xAxis.call(d3.axisBottom(xScale));
        yAxis.call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));

        // Bind data to layers
        const layers = svg.selectAll(".layer").data(stackedData);

        layers.enter()
            .append("g")
            .attr("class", "layer")
            .merge(layers)
            .attr("fill", d => colorScale(d.key)) // Use hard-coded colorScale
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(["Census", "MBTA"][i]))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth());

        const newLayers = layers
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("fill", d => colorScale(d.key));

        layers.merge(newLayers)
            .each(function (layerData, layerIndex) {
                const layer = d3.select(this);

                const rects = layer.selectAll("rect").data(layerData);

                rects
                    .enter()
                    .append("rect")
                    .merge(rects)
                    .attr("x", (d, i) => xScale(["Census", "MBTA"][i]))
                    .attr("y", d => (d[1] !== undefined ? yScale(d[1]) : yScale(0))) // Safeguard against undefined values
                    .attr("height", d => (d[0] !== undefined && d[1] !== undefined ? yScale(d[0]) - yScale(d[1]) : 0)) // Prevent NaN height
                    .attr("width", xScale.bandwidth())
                    .on("mouseover", function (d, i) {
                        const ageCategory = keys[layerIndex];
                        const percentage = ((d[1] - d[0]) || 0).toFixed(2); // Avoid NaN%

                        // Ensure breakdown is valid
                        const breakdown = combinedData[["Census", "MBTA"][i]]?.breakdown || [];

                        // Build and display the tooltip content
                        const tooltipContent = `
                            <strong>Age Group:</strong> ${ageCategory}<br>
                            <strong>Percentage:</strong> ${percentage}%<br>
                        `;

                        tooltip
                            .html(tooltipContent)
                            .style("visibility", "visible")
                            .style("top", `${d3.event.pageY + 10}px`)
                            .style("left", `${d3.event.pageX + 10}px`);
                    })
                    .on("mousemove", function () {
                        // Dynamically position the tooltip near the cursor
                        tooltip
                            .style("top", `${d3.event.pageY + 10}px`)
                            .style("left", `${d3.event.pageX + 10}px`);
                    })
                    .on("mouseout", function () {
                        // Hide the tooltip when the mouse leaves the bar
                        tooltip.style("visibility", "hidden");
                    });

                rects.exit().remove();
            });

        layers.exit().remove();
    }

    // Initial chart rendering with all regions
    updateChart(censusData.map(d => d.region));
    updateLegend();

    function updateLegend() {
        // Remove any existing legend items
        svg.select(".legend").remove();

        // Append a new legend container
        const legend = svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(50, ${height + 30})`); // Position the legend below the chart

        // Bind the keys array to legend items
        const legendItems = legend
            .selectAll(".legend-item")
            .data(keys)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${i * 180}, 0)`); // Adjust horizontal spacing

        // Append color rectangles for the legend
        legendItems
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => colorScale(d));

        // Append text labels to the legend
        legendItems
            .append("text")
            .attr("x", 20) // Space the text from the rectangle
            .attr("y", 12) // Align text vertically with the rectangle
            .text(d => d)
            .style("font-size", "12px")
            .style("fill", "black");
    }

});
