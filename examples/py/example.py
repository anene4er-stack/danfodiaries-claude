import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('ANTHROPIC_API_KEY')
MODEL = os.getenv('CLAUDE_MODEL', 'claude-2')
ENDPOINT = 'https://api.anthropic.com/v1/complete'

if not API_KEY:
    print('Error: ANTHROPIC_API_KEY not set. Copy .env.example to .env and set it or export the variable in your shell.')
    sys.exit(1)

prompt = """
Human: Write a short friendly summary (2-3 sentences) of why people enjoy journaling for the "DanfoDiaries" project.

Assistant:
"""

json_body = {
    'model': MODEL,
    'prompt': prompt,
    'max_tokens': 300,
    'temperature': 0.2,
}

headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
}

resp = requests.post(ENDPOINT, headers=headers, json=json_body)

if not resp.ok:
    print(f'Error: HTTP {resp.status_code} - {resp.text}')
    sys.exit(1)

print('Response JSON:\n', resp.json())
