# backend/app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import random

app = FastAPI(title="NexEra Avatar API")

# Allow frontend to access backend from different port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the models directory so frontend can access .glb files
models_dir = os.path.join(os.path.dirname(__file__), "models")
app.mount("/models", StaticFiles(directory=models_dir), name="models")

# -------------------
# Avatar Commands
# -------------------
COMMAND_MAP = {
    "wave": "models/avatar/wave.glb",
    "walk": "models/avatar/walk.glb",
    "point": "models/avatar/point.glb",
    "view": "models/avatar/view.glb",
    "default": "models/avatar/T-pose.glb"
}

def get_avatar_animation(command: str):
    cmd = command.lower()
    animation_file = COMMAND_MAP.get(cmd, COMMAND_MAP["default"])
    explanation = f"This action represents '{cmd}' in a training scenario."
    return JSONResponse({"animation": animation_file, "explanation": explanation})

@app.get("/avatar-action")
def avatar_action(command: str):
    return get_avatar_animation(command)

# -------------------
# Simulated AI 3D Generation
# -------------------
# Map some example object prompts to GLB models
SIMULATED_3D_MODELS = {
    "helmet": "models/3d/helmet.glb",
    "hammer": "models/3d/hammer.glb",
    "screwdriver": "models/3d/screwdriver.glb",
    "wrench": "models/3d/wrench.glb",
}

def get_3d_model(prompt: str):
    prompt_lower = prompt.lower()
    # If exact match exists, return it
    if prompt_lower in SIMULATED_3D_MODELS:
        model_file = SIMULATED_3D_MODELS[prompt_lower]
    else:
        # Pick a random existing 3D model for unknown prompts
        model_file = random.choice(list(SIMULATED_3D_MODELS.values()))
    explanation = f"This 3D object represents '{prompt}' for training purposes."
    return JSONResponse({"model": model_file, "explanation": explanation})

@app.get("/generate-3d")
def generate_3d(query: str):
    return get_3d_model(query)

# -------------------
# Root Endpoint
# -------------------
@app.get("/")
def root():
    return {"message": "Welcome to NexEra Avatar API!"}