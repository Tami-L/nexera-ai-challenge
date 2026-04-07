# retrieval.py

MODEL_MAP = {
    "fire_extinguisher": "fire_extinguisher.glb",
    "hard_hat": "hard_hat.glb",
    "default": "default.glb"
}

SYNONYMS = {
    "fire_extinguisher": [
        "extinguisher",
        "fire safety",
        "fire device",
        "fire suppression"
    ],
    "hard_hat": [
        "helmet",
        "safety helmet",
        "construction helmet",
        "head protection"
    ]
}


def resolve_object(user_input: str):
    if not user_input:
        return "default", True

    text = user_input.lower()

    # Exact match
    for key in MODEL_MAP:
        if key in text:
            return key, False

    # Synonym match
    for key, words in SYNONYMS.items():
        for word in words:
            if word in text:
                return key, False

    return "default", True