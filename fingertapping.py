import cv2
import mediapipe as mp
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter


def main():
    cap = cv2.VideoCapture(0)

    mp_hands = mp.solutions.hands
    mp_drawing = mp.solutions.drawing_utils
    finger_distance = []

    hand = mp_hands.Hands()

    frame_count = 0

    while True:
        success, frame = cap.read()
        if not success:
            print("Ignoring empty camera frame.")
            break

        frame = cv2.flip(frame, 1)  # Flip before processing for consistency
        RGB_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hand.process(RGB_frame)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                index_tip = hand_landmarks.landmark[8]  # Index Finger Tip
                thumb_tip = hand_landmarks.landmark[4]  # Thumb Tip

                h, w, _ = frame.shape
                icx, icy = int(index_tip.x * w), int(index_tip.y * h)
                tcx, tcy = int(thumb_tip.x * w), int(thumb_tip.y * h)

                fingers = np.sqrt((tcx - icx) ** 2 + (tcy - icy) ** 2)
                finger_distance.append(fingers)

                # Draw landmarks
                cv2.circle(frame, (icx, icy), 10, (0, 255, 0), -1)
                cv2.circle(frame, (tcx, tcy), 10, (0, 255, 0), -1)
                cv2.line(frame, (icx, icy), (tcx, tcy), (0, 0, 0), 2)

        frame_count += 1  # Ensure frame count updates even when no hands are detected

        cv2.imshow("Webcam Feed", frame)

        if cv2.waitKey(5) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    if len(finger_distance) < 3:
        print("Not enough data to analyze peaks.")
        return

    smoothed_data = savgol_filter(finger_distance, window_length=3, polyorder=1)

    # Finding local minima and maxima
    local_min = (np.diff(np.sign(np.diff(smoothed_data))) > 0).nonzero()[0] + 1
    local_max = (np.diff(np.sign(np.diff(smoothed_data))) < 0).nonzero()[0] + 1

    # Plot results
    frames = np.arange(len(finger_distance))

    plt.figure(figsize=(8, 6))
    plt.plot(frames, smoothed_data, label='Finger Distance', color='blue')
    plt.scatter(frames[local_min], [smoothed_data[i] for i in local_min], color='red', label="Local Min")
    plt.scatter(frames[local_max], [smoothed_data[i] for i in local_max], color='green', label="Local Max")

    plt.xlabel('Frame Count')
    plt.ylabel('Distance (pixels)')
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    main()
