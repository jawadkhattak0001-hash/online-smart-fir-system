import cv2
import numpy as np
import insightface

# Use buffalo_l (already downloaded)
model = insightface.app.FaceAnalysis(name='buffalo_l')
model.prepare(ctx_id=-1, det_size=(320, 320))

# Load your original photo (me.jpg)
with open('me.jpg', 'rb') as f:
    img_data = f.read()
nparr = np.frombuffer(img_data, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
if img is None:
    print("❌ Failed to decode image from file")
else:
    print(f"✅ Image loaded, shape: {img.shape}")
    faces = model.get(img)
    print(f"✅ Faces found: {len(faces)}")
    if faces:
        print(f"✅ Embedding shape: {faces[0].embedding.shape}")
    else:
        print("❌ No face detected – try a better photo")