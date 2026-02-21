<<<<<<< HEAD
import cv2
import mediapipe as mp
from flask import Flask, request, jsonify
import numpy as np  

# initailizing mediapipe
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)

@app.route('/checking', methods=['POST'])

def checking():
    file = request.files['image']
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = np.imdecode(img_bytes, cv2.IMREAD_COLOR)
    h, w, _ = img.shape

    results = pose.process(cv2.cvtColor(img, cv2.COLOR_BAYER_BG2RGB))

    if not results.pose_landmarks:
        return jsonify({"valid": False, "error": "No body detected"})
    
    l_sh = results.pose_landmarks.landmark[11]
    r_sh = results.pose_landmarks.landmark[12]

    data = {
        "valid": True,
        "shoulder_width": abs(l_sh.x - r_sh.x) * w,
        "center_x": ((l_sh.x + r_sh.x) / 2) * w,
        "center_y": ((l_sh.y + r_sh.y) / 2) * h,
    }
    
    return jsonify(data)
=======
#Start ur code
>>>>>>> 30cb36460b7ad4473a6e6780b3b4ea6a28eabfe3
