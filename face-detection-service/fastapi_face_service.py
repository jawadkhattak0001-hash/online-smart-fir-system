from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
import insightface
import os
import pickle

app = FastAPI(title="SmartFIR Face Detection Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model (same as your working test script)
model = insightface.app.FaceAnalysis(name='buffalo_l')
model.prepare(ctx_id=-1, det_size=(640, 640))

known_embeddings = []
known_suspect_ids = []
known_names = []

def load_known_embeddings():
    global known_embeddings, known_suspect_ids, known_names
    if os.path.exists("known_embeddings.pkl"):
        with open("known_embeddings.pkl", "rb") as f:
            data = pickle.load(f)
            known_embeddings = data.get("embeddings", [])
            known_suspect_ids = data.get("suspect_ids", [])
            known_names = data.get("names", [])

def save_known_embeddings():
    with open("known_embeddings.pkl", "wb") as f:
        pickle.dump({
            "embeddings": known_embeddings,
            "suspect_ids": known_suspect_ids,
            "names": known_names
        }, f)

@app.on_event("startup")
async def startup():
    load_known_embeddings()

@app.post("/process-frame")
async def process_frame(frame: dict):
    cam_id = frame.get("camera_id", "default")
    image_b64 = frame.get("image_base64")
    if not image_b64:
        return {"faces_detected": 0}
    
    image_bytes = base64.b64decode(image_b64)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"faces_detected": 0}
    
    faces = model.get(img)
    if len(faces) == 0:
        return {"faces_detected": 0}
    
    embedding = np.array(faces[0].embedding, dtype=np.float32)
    
    if len(known_embeddings) > 0:
        stored = np.array([np.array(e, dtype=np.float32) for e in known_embeddings])
        distances = np.linalg.norm(stored - embedding, axis=1)
        min_idx = int(np.argmin(distances))
        min_dist = float(distances[min_idx])
        if min_dist < 1.7:
            confidence = round((1 - min_dist / 2) * 100, 1)
            return {
                "faces_detected": 1,
                "matches": [{"suspectId": known_suspect_ids[min_idx], "confidence": confidence}]
            }
    
    return {"faces_detected": 1, "matches": []}
@app.post("/update-suspect")
async def update_suspect(suspect: dict):
    suspect_id = suspect.get("suspect_id")
    photo_b64 = suspect.get("photo_base64")
    name = suspect.get("name", "Unknown")
    if not suspect_id or not photo_b64:
        return {"success": False, "message": "Missing suspect_id or photo"}
    
    image_bytes = base64.b64decode(photo_b64)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"success": False, "message": "Invalid image"}
    
    faces = model.get(img)
    if len(faces) == 0:
        return {"success": False, "message": "No face detected in image"}
    
    embedding = faces[0].embedding
    
    if suspect_id in known_suspect_ids:
        idx = known_suspect_ids.index(suspect_id)
        known_embeddings[idx] = embedding
        known_names[idx] = name
    else:
        known_embeddings.append(embedding)
        known_suspect_ids.append(suspect_id)
        known_names.append(name)
    save_known_embeddings()
    return {"success": True, "suspectId": suspect_id}

@app.get("/health")
async def health():
    return {"status": "healthy", "known_suspects": len(known_embeddings)}