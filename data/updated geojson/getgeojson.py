import json
import pandas as pd

# helper function to acheive consistency 
def normalize_name(name):
    # for null values
    if pd.isna(name):
        return None
    return name.strip().lower().replace(" ", "_") # convert to lowercase and remove underscores

# load csv into dictionary
def load_data(file_path):
    df = pd.read_csv(file_path) # csv to dataframe
    df['Neighborhood'] = df['Neighborhood'].apply(normalize_name) 
    demographics = df.set_index("Neighborhood").to_dict(orient="index") # convert to dictionary with neighborhood as key
    return demographics

# load gated entries
def load_total_gated_entries(file_path, neighborhood_mapping):
    ridership_df = pd.read_csv(file_path) # csv to dataframe
    ridership_df['station_name'] = ridership_df['station_name'].apply(normalize_name)  

    station_entries = ridership_df.set_index('station_name')['gated_entries'].to_dict() # convert df to dict with key value pair [name: entries]
    #mapping station to neighborhood
    neighborhood_stations = {}
    for neighborhood, stations in neighborhood_mapping.items(): #iterate through mappings
        normalized_stations = [normalize_name(station) for station in stations]
        neighborhood_stations[normalize_name(neighborhood)] = [
            {"station_name": station, "total_gated_entries": station_entries.get(station, "No Data")}
            for station in normalized_stations # if match, add to dictioanry
        ]
    return neighborhood_stations

# merge into geojson object
def merge_data_into_geojson(geojson_file, demographic_data, additional_demographics, station_data, census_data, survey_data, output_geojson_file):
    with open(geojson_file, 'r') as file:
        geojson_data = json.load(file)

    for feature in geojson_data["features"]: # iterate over every neighborhood
        neighborhood_name = normalize_name(feature["properties"]["name"])

        # add data is not null
        feature["properties"]["census_race"] = demographic_data.get(neighborhood_name, "No Data")
        feature["properties"]["survey_race"] = additional_demographics.get(neighborhood_name, "No Data")
        feature["properties"]["census_age"] = census_data.get(neighborhood_name, "No Data")
        feature["properties"]["survey_age"] = survey_data.get(neighborhood_name, "No Data")
        feature["properties"]["stations"] = station_data.get(neighborhood_name, [])

    # save to new file path
    with open(output_geojson_file, 'w') as file:
        json.dump(geojson_data, file, indent=4)
    # confirm success
    print(f"GeoJSON updated to: {output_geojson_file}")

# mapping for neighborhoods and station
neighborhood_mapping = {
    "East_Boston": ['Airport', 'Maverick', 'Orient Heights', 'Suffolk Downs', 'Wood Island'],
    "Allston": ['Allston Street'],
    "North_Cambridge": ['Alewife'],
    "South_Boston": ['Andrew', 'Broadway', 'Courthouse', 'World Trade Center'],
    "Downtown": ['Aquarium', 'Boylston', 'Downtown Crossing', 'Government Center', 'Haymarket', 'Park Street', 'South Station', 'State Street'],
    "Back_Bay": ['Arlington', 'Back Bay', 'Copley', 'Hynes Convention Center', 'Prudential'],
    "Dorchester": ['Ashmont', 'Fields Corner', 'JFK/UMass', 'Savin Hill', 'Shawmut'],
    "Assembly_Square": ['Assembly'],
    "Somerville": ['Ball Square', 'East Somerville', 'Gilman Square', 'Magoun Square'],
    "Beachmont": ['Beachmont'],
    "Beacon_Hill": ['Bowdoin'],
    "Braintree": ['Braintree'],
    "Central_Square": ['Central'],
    "West_End": ['Charles/MGH', 'North Station', 'Science Park'],
    "Chinatown": ['Chinatown', 'Tufts Medical Center'],
    "Charlestown": ['Community College', 'Sullivan Square'],
    "Davis_Square": ['Davis'],
    "Jamaica_Plain": ['Forest Hills', 'Green Street', 'Jackson Square', 'Stony Brook'],
    "Harvard_Square": ['Harvard'],
    "Kendall_Square": ['Kendall/MIT'],
    "Fenway_Kenmore": ['Kenmore', 'Massachusetts Avenue', 'Symphony'],
    "Lechmere_Square": ['Lechmere'],
    "Malden": ['Malden Center', 'Oak Grove'],
    "Mattapan": ['Mattapan Line'],
    "Medford": ['Medford/Tufts', 'Wellington'],
    "North_Quincy": ['North Quincy'],
    "Porter_Square": ['Porter'],
    "South_Quincy": ['Quincy Adams'],
    "Quincy_Center": ['Quincy Center'],
    "Revere": ['Revere Beach', 'Wonderland'],
    "Auburndale": ['Riverside'],
    "Roxbury": ['Roxbury Crossing', 'Ruggles'],
    "Union_Square": ['Union Square'],
    "Wollaston": ['Wollaston']
}

# file paths
census_demographics_csv = r"C:\Users\HP\Documents\COSI116\cleaned_neighborhood_data.csv"
survey_demographics_csv = r"C:\Users\HP\Documents\COSI116\survey_demographics.csv"
ridership_csv = r"C:\Users\HP\Documents\COSI116\total_ridership_2023.csv"
census_age_csv = r"C:\Users\HP\Documents\COSI116\census_age.csv"
survey_age_csv = r"C:\Users\HP\Documents\COSI116\survey_age.csv"
geojson_file = r"C:\Users\HP\Documents\COSI116\bostonV2.json"
output_geojson_file = r"C:\Users\HP\Documents\COSI116\updated_bostonV2_with_data.json"

# run
census_demographics = load_data(census_demographics_csv)
survey_demographics = load_data(survey_demographics_csv)
census_age = load_data(census_age_csv)
survey_age = load_data(survey_age_csv)
station_data = load_total_gated_entries(ridership_csv, neighborhood_mapping)
merge_data_into_geojson(geojson_file, census_demographics, survey_demographics, station_data, census_age, survey_age, output_geojson_file)
