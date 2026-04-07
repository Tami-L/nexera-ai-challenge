# app.py

import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ai import (
    detect_object_from_text,
    detect_object_from_image,
    map_avatar_command
)


from retrieval import resolve_object, MODEL_MAP

app = FastAPI()
from fastapi.staticfiles import StaticFiles

# Serve the models folder so frontend can load .glb files
app.mount("/models", StaticFiles(directory="models"), name="models")

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve models
app.mount("/models", StaticFiles(directory="models"), name="models")


def build_response(obj, summary, confidence, fallback=False):
    return {
        "object": obj,
        "model_path": f"/models/{MODEL_MAP[obj]}",
        "summary": summary,
        "confidence": confidence,
        "fallback": fallback
    }


@app.get("/")
def root():
    return {
        "message": "NexEra AI API",
        "endpoints": [
            "/health",
            "/generate-3d",
            "/generate-3d-from-image",
            "/avatar-action"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": list(MODEL_MAP.values())
    }


@app.get("/generate-3d")
def generate_3d(query: str):
    detected_object, confidence = detect_object_from_text(query)

    obj, fallback_flag = resolve_object(detected_object)

    if obj not in MODEL_MAP:
        obj = "default"
        fallback_flag = True

    summary = f"This is a {obj.replace('_', ' ')}."

    return build_response(obj, summary, confidence, fallback_flag)


@app.post("/generate-3d-from-image")
async def generate_3d_from_image(file: UploadFile = File(...)):
    image_bytes = await file.read()

    detected_object, confidence = detect_object_from_image(image_bytes)

    obj, fallback_flag = resolve_object(detected_object)

    if obj not in MODEL_MAP:
        obj = "default"
        fallback_flag = True

    summary = f"This appears to be a {obj.replace('_', ' ')}."

    return build_response(obj, summary, confidence, fallback_flag)


@app.get("/avatar-action")
def avatar_action(command: str):
    intent, confidence, explanation = map_avatar_command(command)

    valid_intents = ["wave", "walk", "point", "idle"]

    if intent not in valid_intents:
        intent = "idle"

    return {
        "animation": f"/models/avatar/{intent}.glb",
        "intent": intent,
        "confidence": confidence,
        "explanation": explanation
    }


@app.get("/test")
def test():
    return {
        "status": "ok",
        "files": os.listdir("models")
    }