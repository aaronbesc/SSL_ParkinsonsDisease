import json
import numpy as np
from scipy.interpolate import interp1d

def spatial_normalization(x, y):
    min_x, max_x = min(x), max(x)
    min_y, max_y = min(y), max(y)

    normalized_x = [(val - min_x) / (max_x - min_x) if max_x - min_x != 0 else 0 for val in x]
    normalized_y = [(val - min_y) / (max_y - min_y) if max_y - min_y != 0 else 0 for val in y]

    return normalized_x, normalized_y

def temporal_resampling(x, y, target_length=100):
    original_frames = np.linspace(0, 1, len(x))
    target_frames = np.linspace(0, 1, target_length)

    interp_x = interp1d(original_frames, x, kind='linear', fill_value="extrapolate")
    interp_y = interp1d(original_frames, y, kind='linear', fill_value="extrapolate")

    resampled_x = interp_x(target_frames).tolist()
    resampled_y = interp_y(target_frames).tolist()

    return resampled_x, resampled_y

def compress_motion_data(input_file="motion_data.json", output_file="compressed_motion_data.json", target_length=100):
    with open(input_file, "r") as f:
        data = json.load(f)

    nose_x = data["nose_x"]
    nose_y = data["nose_y"]

    normalized_x, normalized_y = spatial_normalization(nose_x, nose_y)

    resampled_x, resampled_y = temporal_resampling(normalized_x, normalized_y, target_length)

    compressed_data = {
        "frames": list(range(target_length)),
        "nose_x": resampled_x,
        "nose_y": resampled_y
    }

    with open(output_file, "w") as f:
        json.dump(compressed_data, f, indent=4)

    print(f"Compressed motion data saved to {output_file}")

if __name__ == "__main__":
    compress_motion_data()