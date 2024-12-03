# this script takes the cleaned csv and appends it to the GeoJson file.

import json
import pandas as pd

# convert csv data to dataframe
def load_csv(file_path):
    # read cleaned data into dataframe
    df = pd.read_csv(file_path)
    # convert to hashmap: {neighborhood, index}
    demographics = df.set_index("Neighborhood").to_dict(orient="index")
    return demographics

# merge dataframe to GeoJson
def merge_data_into_geojson(geojson_file, demographic_data, output_geojson_file):
    # open GeoJSON file
    with open(geojson_file, 'r') as file:
        geojson_data = json.load(file)

    # update properties for each neighborhood
    for feature in geojson_data["features"]:
        neighborhood_name = feature["properties"]["name"]
        if neighborhood_name in demographic_data:
            feature["properties"]["demographics"] = demographic_data[neighborhood_name]
        else:
            feature["properties"]["demographics"] = "No Data"  # if not found

    # save
    with open(output_geojson_file, 'w') as file:
        json.dump(geojson_data, file, indent=4)
    print(f"Updated GeoJSON saved to {output_geojson_file}")

# run
csv_file = r"C:\Users\HP\Documents\COSI116\cleaned_neighborhood_data.csv"
geojson_file = r"C:\Users\HP\Documents\COSI116\bostonV2.json"
output_geojson_file = r"C:\Users\HP\Documents\COSI116\updated_bostonV2.json"
demographic_data = load_csv(csv_file)
merge_data_into_geojson(geojson_file, demographic_data, output_geojson_file)
