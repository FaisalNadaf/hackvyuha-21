# ✨ Final Code with Names Displayed During Tracking

import cv2
import time
import random
import numpy as np
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
from zones import get_zones
from database import store_productivity_data

# Load model and tracker
model = YOLO("yolov8x.pt")
tracker = DeepSort(
    max_age=90,
    n_init=5,
    max_cosine_distance=0.3,
    nn_budget=100
)

# Constants
MOVEMENT_THRESHOLD = 5
MOVEMENT_WINDOW = 1.0
ZONES = get_zones()
MAX_PERSONS = 20

# Global state
person_zone_timers = {}
person_sitting_states = {}
active_tracks = set()
track_history = {}
track_confidence = {}
track_names = {}  # New: store names for each track ID

# Name generation pool
first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Jamie", "Robin", "Avery", "Peyton", "Quinn",
               "Chris", "Sam", "Drew", "Logan", "Cameron", "Dakota", "Skyler", "Elliot", "Riley", "Blake"]

last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Hernandez",
              "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Lee"]

def generate_random_name():
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def is_inside_polygon(point, polygon):
    return cv2.pointPolygonTest(np.array(polygon, dtype=np.int32), point, False) >= 0

def draw_text(img, text, pos, color=(255, 255, 255)):
    cv2.putText(img, text, pos, cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def draw_zones(frame):
    for name, data in ZONES.items():
        pts = np.array(data["points"], np.int32).reshape((-1, 1, 2))
        cv2.polylines(frame, [pts], isClosed=True, color=(255, 0, 0), thickness=2)
        cv2.putText(frame, name, data["points"][0], cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

def calculate_iou(box1, box2):
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    x_left = max(x1_1, x1_2)
    y_top = max(y1_1, y1_2)
    x_right = min(x2_1, x2_2)
    y_bottom = min(y2_1, y2_2)
    if x_right < x_left or y_bottom < y_top:
        return 0.0
    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
    box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)
    iou = intersection_area / float(box1_area + box2_area - intersection_area)
    return iou

def main():
    global active_tracks
    cap = cv2.VideoCapture("./cctv-videos/cctv2.mp4")
    if not cap.isOpened():
        print("Error: Cannot open video")
        return

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        active_tracks.clear()
        results = model.predict(frame, verbose=False, conf=0.25)[0]
        detections = []

        for box, conf, cls in zip(results.boxes.xyxy, results.boxes.conf, results.boxes.cls):
            if int(cls) == 0 and conf > 0.35:
                x1, y1, x2, y2 = map(int, box)
                detections.append(([x1, y1, x2 - x1, y2 - y1], float(conf), 'person'))

        tracks = tracker.update_tracks(detections, frame=frame)
        current_time = time.time()

        for track in tracks:
            if not track.is_confirmed():
                continue

            track_id = track.track_id
            x1, y1, x2, y2 = map(int, track.to_ltrb())
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            active_tracks.add(track_id)

            # Assign name if new
            if track_id not in track_names:
                track_names[track_id] = generate_random_name()
            person_name = track_names[track_id]

            if track_id not in track_history:
                track_history[track_id] = []
            track_history[track_id].append((cx, cy))
            if len(track_history[track_id]) > 30:
                track_history[track_id] = track_history[track_id][-30:]

            if track_id not in track_confidence:
                track_confidence[track_id] = 0.5

            if track_id not in person_zone_timers:
                person_zone_timers[track_id] = {
                    name: {'entry_time': 0, 'total_time': 0, 'in_zone': False}
                    for name in ZONES
                }
            if track_id not in person_sitting_states:
                person_sitting_states[track_id] = {
                    'position_history': [],
                    'state_entry_time': current_time,
                    'total_sitting': 0
                }

            sitting = person_sitting_states[track_id]
            sitting['position_history'].append((cx, cy, current_time))
            sitting['position_history'] = [e for e in sitting['position_history'] if current_time - e[2] <= MOVEMENT_WINDOW]
            speed = 0
            if len(sitting['position_history']) >= 2:
                oldest = sitting['position_history'][0]
                newest = sitting['position_history'][-1]
                dx, dy = newest[0] - oldest[0], newest[1] - oldest[1]
                dist = (dx ** 2 + dy ** 2) ** 0.5
                t_diff = newest[2] - oldest[2]
                if t_diff > 0:
                    speed = dist / t_diff

            if speed <= MOVEMENT_THRESHOLD:
                elapsed = current_time - sitting['state_entry_time']
                sitting['total_sitting'] += elapsed
                sitting['state_entry_time'] = current_time
                sitting_state = 'Sitting'
            else:
                sitting['state_entry_time'] = current_time
                sitting_state = 'Moving'

            label_lines = []
            for name, data in ZONES.items():
                zone = person_zone_timers[track_id][name]
                inside = is_inside_polygon((cx, cy), data["points"])
                if inside and not zone['in_zone']:
                    zone['entry_time'] = current_time
                    zone['in_zone'] = True
                elif not inside and zone['in_zone']:
                    zone['total_time'] += current_time - zone['entry_time']
                    zone['in_zone'] = False
                total_time = zone['total_time'] + (current_time - zone['entry_time'] if zone['in_zone'] else 0)
                if inside:
                    label_lines.append(f"{name}: {int(total_time)}s")

            label_lines.append(f"{sitting_state}: {int(sitting['total_sitting'])}s")

            # Draw bounding box and info
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            y_text = y1 - 10
            draw_text(frame, f"{person_name} (ID {track_id})", (x1, y_text), (0, 255, 255))
            y_text -= 20
            for line in label_lines:
                draw_text(frame, line, (x1, y_text), (0, 255, 255))
                y_text -= 20

        draw_text(frame, f"Active Tracks: {len(active_tracks)}", (10, 30), (0, 0, 255))
        draw_zones(frame)
        cv2.imshow("Productivity Tracker - With Names", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    print("\nFinal Productivity Summary:")
    if len(track_confidence) > MAX_PERSONS:
        top_tracks = sorted(track_confidence.items(), key=lambda x: x[1], reverse=True)[:MAX_PERSONS]
        track_ids = [t[0] for t in top_tracks]
    else:
        track_ids = list(person_zone_timers.keys())

    for track_id in track_ids:
        if track_id not in person_zone_timers:
            continue

        print(f"\nPerson ID {track_id}:")
        zone_times = {}
        for name, data in person_zone_timers[track_id].items():
            total = data['total_time']
            if data['in_zone']:
                total += time.time() - data['entry_time']
            print(f"  {name}: {int(total)} seconds")
            zone_times[name] = int(total)

        sitting = person_sitting_states[track_id]
        print(f"  Sitting: {int(sitting['total_sitting'])}s")
        person_name = track_names.get(track_id, "Unknown")
        store_productivity_data(track_id, person_name, zone_times, int(sitting['total_sitting']))

if __name__ == "__main__":
    main()