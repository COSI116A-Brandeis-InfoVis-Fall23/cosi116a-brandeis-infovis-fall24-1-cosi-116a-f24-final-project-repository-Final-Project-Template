# this script cleans the demographic census data csv file.

import pandas as pd
# process data
def process_demographic_data(file_path, output_csv):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    data = [] #will store rows

    for line in lines:
        line = line.strip()
        if not line or "Source" in line or "Table" in line or "Race & Ethnicity" in line:
            continue  #skip unimportant rows
        parts = line.split('\t')

        if len(parts) < 12: #skip insufficient data
            continue

        neighborhood = parts[0].strip()
        demographics = [neighborhood]
        for col in parts[1:12]: 
            cleaned_data = col.replace(',', '').replace('"', '').strip()
            if '%' in cleaned_data:
                demographics.append(float(cleaned_data.strip('%')))  # convert to float
            else:
                demographics.append(int(cleaned_data) if cleaned_data.isdigit() else None)  # convert to int

        data.append(demographics)
    
    # make columns
    columns = [
        "Neighborhood",
        "Total Population",
        "White Alone",
        "White %",
        "Black/African-American",
        "Black/African-American %",
        "Hispanic",
        "Hispanic %",
        "Asian Alone",
        "Asian Alone %",
        "Other Races",
        "Other Races %",
    ]

    # convert to a DataFrame
    df = pd.DataFrame(data, columns=columns)

    # save the DataFrame to a CSV file
    df.to_csv(output_csv, index=False)
    print(f"Processed data saved to {output_csv}")

# run
input_file = r"C:\Users\HP\Documents\COSI116\neighborhood_data.txt"
output_csv = r"C:\Users\HP\Documents\COSI116\cleaned_neighborhood_data.csv"
process_demographic_data(input_file, output_csv)
