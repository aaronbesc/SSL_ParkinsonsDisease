import cv2
import mediapipe as mp
import numpy as np
import matplotlib.pyplot as plt
import json

def main():
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    cap = cv2.VideoCapture(0)

    nose_x = []
    nose_y = []
    velocity_magnitude = []
    frame_count = 0

    with mp_pose.Pose(min_detection_confidence=0.5,
                      min_tracking_confidence=0.5) as pose:
        while True:
            success, frame = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                break

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS)

                nose_landmark = results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE]
                
                height, width, _ = frame.shape
                nx = nose_landmark.x * width
                ny = nose_landmark.y * height
                if frame_count > 0:
                    dx = nx - nose_x[-1]
                    dy = ny - nose_y[-1]
                    velocity_magnitude.append(np.sqrt(dx**2 + dy**2))
                else:
                    velocity_magnitude.append(0)

                nose_x.append(nx)
                nose_y.append(ny)
                frame_count += 1

            cv2.imshow('MediaPipe Pose', frame)
            if cv2.waitKey(5) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

    data = {
        "frames": list(range(frame_count)),
        "nose_x": nose_x,
        "nose_y": nose_y,
        "velocity_magnitude": velocity_magnitude
    }

    with open("motion_data_1.json", "w") as f:
        json.dump(data, f, indent=4)

    print("Motion data saved to motion_data.json")

    frames = np.arange(frame_count)

    fig, ax = plt.subplots(3, 1, figsize=(8, 9), sharex=True)

    ax[0].plot(frames, nose_x, label='Nose X Position', color='blue')
    ax[0].set_ylabel('X Position (pixels)')
    ax[0].legend()
    ax[0].grid(True)

    ax[1].plot(frames, nose_y, label='Nose Y Position', color='red')
    ax[1].set_ylabel('Y Position (pixels)')
    ax[1].set_xlabel('Frame Count')
    ax[1].legend()
    ax[1].grid(True)

    ax[2].plot(frames, velocity_magnitude, label='Velocity', color='green')
    ax[2].set_ylabel('Velocity Magnitude')
    ax[2].set_xlabel('Frame Count')
    ax[2].legend()
    ax[2].grid(True)

    plt.suptitle('Nose Position Over Time')
    plt.show()

if __name__ == "__main__":
    main()

