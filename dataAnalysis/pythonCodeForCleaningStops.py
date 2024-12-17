import pandas as pd
import os

def clean_mbta_stops(file_path):
    """
    Cleans the MBTA stops file.
    Works for both Excel and CSV files.
    Extracts unique stop names and associated line colors.
    Outputs a cleaned file and displays the unique stops.
    """
    try:
        # Determine file format based on extension
        _, file_extension = os.path.splitext(file_path)

        if file_extension.lower() == '.csv':
            df = pd.read_csv(file_path)
        elif file_extension.lower() in ['.xls', '.xlsx']:
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Use a CSV or Excel file.")

        # Select relevant columns
        cleaned_df = df[['route_id', 'stop_name', 'Latitude', 'Longitude']].drop_duplicates()

        # Rename columns for clarity
        # cleaned_df.columns = ['Line Color', 'Stop Name', 'Latitude', 'Longitude']

        stop_distances_df = pd.read_csv("~/Desktop/MBTA_Rapid_Transit_Stop_Distances.csv")

        station_mapping = stop_distances_df[['from_stop_name', 'from_station_id']].drop_duplicates()
        station_mapping.columns = ['stop_name', 'station_id']  # Rename for merging clarity

        # Merge the existing DataFrame with the station mapping DataFrame
        cleaned_df = cleaned_df.merge(station_mapping, on='stop_name', how='left')

        # Sort by line color and stop name
        # cleaned_df = cleaned_df.sort_values(by=['Line Color', 'Stop Name'])

        # Output to a new CSV file
        output_file = "~/Desktop/cleaned_mbta_stops.csv"
        cleaned_df.to_csv(output_file, index=False)

        print("Successfully cleaned the file!")
        print(f"Unique stops saved to: {output_file}")
        print("\nSample Output:")
        print(cleaned_df.head(10))

    except Exception as e:
        print(f" An error occurred: {e}")

# Use the function
# file_path = input("Enter the path to your file: ").strip()
# clean_mbta_stops(file_path)
clean_mbta_stops("/Users/madiholmesacourt/Desktop/COSI116a/Shit for the final project/output_with_coords.csv")
