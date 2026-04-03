# backend/app.py
import os
import base64
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from ai import parse_avatar_command, generate_educational_summary, identify_object_from_image
from retrieval import get_model_url

load_dotenv()

app = FastAPI(title="NexEra AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve all GLB models statically
models_dir = os.path.join(os.path.dirname(__file__), "models")
app.mount("/models", StaticFiles(directory=models_dir), name="models")


# -------------------------------------------------------
# TEST 2 — Avatar: Natural Language → Animation
# -------------------------------------------------------

@app.get("/avatar-action")
async def avatar_action(command: str):
    """
    Accepts a natural language command.
    GPT interprets it and maps it to an animation + explanation.
    """
    result = parse_avatar_command(command)
    animation_name = result["animation"]
    explanation = result["explanation"]
    animation_url = f"models/avatar/{animation_name}.glb"

    return JSONResponse({
        "animation": animation_url,
        "animation_name": animation_name,
        "explanation": explanation,
        "command_received": command
    })


# -------------------------------------------------------
# TEST 1 — 3D Asset Pipeline: Text → 3D Model
# -------------------------------------------------------

@app.get("/generate-3d")
async def generate_3d(query: str):
    """
    Accepts a text description. Returns a matching GLB model URL
    and a GPT-generated educational summary.
    """
    model_url = get_model_url(query)
    summary = generate_educational_summary(query)

    return JSONResponse({
        "model": model_url,
        "explanation": summary,
        "query": query
    })


# -------------------------------------------------------
# TEST 1 — 3D Asset Pipeline: Image Upload → 3D Model
# -------------------------------------------------------

@app.post("/generate-3d-from-image")
async def generate_3d_from_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image. Uses GPT-4o Vision to identify the object,
    then returns the closest matching GLB model + educational summary.
    """
    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    content_type = file.content_type or "image/jpeg"

    identified_object = identify_object_from_image(image_base64, content_type)
    model_url = get_model_url(identified_object)
    summary = generate_educational_summary(identified_object)

    return JSONResponse({
        "model": model_url,
        "explanation": summary,
        "identified_as": identified_object
    })


# -------------------------------------------------------
# Root
# -------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "NexEra AI API is running",
        "endpoints": [
            "GET  /avatar-action?command=<natural language>",
            "GET  /generate-3d?query=<object description>",
            "POST /generate-3d-from-image  (multipart image upload)"
        ]
    }