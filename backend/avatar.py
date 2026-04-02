# backend/avatar.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="NexEra Avatar API")

# Enable CORS for frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing only, replace with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"]
)

# Map user commands to GLB files
COMMAND_MAP = {
    "wave": "models/avatar/wave.glb",
    "walk": "models/avatar/walk.glb",
    "point": "models/avatar/point.glb",
    "view": "models/avatar/view.glb",
    "default": "models/avatar/T-pose.glb"
}

@app.get("/avatar-action")
def avatar_action(command: str):
    """
    Returns the GLB file and explanation for a given avatar command.

    Args:
        command (str): Text command like 'wave', 'walk', 'point', 'view'

    Returns:
        JSON: {"animation": "path/to/file.glb", "explanation": "..."}
    """
    # Normalize command to lowercase
    cmd = command.lower()

    # Get corresponding GLB file
    animation_file = COMMAND_MAP.get(cmd, COMMAND_MAP["default"])

    # Build a simple AI-like explanation
    explanation = f"This action represents '{cmd}' in a training scenario."

    # Return as JSON
    return JSONResponse(content={
        "animation": animation_file,
        "explanation": explanation
    })