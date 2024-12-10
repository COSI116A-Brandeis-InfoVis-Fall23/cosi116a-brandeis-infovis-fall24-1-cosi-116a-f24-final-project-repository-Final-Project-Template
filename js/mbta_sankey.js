/* To create the Parallel diagram, we used the following articles as refrence: 
 1) From Graphing Libraries --> https://plotly.com/python/sankey-diagram/ 
 2) Join.js --> https://www.jointjs.com/demos/sankey-diagram?utm_term=sankey%20diagram%20javascript&utm_campaign=Search+Ads+%7C+Worldwide+%7C+React+Diagram+KWs&utm_source=adwords&utm_medium=ppc&hsa_acc=9744511829&hsa_cam=20933992049&hsa_grp=157792034379&hsa_ad=687381533216&hsa_src=g&hsa_tgt=kwd-2270153174793&hsa_kw=sankey%20diagram%20javascript&hsa_mt=p&hsa_net=adwords&hsa_ver=3&gad_source=1&gclid=CjwKCAiAxqC6BhBcEiwAlXp45yGly8LxM4gy1iRcovKJb71jU_Mn0yyHWT6eNesi5VSTqGrlm6hRpBoCs9kQAvD_BwE
 
 Information above also Included in the Acknowledgments portion of the html file.

The sankey diagram structure needs:
    ~Nodes: in our case this will be the fuel type and modes of transportation
    ~Links: the connection between the nodes wich will be the miles traveled

   Also included node mapping because I kep getting "d3-sankey.min.js:2 Uncaught Error: missing: Diesel" 
*/

// Global variables to store the current brushing selection and fuel types.
window.currentBrushSelection = [];
window.selectedFuelTypes = [];

/// Loads the data.
d3.json("data/Fuel_and_Energy_cleaned.json").then(dataset => {
    const nodeMap = new Map();
    let nodeIndex = 0;

    dataset.forEach(row => {
        const fuelSource = row.Fuel_Source.trim();
        const mode = row.Mode.trim();

        if (!nodeMap.has(fuelSource)) {
            nodeMap.set(fuelSource, nodeIndex++);
        }
        if (!nodeMap.has(mode)) {
            nodeMap.set(mode, nodeIndex++);
        }
    });

    const nodes = Array.from(nodeMap.keys()).map(name => ({ name }));

    // Aggregates Miles_Traveled.
    const linksMap = {};
    dataset.forEach(row => {
        const sourceIndex = nodeMap.get(row.Fuel_Source.trim());
        const targetIndex = nodeMap.get(row.Mode.trim());

        if (sourceIndex === undefined || targetIndex === undefined) {
            console.error("Invalid source or target mapping:", row);
            return; 
        }

        const key = `${sourceIndex}->${targetIndex}`;
        if (!linksMap[key]) {
            linksMap[key] = { source: sourceIndex, target: targetIndex, value: 0 };
        }
        linksMap[key].value += row.Miles_Traveled;
    });

    const links = Object.values(linksMap);
    const sankeyData = { nodes, links };
    renderSankey(sankeyData);
});

