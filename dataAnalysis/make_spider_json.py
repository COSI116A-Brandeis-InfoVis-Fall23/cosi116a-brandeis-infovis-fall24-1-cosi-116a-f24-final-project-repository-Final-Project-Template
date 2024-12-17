import pandas as pd
import json

# Load the updated CSV file with X_Coord and Y_Coord
csv_file = "~/Desktop/updated_mbta_stops.csv"
df = pd.read_csv(csv_file)

# Drop rows with missing coordinates
df = df.dropna(subset=["X_Coord", "Y_Coord"])

# Create the JSON dictionary
json_data = {
    row['station_id']: [row['X_Coord'], row['Y_Coord']]
    for _, row in df.iterrows()
}

# Save to JSON file
output_file = "/Users/madiholmesacourt/Desktop/spider.json"
with open(output_file, "w") as f:
    json.dump(json_data, f, indent=4)

print(f"JSON file saved to {output_file}")
