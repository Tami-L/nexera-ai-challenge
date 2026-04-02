# backend/app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

app = FastAPI(title="NexEra Avatar API")

# Serve the models directory so frontend can access .glb files
models_dir = os.path.join(os.path.dirname(__file__), "models")
app.mount("/models", StaticFiles(directory=models_dir), name="models")

# Map avatar commands to GLB files
COMMAND_MAP = {
    "wave": "models/avatar/wave.glb",
    "walk": "models/avatar/walk.glb",
    "point": "models/avatar/point.glb",
    "view": "models/avatar/view.glb",
    "default": "models/avatar/T-pose.glb"
}

# Helper function to get avatar animation and explanation
def get_avatar_animation(command: str):
    cmd = command.lower()
    animation_file = COMMAND_MAP.get(cmd, COMMAND_MAP["default"])
    explanation = f"This action represents '{cmd}' in a training scenario."
    return JSONResponse({"animation": animation_file, "explanation": explanation})

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to NexEra Avatar API!"}

# Avatar action endpoint
@app.get("/avatar-action")
def avatar_action(command: str):
    return get_avatar_animation(command)