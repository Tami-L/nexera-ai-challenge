import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def parse_avatar_command(user_input: str) -> dict:
    available_animations = ["idle", "wave", "walk", "point", "view", "T-pose"]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=300,
        messages=[
            {
                "role": "system",
                "content": "You are an AI that controls a 3D training avatar. Respond only in the exact format requested."
            },
            {
                "role": "user",
                "content": f"""The user has given a command: "{user_input}"

Available animations: {available_animations}

Your job:
1. Pick the single best matching animation from the list above.
2. Write a one-sentence explanation of what the avatar is doing and why it matters in a training context.

Respond in this exact format (no extra text):
ANIMATION: <animation_name>
EXPLANATION: <one sentence explanation>"""
            }
        ]
    )

    raw = response.choices[0].message.content.strip()
    lines = raw.splitlines()

    animation = "idle"
    explanation = "The avatar is standing by in a neutral position."

    for line in lines:
        if line.startswith("ANIMATION:"):
            val = line.replace("ANIMATION:", "").strip()
            if val in available_animations:
                animation = val
        elif line.startswith("EXPLANATION:"):
            explanation = line.replace("EXPLANATION:", "").strip()

    return {"animation": animation, "explanation": explanation}


def generate_educational_summary(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=200,
        messages=[
            {
                "role": "system",
                "content": "You are an educational AI assistant for workplace safety training. Be concise and beginner-friendly."
            },
            {
                "role": "user",
                "content": f"""Generate a short, practical 2-sentence description of this object for a training module: "{prompt}"

Focus on:
- What it is and what it's used for
- Any safety or usage tips relevant to a trainee

No bullet points, just plain sentences."""
            }
        ]
    )

    return response.choices[0].message.content.strip()


def identify_object_from_image(image_base64: str, content_type: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{image_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": """Identify the main object in this image in 3-5 words.
Focus on workplace safety tools or equipment if present.
Respond with ONLY the object name, nothing else. Example: yellow hard hat"""
                    }
                ]
            }
        ]
    )

    return response.choices[0].message.content.strip()