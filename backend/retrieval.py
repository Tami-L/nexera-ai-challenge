# retrieval.py
# Maps user text prompts to available GLB model files.
# Extend this as more models are added to backend/models/

# Each key is a keyword that might appear in user input.
# Values are the filename (without path) of the GLB model.
MODEL_KEYWORD_MAP = {
    # Hard hat variants
    "hard hat": "hard_hat.glb",
    "hardhat": "hard_hat.glb",
    "helmet": "hard_hat.glb",
    "safety helmet": "hard_hat.glb",
    "construction helmet": "hard_hat.glb",
    "hard_hat": "hard_hat.glb",

    # Fire extinguisher variants
    "fire extinguisher": "fire_extinguisher.glb",
    "extinguisher": "fire_extinguisher.glb",
    "fire_extinguisher": "fire_extinguisher.glb",
    "fire safety": "fire_extinguisher.glb",
}

MODELS_BASE_PATH = "models"  # relative to FastAPI static mount


def get_model_filename(prompt: str) -> str:
    """
    Given a user prompt string, return the best matching GLB filename.
    Falls back to default.glb if no match is found.
    """
    prompt_lower = prompt.lower().strip()

    # Direct keyword match
    for keyword, filename in MODEL_KEYWORD_MAP.items():
        if keyword in prompt_lower:
            return filename

    # No match found
    return "default.glb"


def get_model_url(prompt: str) -> str:
    """
    Returns the full relative URL path for the frontend to load.
    e.g. "models/hard_hat.glb"
    """
    filename = get_model_filename(prompt)
    return f"{MODELS_BASE_PATH}/{filename}"