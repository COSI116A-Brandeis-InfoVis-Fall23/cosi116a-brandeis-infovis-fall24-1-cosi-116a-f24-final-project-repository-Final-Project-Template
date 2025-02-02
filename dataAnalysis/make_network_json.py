import pandas as pd
import json

# Load the CSV file
csv_file = "~/Desktop/MBTA_Rapid_Transit_Stop_Distances.csv"
df = pd.read_csv(csv_file)

# Step 1: Generate the nodes
nodes = []
node_set = set()

station_blacklist = ["place-unsqu", "place-esomr", "place-gilmn", "place-mgngl", "place-balsq", "place-mdftf"]
line_blacklist = ["Mattapan"]

# Extract unique stations and ensure no duplicates
for _, row in df.iterrows():
    from_id, from_name = row['from_station_id'], row['from_stop_name']
    to_id, to_name = row['to_station_id'], row['to_stop_name']

    if row['route_id'] in line_blacklist:
        continue

    if from_id in station_blacklist or to_id in station_blacklist:
        continue
    
    # Add from_station
    if from_id not in node_set:
        nodes.append({"id": from_id, "name": from_name})
        node_set.add(from_id)
    
    # Add to_station
    if to_id not in node_set:
        nodes.append({"id": to_id, "name": to_name})
        node_set.add(to_id)

# Step 2: Generate the links
links = []
line_colors = {"red": "E12D27", "orange": "E87200", "blue": "2F5DA6", "green": "03C04A"}  # Add more as needed


def get_index_by_id(nodes, id):
    for i, node in enumerate(nodes):
        if node.get("id") == id:
            return i
    print(id)
    return -1

for _, row in df.iterrows():
    if row['route_id'] == "Mattapan":
        continue
    if row['from_station_id'] in station_blacklist or row['to_station_id'] in station_blacklist:
        continue
    line = row['route_id'].lower()
    if "green" in line:
        line = "green"
    links.append({
        "source": get_index_by_id(nodes, row['from_station_id']),
        "target": get_index_by_id(nodes, row['to_station_id']),
        "line": line,  # Line type (e.g., "red", "orange")
        "color": line_colors.get(line, "000000")  # Default color to black if missing
    })

# Step 3: Combine into JSON structure
output_json = {"nodes": nodes, "links": links}

# Step 4: Save to JSON file
output_file = "/Users/madiholmesacourt/Desktop/station-network.json"
with open(output_file, "w") as f:
    json.dump(output_json, f, indent=4)

print(f"JSON file saved to {output_file}")
