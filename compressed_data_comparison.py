import json
import numpy as np
import matplotlib.pyplot as plt

def load_motion_data(file_path):
    """Load compressed motion data from a JSON file."""
    with open(file_path, "r") as f:
        data = json.load(f)
    
    return np.array(data["frames"]), np.array(data["nose_x"]), np.array(data["nose_y"])

def compare_motion_data(file1, file2):
    
    frames1, nose_x1, nose_y1 = load_motion_data(file1)
    frames2, nose_x2, nose_y2 = load_motion_data(file2)

    fig, ax = plt.subplots(2, 2, figsize=(10, 6), sharex=True)

    ax[0, 0].plot(frames1, nose_x1, label='Nose X (File 1)', color='blue')
    ax[0, 0].set_ylabel('X Position (normalized)')
    ax[0, 0].set_title(f"Motion Data from {file1}")
    ax[0, 0].legend()
    ax[0, 0].grid(True)

    ax[1, 0].plot(frames1, nose_y1, label='Nose Y (File 1)', color='red')
    ax[1, 0].set_ylabel('Y Position (normalized)')
    ax[1, 0].set_xlabel('Frame Count')
    ax[1, 0].legend()
    ax[1, 0].grid(True)

    ax[0, 1].plot(frames2, nose_x2, label='Nose X (File 2)', color='blue', linestyle='dashed')
    ax[0, 1].set_title(f"Motion Data from {file2}")
    ax[0, 1].legend()
    ax[0, 1].grid(True)

    ax[1, 1].plot(frames2, nose_y2, label='Nose Y (File 2)', color='red', linestyle='dashed')
    ax[1, 1].set_xlabel('Frame Count')
    ax[1, 1].legend()
    ax[1, 1].grid(True)

    # Adjust layout
    plt.suptitle("Comparison of Compressed Motion Data")
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    # Modify these filenames to test with actual compressed JSON files
    file1 = "compressed_motion_data_1.json"
    file2 = "compressed_motion_data_2.json"

    compare_motion_data(file1, file2)
