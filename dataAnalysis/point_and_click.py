import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import os

# Load the input CSV and resume progress
csv_file = "/Users/madiholmesacourt/Desktop/updated_mbta_stops.csv"  # File to save progress
if os.path.exists(csv_file):
    df = pd.read_csv(csv_file)
    print("Resuming from the last save...")
else:
    df = pd.read_csv("~/Desktop/cleaned_mbta_stops.csv")
    df['X_Coord'] = None
    df['Y_Coord'] = None
    print("starting fresh...")

# Background image path
background_image = "/Users/madiholmesacourt/Desktop/2024-12-15-subway-map.png"  # Replace with your image path
img = mpimg.imread(background_image)

# Select route and filter stations   
df = df.sort_values(by=['route_id', 'Longitude'], ascending=[True, True]).reset_index(drop=True)

print(df)

# Set up global variables
current_station_index = 0  # Tracks which station we're on
stations = df['stop_name'].tolist()  # List of station names

station_index = df[(df['stop_name'] == stations[current_station_index])].index[0]
while not pd.isna(df.at[station_index, "X_Coord"]):
    print(f"skipping {df.at[station_index, 'stop_name']}")
    current_station_index += 1
    station_index = df[(df['stop_name'] == stations[current_station_index])].index[0]

coords = []  # To store coordinates

# Function to handle clicks
def on_click(event):
    global current_station_index, coords

    if event.xdata is not None and event.ydata is not None:
        # Get current station
        station_name = stations[current_station_index]
        print(f" Recorded {station_name} at X: {event.xdata:.2f}, Y: {event.ydata:.2f}")

        # Update the main DataFrame
        station_index = df[(df['stop_name'] == station_name)].index[0]
        df.at[station_index, 'X_Coord'] = event.xdata
        df.at[station_index, 'Y_Coord'] = event.ydata
        
        # Save progress
        df.to_csv(csv_file, index=False)
        print(f"Progress saved to {csv_file}")

        ax.scatter(event.xdata, event.ydata, color='purple', s=50, label='New Point')

        # Move to the next station
        current_station_index += 1
        if current_station_index >= len(stations):
            print("🎉 All stations for this route are recorded! Exiting...")
            plt.close()
        else:
            ax.set_title(f"Click to record coordinates for: {df.at[station_index, 'route_id']} - {stations[current_station_index]}")
            fig.canvas.draw()

# Plot the map and connect click events
fig, ax = plt.subplots(figsize=(10, 10))

# Set the image extent and display
img_size = [25, 25]
img_orig = [0, 0]
ax.imshow(img, extent=[img_orig[0], img_orig[0] + img_size[0], img_orig[1], img_orig[1] + img_size[1]], origin="lower")
ax.invert_yaxis()

# Set up the first station prompt
station_index = df[(df['stop_name'] == stations[current_station_index])].index[0]
ax.set_title(f"Click to record coordinates for: {df.at[station_index, 'route_id']} - {stations[current_station_index]}")

# Connect the click event
fig.canvas.mpl_connect("button_press_event", on_click)

# Customize the plot
plt.xlabel("X Coordinate")
plt.ylabel("Y Coordinate")
plt.grid(True)
plt.show()