// Function to render the diagram.
function renderSankey(data) {
    const margin = { top: 20, right: 200, bottom: 50, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3
        .select("#sankey-diagram")
        .append("svg")
        .attr("width", width + margin.left + margin.right) 
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const sankey = d3
        .sankey()
        .nodeWidth(20)
        .nodePadding(15)
        .size([width, height]);

    const sankeyData = sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links.map(d => Object.assign({}, d))
    });

     // Tooltip for details on demand.
     const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .text("a simple tooltip");

    // Define custom colors for nodes, used the same color scheme as the line chart.
    const nodeColors = {
        "Diesel": "#FF0000", 
        "Gasoline": "#1E90FF", 
        "Electric Propulsion": "#008000", 
        "Compressed Natural Gas": "#FFA500",
        "Other Fuel": "#8A2BE2", 
    };

    // Draws the links
    svg
        .append("g")
        .selectAll("path")
        .data(sankeyData.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .style("fill", "none")
        .style("stroke", d => {
            const sourceNode = d.source;
            if (sourceNode && sourceNode.name) {
                const sourceColor = nodeColors[sourceNode.name];
                if (sourceColor) {
                    const transparentColor = d3.color(sourceColor);
                    // Set the links to be the same color as the nodes but more transparent so overlapping links are visible.
                    // transparentColor.opacity = 0.5.
                    return transparentColor;
                }
            }
        })
        .style("opacity", d => {
            return (window.currentBrushSelection.length > 0) ?
                (window.currentBrushSelection.includes(d.source.name) ? 1 : 0.2) :
                0.5; 
        })
        .on('mouseover', function (event, d) {
            // Show tooltip and highlight link.
            const milesInMillions = (d.value / 1e6).toFixed(1);
            const tooltipMiles = `${milesInMillions}M`;
            d3.select(this).style('opacity', 1);
            tooltip.html(
                `<strong>Miles Traveled:</strong> ${tooltipMiles}<br>
                 <strong>Fuel Source:</strong> ${d.source.name}<br>
                 <strong>Mode:</strong> ${d.target.name}`
            ).style("visibility", "visible");
        })
        .on("mousemove", function(event) {
            tooltip.style("top", `${event.pageY - 100}px`)
                   .style("left", `${event.pageX - 100}px`);
        })
        .on('mouseout', function (event, d) {
            // Reset opacity based on brushing selection.
            const opacity = (window.currentBrushSelection.length > 0) ?
                (window.currentBrushSelection.includes(d.source.name) ? 1 : 0.2) :
                0.5;
            d3.select(this).style('opacity', opacity);
            tooltip.style("visibility", "hidden");
        });
          

    // Draws the nodes.
    svg
        .append("g")
        .selectAll("rect")
        .data(sankeyData.nodes)
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", d => nodeColors[d.name] || "#ccc")
        .style("stroke", "#000")
        .style("opacity", d => {
        return (window.currentBrushSelection.length > 0) ?
         (window.currentBrushSelection.includes(d.name) ? 1 : 0.2) :1;})
        .on('mouseover', function (event, d) {
            d3.select(this).style('opacity', 1);
            tooltip.html(`<strong>Node:</strong> ${d.name}`)
          .style("visibility", "visible");})
        .on("mousemove", function(event) {
            tooltip.style("top", `${event.pageY - 100}px`)
           .style("left", `${event.pageX - 100}px`);})
        .on('mouseout', function (event, d) {
          const opacity = (window.currentBrushSelection.length > 0) ?
           (window.currentBrushSelection.includes(d.name) ? 1 : 0.2) : 1;
             d3.select(this).style('opacity', opacity);
             tooltip.style("visibility", "hidden");});
        
    // Adds the labels on the right and left side.
    svg
        .append("g")
        .selectAll("text")
        .data(sankeyData.nodes)
        .enter()
        .append("text")
        .attr("x", d => (d.x0 === 0 ? d.x0 - 5 : d.x1 + 10))
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 === 0 ? "end" : "start"))
        .text(d => {
            if (d.x0 === 0) {
                return d.name; 
            } else {
                // Converts the miles traveled to millions, rounding to 1 decimal place.
                // Before it was: 31,400,285 Miles now it will be 31.4M Miles.
                const milesInMillions = (d.value / 1e6).toFixed(1); 
                return `${d.name} (${milesInMillions}M Miles)`; 
            }
        }) 
        .style("font-size", "12px")
        .style("fill", "#000")
        .style("pointer-events", "none");
  
    // Adds a legend for the modes of transportation below the diagram.
    const legendData = [
        { mode: "CR", description: "Commuter Rail" },
        { mode: "DR", description: "Demand Response" },
        { mode: "FB", description: "Ferry Boat" },
        { mode: "HR", description: "Heavy Rail" },
        { mode: "LR", description: "Light Rail" },
        { mode: "MB", description: "Motor Bus" },
        { mode: "RB", description: "Bus Rapid Transit" },
        { mode: "TB", description: "Trolley Bus" },
    ];
    // Mode legend will be bellow Sankey diagram with 4 columns and 2 rows. 
    const legend = svg.append("g")
        .attr("transform", `translate(-70, ${height + 30})`); 

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => (i % 4) * 200) 
        .attr("y", (d, i) => Math.floor(i / 4) * 20)
        .text(d => `${d.mode}: ${d.description}`)
        .style("font-size", "12px")
        .style("fill", "#000");
}

// Adjusts the Sankey diagram based on the lines (wich represent fuel types) selected from the line chart.
function updateSankey(selectedFuelTypes) {
    const sankeyLinks = d3.selectAll("#sankey-diagram path"); 
    const sankeyNodes = d3.selectAll("#sankey-diagram rect"); 

    if (selectedFuelTypes.length === 0) {
        // If no lines are selected, the links and nodes reset to default color and transparency. 
        sankeyLinks.style("opacity", 0.5); 
        sankeyNodes.style("opacity", 1);
    } else {
        // If lines are selected, the links and node corresponding to it are highlighted.  
        sankeyLinks.style("opacity", (d) =>
            selectedFuelTypes.includes(d.source.name) ? 1 : 0.05
        );
        sankeyNodes.style("opacity", (d) =>
            selectedFuelTypes.includes(d.name) ? 1 : 0.05
        );
    }
}

// Makes updateSankey function available globally
window.updateSankey = updateSankey;

