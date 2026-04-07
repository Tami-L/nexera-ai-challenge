# ai.py

import os
import json
from openai import OpenAI

def get_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key)


def detect_object_from_text(query: str):
    client = get_client()

    if client is None:
        return "", 0.0  # fallback mode

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Extract the main physical object. Return JSON: {object, confidence}"
                },
                {"role": "user", "content": query}
            ],
            temperature=0,
        )

        data = json.loads(response.choices[0].message.content)

        return data.get("object", ""), data.get("confidence", 0.5)

    except Exception:
        return "", 0.0


def detect_object_from_image(image_bytes: bytes):
    client = get_client()

    if client is None:
        return "", 0.0

    try:
        import base64
        encoded = base64.b64encode(image_bytes).decode("utf-8")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Identify object. Return JSON: {object, confidence}"
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": "What is this?"},
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{encoded}"
                        }
                    ]
                }
            ],
            temperature=0,
        )

        data = json.loads(response.choices[0].message.content)

        return data.get("object", ""), data.get("confidence", 0.5)

    except Exception:
        return "", 0.0


def map_avatar_command(command: str):
    client = get_client()

    if client is None:
        return "idle", 0.0, "No API key, fallback to idle"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
Classify command into: wave, walk, point, idle.
Return JSON: {intent, confidence, explanation}
"""
                },
                {"role": "user", "content": command}
            ],
            temperature=0,
        )

        data = json.loads(response.choices[0].message.content)

        return (
            data.get("intent", "idle"),
            data.get("confidence", 0.5),
            data.get("explanation", "")
        )

    except Exception:
        return "idle", 0.0, "Fallback"