from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def parse_user_input(text):
    prompt = f"""
    Extract the main object and intent from this text:
    "{text}"
    Return JSON with keys: object, action
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except:
            return {"object": text, "action": "view"}
    except Exception as e:
        print("AI parse_user_input error:", e)
        return {"object": text, "action": "view"}

def generate_explanation(object_name):
    prompt = f"Explain what {object_name} is used for in training scenarios."
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print("AI generate_explanation error:", e)
        return f"This is a {object_name}, commonly used in training."