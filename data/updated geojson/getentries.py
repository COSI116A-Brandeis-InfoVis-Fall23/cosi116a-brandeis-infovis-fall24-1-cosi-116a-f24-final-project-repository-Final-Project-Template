import pandas as pd

file_path = r"C:\Users\HP\Documents\COSI116\gated_entries.csv"  
data = pd.read_csv(file_path)

total_ridership = (
    data.groupby(['station_name', 'route_or_line'])['gated_entries']
    .sum()  # get total entries
    .astype(int)
    .reset_index()  # Convert into columns
)

# Save the result to a new CSV file
output_file_path = r"C:\Users\HP\Documents\COSI116\total_ridership_2023.csv"  # Output file path
total_ridership.to_csv(output_file_path, index=False)
print(f"Total ridership data saved to {output_file_path}")
