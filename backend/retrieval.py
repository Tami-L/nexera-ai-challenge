# retrieval.py
MODEL_KEYWORD_MAP = {
    "hard hat": "hard_hat.glb",
    "hardhat": "hard_hat.glb",
    "helmet": "hard_hat.glb",
    "safety helmet": "hard_hat.glb",
    "construction helmet": "hard_hat.glb",
    "hard_hat": "hard_hat.glb",
    "fire extinguisher": "fire_extinguisher.glb",
    "extinguisher": "fire_extinguisher.glb",
    "fire_extinguisher": "fire_extinguisher.glb",
    "fire safety": "fire_extinguisher.glb",
}

MODELS_BASE_PATH = "models"

AVATAR_ANIMATIONS = {
    "idle":   "idle.fbx",
    "wave":   "wave.fbx",
    "walk":   "walk.fbx",
    "point":  "point.fbx",
    "view":   "view.fbx",
    "T-pose": "T-pose.fbx",
    "default": "idle.fbx",
}


def get_model_filename(prompt: str) -> str:
    prompt_lower = prompt.lower().strip()
    for keyword, filename in MODEL_KEYWORD_MAP.items():
        if keyword in prompt_lower:
            return filename
    return "fire_extinguisher.glb"


def get_model_url(prompt: str) -> str:
    filename = get_model_filename(prompt)
    return f"{MODELS_BASE_PATH}/{filename}"


def get_avatar_animation_url(animation_name: str) -> str:
    filename = AVATAR_ANIMATIONS.get(animation_name, "idle.fbx")
    return f"{MODELS_BASE_PATH}/avatar/{filename}"