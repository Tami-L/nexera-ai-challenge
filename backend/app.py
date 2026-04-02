from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from ai import parse_user_input, generate_explanation
from retrieval import get_model
import os
import traceback

app = FastAPI()

# Ensure models directory exists
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

app.mount("/models", StaticFiles(directory=MODELS_DIR), name="models")

@app.get("/")
def read_root():
    return {"message": "NexEra AI Backend Running 🚀"}
from avatar import get_avatar_animation

@app.get("/avatar-action")
def avatar_action(command: str):
    try:
        result = get_avatar_animation(command)
        return result
    except Exception as e:
        return {"animation": "models/avatar/T-pose.glb", "explanation": f"Error: {e}"}


@app.get("/generate-3d")
def generate_3d(query: str = Query(...)):
    try:
        parsed = parse_user_input(query)
        if not isinstance(parsed, dict):
            parsed = {"object": query, "action": "view"}
        object_name = parsed.get("object", query)
        model_path = get_model(object_name)
        explanation = generate_explanation(object_name)
        return {"object": object_name, "model": model_path, "explanation": explanation}
    except Exception:
        print("Error in /generate-3d:", traceback.format_exc())
        return {
            "object": query,
            "model": get_model(query),
            "explanation": f"Could not generate AI explanation for '{query}'."
        }