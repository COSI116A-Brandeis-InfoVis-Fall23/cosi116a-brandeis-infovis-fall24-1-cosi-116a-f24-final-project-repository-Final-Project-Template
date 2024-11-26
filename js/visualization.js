document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM is fully loaded and parsed!");
    var svg = d3.select("svg");
    var path = d3.geoPath();
    var colorScale;
  
    // State name to FIPS code mapping
    const stateNameToFips = {
        'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05', 'California': '06',
        'Colorado': '08', 'Connecticut': '09', 'Delaware': '10', 'Florida': '12', 'Georgia': '13',
        'Hawaii': '15', 'Idaho': '16', 'Illinois': '17', 'Indiana': '18', 'Iowa': '19',
        'Kansas': '20', 'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
        'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28', 'Missouri': '29',
        'Montana': '30', 'Nebraska': '31', 'Nevada': '32', 'New Hampshire': '33', 'New Jersey': '34',
        'New Mexico': '35', 'New York': '36', 'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39',
        'Oklahoma': '40', 'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
        'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49', 'Vermont': '50',
        'Virginia': '51', 'Washington': '53', 'West Virginia': '54', 'Wisconsin': '55', 'Wyoming': '56'
    };
  
    // Create reverse mapping (FIPS to state name)
    const fipsToStateName = {};
    for (let state in stateNameToFips) {
        fipsToStateName[stateNameToFips[state]] = state;
    }
  
    // Load both files using d3.v4 syntax
    d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .defer(d3.csv, "data/updated_data.csv")
        .await(function(error, us, csvData) {
            if (error) {
                console.error("Error loading data:", error);
                return;
            }
  
            // Process the data
            var dataMap = {};
            csvData.forEach(d => {
                const fips = stateNameToFips[d.State];
                if (!fips) {
                    console.warn(`Skipping: ${d.State}`);
                    return;
                }
  
                if (!dataMap[fips]) dataMap[fips] = {};
                dataMap[fips][d.Year] = {
                    mortgage: +d["Mortgage/Income (%)"] / 100,
                    rent: +d["Rent/Income (%)"] / 100,
                    income: +d["Median Income"]
                };
            });
  
            // Draw the base map
            svg.append("g")
                .attr("class", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "state-path")
                .attr("fill", "#ccc")
                .attr("stroke", "#fff");
  
            // Draw state borders
            svg.append("path")
                .attr("class", "state-borders")
                .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)))
                .attr("fill", "none")
                .attr("stroke", "#fff");
  
            function createDetailedTooltip(d, selectedYear) {
                var stateData = dataMap[d.id] && dataMap[d.id][selectedYear];
                
                if (!stateData) return '';
  
                const stateName = fipsToStateName[d.id] || 'Unknown State';
                const mortgageValue = (stateData.mortgage * 100).toFixed(1);
                const rentValue = (stateData.rent * 100).toFixed(1);
                const incomeValue = Math.round(stateData.income).toLocaleString();
                
                return `
                   <div class="tooltip-container">
            <div class="tooltip-state-header">
                <strong class="tooltip-state-name">${stateName}</strong>
                <span class="tooltip-year">${selectedYear}</span>
            </div>
            <div class="tooltip-state-details">
                <div class="tooltip-metric-row">
                    <span class="tooltip-metric-label">Median Income:</span>
                    <span class="tooltip-metric-value">$${stateData.income.toLocaleString()}</span>
                </div>
                <div class="tooltip-metric-row">
                    <span class="tooltip-metric-label">Mortgage Burden:</span>
                    <span class="tooltip-metric-value">${(stateData.mortgage * 100).toFixed(1)}%</span>
                </div>
                <div class="tooltip-metric-row">
                    <span class="tooltip-metric-label">Rent Burden:</span>
                    <span class="tooltip-metric-value">${(stateData.rent * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>
                `;
            }
  
            function updateMap() {
                var selectedYear = d3.select("#yearSelect").property("value");
                var selectedMetric = d3.select("#costBurden").property("value");
                
                // Get valid values for the selected metric and year
                var values = [];
                for (let fips in dataMap) {
                    if (dataMap[fips][selectedYear] && dataMap[fips][selectedYear][selectedMetric] != null) {
                        values.push(dataMap[fips][selectedYear][selectedMetric]);
                    }
                }
  
                if (values.length === 0) {
                    console.warn("No data for selected year and metric");
                    return;
                }
  
                var minValue = d3.min(values);
                var maxValue = d3.max(values);
  
                // Create color scale based on metric
                if (selectedMetric === 'income') {
                    colorScale = d3.scaleLinear()
                        .domain([minValue, maxValue])
                        .range(["#f7fbff", "#084594"]); // Light to dark blue
                } else {
                    colorScale = d3.scaleLinear()
                        .domain([minValue, maxValue])
                        .range(["#fcfafd", "#54278f"]); // Light to dark purple
                }
  
                // Update colors
                svg.selectAll(".state-path")
                    .transition()
                    .duration(750)
                    .style("fill", function(d) {
                        if (!dataMap[d.id] || !dataMap[d.id][selectedYear]) {
                            return "#ccc";
                        }
                        var value = dataMap[d.id][selectedYear][selectedMetric];
                        return value != null ? colorScale(value) : "#ccc";
                    });
  
                // Update tooltips
                svg.selectAll(".state-path")
                    .on("mouseover", function(d) {
                        d3.select(this)
                            .style("opacity", 0.8);
  
                        d3.select("#tooltip")
                            .style("opacity", 1)
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 10) + "px")
                            .html(createDetailedTooltip(d, selectedYear));
                    })
                    .on("mousemove", function() {
                        d3.select("#tooltip")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 10) + "px");
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .style("opacity", 1);
                        d3.select("#tooltip")
                            .style("opacity", 0);
                    });
            }
  
            // Add event listeners
            d3.select("#yearSelect").on("change", updateMap);
            d3.select("#costBurden").on("change", updateMap);
  
            // Initial render
            updateMap();
            renderBarAndLineCharts();
        });
        function renderBarAndLineCharts() {
            const dataPath = "data/bar_line_chart_data.csv"; // 数据路径
        
            // 图表尺寸和边距
            const margin = { top: 40, right: 30, bottom: 50, left: 50 };
            const width = 600 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;
        
            // 颜色映射
            const color = d3.scaleOrdinal()
                .domain(['Mortgage', 'Rent'])
                .range(['#3b7cc5', '#f1be84']);
        
            // 加载数据
            d3.csv(dataPath, function (error, rawData) {
                if (error) {
                    console.error("Error loading CSV data:", error);
                    return;
                }
        
                // 格式化数据
                const data = rawData.map(d => ({
                    Year: d.Year,
                    Mortgage: +d.Mortgage,
                    Rent: +d.Rent,
                    Income: +d.Income,
                }));
        
                // === 柱状图 ===
                const xBar = d3.scaleBand()
                    .domain(data.map(d => d.Year)) // X轴为年份
                    .range([0, width])
                    .padding(0.2);
        
                const yBar = d3.scaleLinear()
                    .domain([0, d3.max(data, d => Math.max(d.Mortgage, d.Rent))]) // Y轴为百分比
                    .range([height, 0]);
        
                const barSvg = d3.select("#bar-chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
                // 添加柱状图标题
                barSvg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", width / 2)
                    .attr("y", -margin.top / 2)
                    .attr("text-anchor", "middle")
                    .text("Bar Chart: Mortgage and Rent as Percentage of Income");
        
                // 绘制每组柱状
                ['Mortgage', 'Rent'].forEach((key, i) => {
                    barSvg.selectAll(`.bar-${key}`)
                        .data(data)
                        .enter().append("rect")
                        .attr("class", `bar-${key}`)
                        .attr("x", d => xBar(d.Year) + (i * xBar.bandwidth() / 2))
                        .attr("y", d => yBar(d[key]))
                        .attr("width", xBar.bandwidth() / 2)
                        .attr("height", d => height - yBar(d[key]))
                        .attr("fill", color(key));
                });
        
                // 添加 X 和 Y 轴
                barSvg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(xBar));
        
                barSvg.append("g")
                    .call(d3.axisLeft(yBar).tickFormat(d => `${d}%`));
        
                // === 散点图（替代折线图） ===
                const xLine = d3.scalePoint()
                    .domain(data.map(d => d.Year)) // X轴为年份
                    .range([0, width]);
        
                const yLine = d3.scaleLinear()
                    .domain([0, d3.max(data, d => Math.max(d.Mortgage, d.Rent))]) // Y轴为百分比
                    .range([height, 0]);
        
                const scatterSvg = d3.select("#line-chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
                // 添加散点图标题
                scatterSvg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", width / 2)
                    .attr("y", -margin.top / 2)
                    .attr("text-anchor", "middle")
                    .text("Scatter Chart: Mortgage and Rent Trends Over Years");
        
                // 绘制散点
                ['Mortgage', 'Rent'].forEach((key, i) => {
                    scatterSvg.selectAll(`.dot-${key}`)
                        .data(data)
                        .enter().append("circle")
                        .attr("class", `dot-${key}`)
                        .attr("cx", d => xLine(d.Year))
                        .attr("cy", d => yLine(d[key]))
                        .attr("r", 5)
                        .attr("fill", color(key))
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1);
                });
        
                // 添加 X 和 Y 轴
                scatterSvg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(xLine));
        
                scatterSvg.append("g")
                    .call(d3.axisLeft(yLine).tickFormat(d => `${d}%`));
        
// === Brush & Link ===
const brush = d3.brushX()
    .extent([[0, 0], [width, height]]) // Brush 的范围
    .on("brush end", function(event) {
        console.log("Event:", event);
        console.log("Selection:", event.selection);
        // 检查是否有选区
        const selection = event.selection;
        if (!selection) {
            console.log("No selection made");
            return;
        }
                // 映射选区范围到年份
                const [x0, x1] = selection.map(x => xScalePointToYear(x, xLine));
                console.log("Brush range in years:", x0, x1);
        
                // 根据选区范围筛选数据并更新右侧图表
                const filteredData = data.filter(d => d.Year >= x0 && d.Year <= x1);
                scatterSvg.selectAll(".dot")
                    .attr("fill", d => filteredData.includes(d) ? "red" : "blue");
            });
        
                // 在柱状图上添加 Brush
                barSvg.append("g")
                    .attr("class", "brush")
                    .call(brush);
            });
        }
        
        });
            
    