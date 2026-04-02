# Simple model database
MODEL_DB = {
    "hard hat": "/helm.obj",
    "fire extinguisher": "/models/fire_extinguisher.glb",
    "helmet": "/helm.obj"
}

def get_model(object_name):
    return MODEL_DB.get(object_name.lower(), "/models/default.glb")