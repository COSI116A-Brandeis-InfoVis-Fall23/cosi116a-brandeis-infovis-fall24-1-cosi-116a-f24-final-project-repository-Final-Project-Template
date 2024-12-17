import pandas as pd
import utm
import json
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

df = pd.read_csv("~/Desktop/cleaned_mbta_stops.csv")

# Function to convert lat/lon to UTM
def convert_to_utm(row):
    try:
        utm_coords = utm.from_latlon(row['Latitude'], row['Longitude'])
        return pd.Series([utm_coords[0], utm_coords[1]])  # UTM X and Y
    except Exception as e:
        print(f"Error converting row: {row}, Error: {e}")
        return pd.Series([None, None])

# Apply the conversion and create new columns
df[['UTM_X', 'UTM_Y']] = df.apply(convert_to_utm, axis=1)

# Save the updated DataFrame to a new CSV file
df.to_csv("~/Desktop/mbta_stops_utm.csv", index=False)

print(" Successfully added UTM coordinates!")
print("\nSample Output:")
print(df.head())

def linear_transform(utm, a, b):
    return a * utm + b

with open("/Users/madiholmesacourt/Desktop/COSI116a/cosi116a-brandeis-infovis-fall24-1-cosi-116a-f24-final-project-repository-Final-Project-Template/data/spider.json", "r") as f:
    existing_stations = json.load(f)

# Convert existing data into a DataFrame
known_df = df[df['station_id'].isin(existing_stations.keys())]

# Extract UTM and JSON coordinates
utm_x = known_df['UTM_X'].values
utm_y = known_df['UTM_Y'].values
json_x = [existing_stations[station][0] for station in known_df['station_id']]
json_y = [existing_stations[station][1] for station in known_df['station_id']]

# Fit linear transformations for X and Y
popt_x, _ = curve_fit(linear_transform, utm_x, json_x)
popt_y, _ = curve_fit(linear_transform, utm_y, json_y)

print(f"Transformation Coefficients:")
print(f"X: a={popt_x[0]}, b={popt_x[1]}")
print(f"Y: a={popt_y[0]}, b={popt_y[1]}")

# Apply the transformation to all UTM coordinates
df['JSON_X'] = linear_transform(df['UTM_X'], *popt_x)
df['JSON_Y'] = linear_transform(df['UTM_Y'], *popt_y)

# Save the updated DataFrame
df.to_csv("~/Desktop/mbta_stops_utm.csv", index=False)
print(df[['stop_name', 'JSON_X', 'JSON_Y']].head())

# df = pd.read_csv("~/Desktop/mbta_stops_utm.csv")

background_image = "/Users/madiholmesacourt/Desktop/2024-12-15-subway-map.png"  # Replace with your image file path
img = mpimg.imread(background_image)

def on_click(event):
    if event.xdata is not None and event.ydata is not None:  # Ensure click is within axes
        print(f"Clicked at X: {event.xdata:.2f}, Y: {event.ydata:.2f}")
fig, ax = plt.subplots(figsize=(10, 10))

img_size = [25, 25]
img_orig= [0, 0]
ax.imshow(img, extent=[img_orig[0], img_orig[0] + img_size[0], img_orig[1], img_orig[1] + img_size[1]], origin="lower")  # extent=[xmin, xmax, ymin, ymax] aligns the axes to your coordinates
ax.invert_yaxis()

fig.canvas.mpl_connect("button_press_event", on_click)

# Existing coordinates from JSON
json_existing_x = [existing_stations[station][0] for station in existing_stations]
json_existing_y = [existing_stations[station][1] for station in existing_stations]
# ax.scatter(json_existing_x, json_existing_y, color='red', label='Existing JSON Coords', s=50)

# # Transformed coordinates
# ax.scatter(df['JSON_X'], df['JSON_Y'], color='green', label='Transformed Coords', s=20)



# Customize the plot
plt.xlabel("X Coordinate")
plt.ylabel("Y Coordinate")
plt.title("Comparison of Existing JSON Coordinates and Transformed Coordinates")
plt.legend()
plt.grid(True)
plt.show()
