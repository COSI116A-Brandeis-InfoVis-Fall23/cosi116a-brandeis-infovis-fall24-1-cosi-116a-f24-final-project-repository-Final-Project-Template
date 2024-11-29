/* To create the Parallel diagram, we used this article from Graphing Libraries as a refrene
   https://plotly.com/python/sankey-diagram/ 
  As well as this article from join.js 
  https://www.jointjs.com/demos/sankey-diagram?utm_term=sankey%20diagram%20javascript&utm_campaign=Search+Ads+%7C+Worldwide+%7C+React+Diagram+KWs&utm_source=adwords&utm_medium=ppc&hsa_acc=9744511829&hsa_cam=20933992049&hsa_grp=157792034379&hsa_ad=687381533216&hsa_src=g&hsa_tgt=kwd-2270153174793&hsa_kw=sankey%20diagram%20javascript&hsa_mt=p&hsa_net=adwords&hsa_ver=3&gad_source=1&gclid=CjwKCAiAxqC6BhBcEiwAlXp45yGly8LxM4gy1iRcovKJb71jU_Mn0yyHWT6eNesi5VSTqGrlm6hRpBoCs9kQAvD_BwE

The sankey diagram structure needs:
    ~Nodes: in our case this will be the fuel type and modes of transportation
    ~Links: the connection between the nodes wich will be the miles traveled

   Also included node mapping because I kep getting "d3-sankey.min.js:2 Uncaught Error: missing: Diesel" 
*/

/// Load the data
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

    // Aggregates Miles_Traveled 
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

    // Render the diagram using sankeyData
    renderSankey(sankeyData);
});

// Function to render the diagram
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

    /* Used this to make sure the Sankey diagram was encoding the information properly
    our team had no refrence of what the data was supposed to look like so I had to made sure
    each fuel type was mapping to the correct mode with the accurate amt of miles I used this google sheet 
    to manually compare data
    Link to the google sheets: https://docs.google.com/spreadsheets/d/18XIddoIqfUnsD4TshfWOVquaqu4aqkMF_F5T_OJLE7k/edit?usp=sharing
    */

    /*
    sankeyData.links.forEach(link => {
    const sourceNode = link.source; // Directly use link.source
    const targetNode = link.target; // Directly use link.target

    if (!sourceNode || !targetNode) {
        console.error("Undefined source or target node:", link);
    } else {
        console.log(`Link from ${sourceNode.name} to ${targetNode.name}, Miles_Traveled: ${link.value}`);
    }
    });
    */


    // Define custom colors for nodes 
    // Used the same color scheme as the line chart 
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
                    transparentColor.opacity = 0.5; 
                    return transparentColor;
                }
            }
        })
        .style("opacity", 0.7);

    // Draws the nodes
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
        .style("fill", d => nodeColors[d.name] || "#FFFFFF")
        .style("stroke", "#000");

    // Adds the labels on the right and left side 
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
                // Converts the miles traveled to millions, rounding to 1 decimal place
                // Before it was: 31,400,285 Miles now it will be 31.4M Miles 
                const milesInMillions = (d.value / 1e6).toFixed(1); 
                return `${d.name} (${milesInMillions}M Miles)`; 
            }
        }) 
        .style("font-size", "12px")
        .style("fill", "#000")
        .style("pointer-events", "none");
  
    // Adds a legend for the modes of transportation below the diagram
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
    const legend = svg.append("g")
        .attr("transform", `translate(0, ${height + 30})`); 

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        //4 rows
        .attr("x", (d, i) => (i % 4) * 200) 
        .attr("y", (d, i) => Math.floor(i / 4) * 20)
        .text(d => `${d.mode}: ${d.description}`)
        .style("font-size", "12px")
        .style("fill", "#000");
}
