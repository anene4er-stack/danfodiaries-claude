import os
import sys

from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

API_KEY = os.getenv('ANTHROPIC_API_KEY')
MODEL = os.getenv('CLAUDE_MODEL', 'claude-3-5-sonnet-20241022')

if not API_KEY:
    print('Error: ANTHROPIC_API_KEY not set. Create a .env file from .env.example and add your key.')
    sys.exit(1)

client = Anthropic(api_key=API_KEY)

prompt = """
You are a helpful journaling assistant.

Write a brief, encouraging summary of why journaling helps people feel more grounded and self-aware.
"""

response = client.messages.create(
    model=MODEL,
    max_tokens=400,
    temperature=0.4,
    messages=[{"role": "user", "content": prompt}],
)

print(response)
