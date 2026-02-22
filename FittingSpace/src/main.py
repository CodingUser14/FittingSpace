import cv2
from flask_cors import CORS
from flask import Flask, request, jsonify
import numpy as np  
import mediapipe as mp

app = Flask(__name__)
CORS(app) #enables Cross origin resouce sharing for flask app, allowing backend to accept requests from different domain, ie the frontend

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)


@app.route('/checking', methods=['POST'])
def checking():
    
    # grab the file, access files uploaded by client through a form data, php flashbacks
    file = request.files['image']

    # conver the file bits into a opencv image
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR) #conerts to processable image for Opencv
    
    # mediapipe needs rgb
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    results = pose.process(img_rgb)

    
    if results.pose_landmarks:
        lm = results.pose_landmarks.landmark
        h, w, _ = img.shape #ignore color channel

        essential_ids = [11, 12, 13, 14, 23, 24, 25, 26, 27, 28]
        filtered_points = {}
        
        visible_count = 0

        for idx in essential_ids:
            point = lm[idx]
            is_visible = point.visibility > 0.5

            if is_visible:
                visible_count += 1

            filtered_points[idx] = {
            "x": int(point.x * w),
            "y": int(point.y * h),
            "visible": point.visibility > 0.5,
            }

            
        is_valid = visible_count == 10  
            
        return jsonify({
            "valid": is_valid,
            "message": f"success yay. size of image {w}x{h}",
            "shoulders": abs(filtered_points[11]["x"] - filtered_points[12]["x"]),
            "landmarks": filtered_points
        })
    else: 
        # what react will see if no person is in frame
        return jsonify({
            "valid": is_valid,
            "message": "No body detected"
        })
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5050, debug=True)
