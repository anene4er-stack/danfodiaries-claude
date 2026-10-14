# DanfoDiaries — Claude connector

Starter repository with examples showing how to call Anthropic Claude (Node and Python).

This repo contains minimal examples only — intended as a starting point. Set your ANTHROPIC_API_KEY in environment before running.

Quickstart
---------

Node (requires Node 18+):

1. Copy .env.example to .env and set ANTHROPIC_API_KEY
2. cd examples/node
3. npm install (not required for Node 18+ since this example uses global fetch; package.json exists so you can run npm start)
4. npm start

Python (requires Python 3.8+):

1. Copy .env.example to .env and set ANTHROPIC_API_KEY
2. python -m pip install requests python-dotenv
3. python examples/py/example.py

Files added
- examples/node/index.js — Node example using fetch
- examples/node/package.json — minimal package.json (type module)
- examples/py/example.py — Python requests example
- .env.example — env template
- README.md — this quickstart and notes

Notes
- The examples use the Anthropic HTTP API endpoint at https://api.anthropic.com/v1/complete and the X-API-Key header (ANTHROPIC_API_KEY). Adjust model names and endpoint if Anthropic's API changes.
