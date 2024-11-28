/* To create the Parallel diagram, we used this article from Graphing Libraries as a refrene
https://plotly.com/python/sankey-diagram/ 
  As well as this article from join.js 
  https://www.jointjs.com/demos/sankey-diagram?utm_term=sankey%20diagram%20javascript&utm_campaign=Search+Ads+%7C+Worldwide+%7C+React+Diagram+KWs&utm_source=adwords&utm_medium=ppc&hsa_acc=9744511829&hsa_cam=20933992049&hsa_grp=157792034379&hsa_ad=687381533216&hsa_src=g&hsa_tgt=kwd-2270153174793&hsa_kw=sankey%20diagram%20javascript&hsa_mt=p&hsa_net=adwords&hsa_ver=3&gad_source=1&gclid=CjwKCAiAxqC6BhBcEiwAlXp45yGly8LxM4gy1iRcovKJb71jU_Mn0yyHWT6eNesi5VSTqGrlm6hRpBoCs9kQAvD_BwE

The sankey diagram structure needs:
    ~Nodes: in our case this will be the fuel type and modes of transportation
    ~Links: the connection between the nodes wich will be the miles traveled

   Had to include node mapping because I kep getting "d3-sankey.min.js:2 Uncaught Error: missing: Diesel" 
*/

// Load the data 
d3.json("data/Fuel_and_Energy_cleaned.json").then(dataset => {
    const nodeMap = new Map(); 
    let nodeIndex = 0;

    dataset.forEach(row => {
        if (!nodeMap.has(row.Fuel_Source.trim())) {
            nodeMap.set(row.Fuel_Source.trim(), nodeIndex++);
        }
        if (!nodeMap.has(row.Mode.trim())) {
            nodeMap.set(row.Mode.trim(), nodeIndex++);
        }
    });

    const nodes = Array.from(nodeMap.keys()).map(name => ({ name }));

    // Aggregates Miles_Traveled 
    const linksMap = {};
    dataset.forEach(row => {
        const sourceIndex = nodeMap.get(row.Fuel_Source.trim());
        const targetIndex = nodeMap.get(row.Mode.trim());
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
    const margin = { top: 20, right: 200, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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

// Define custom colors for nodes
//Maps a color for each fuel type
  /*    Diesel--> red, #FF0000
        Gasoline --> yellow, #CCCC00
        Electric Propulsion--> green #008000
        Other Fuel --> pink, #FF69B4
        Compressed Natural Gas --> orange, #FFA500
    */
const nodeColors = {
    "Diesel": "#FF0000", 
    "Gasoline": "#CCCC00", 
    "Electric Propulsion": " #008000", 
    "Compressed Natural Gas": "#FFA500",
    "Other Fuel": "#FF69B4", 
};
// Set default color for all nodes on the right
const defaultColor = "#FFFFFF"; 

// althogh the similar color the links are a shade ligher 
    const linkColors = {
    "Diesel": "#FF9999",
    "Gasoline": "#FFFFAA",
    "Electric Propulsion": "#99FF99",
    "Compressed Natural Gas": "#FFD580",
    "Other Fuel": "#FFB6C1"
};
    

 // Set default color for links without a specific color
const defaultLinkColor = "#B0C4DE"; 

// Draw links
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
        const sourceNode = sankeyData.nodes[d.source]; 
        const color = sourceNode ? linkColors[sourceNode.name] : defaultLinkColor; 
        return color || defaultLinkColor; 
    })
    .style("opacity", 0.7);

// Draw nodes
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
    .style("fill", d => nodeColors[d.name] || defaultColor)
    .style("stroke", "#000");

    // Add labels, left: Fuel Source, right: Mode of Transportation + miles
    svg
        .append("g")
        .selectAll("text")
        .data(sankeyData.nodes)
        .enter()
        .append("text")
        .attr("x", d => (d.x0 === 0 ? d.x0 - 10 : d.x1 + 10)) 
        .attr("y", d => (d.y0 + d.y1) / 2) 
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 === 0 ? "end" : "start"))
        .text(d => (d.x0 === 0 ? d.name : `${d.name} (${d.value || 0} Miles)`)) 
        .style("font-size", "12px")
        .style("fill", "#000")
        .style("pointer-events", "none"); 
}
