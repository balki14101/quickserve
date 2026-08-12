# Decisions Log

Short notes on why we chose what we chose. Added only when asked, not automatically per step.

## Backend hosting: Render

Alternatives considered: Railway, Fly.io

Why:

- Free tier, no credit card required (Railway needs a card after its trial credit; Fly.io asks for a card even for free usage)
- Zero infra to write — connects the GitHub repo directly and reuses the existing `build`/`start` scripts, no Dockerfile needed
  Limitation:
- The free tier will become idle after 10-15mins untouched surver. so for inital hit it will take 1-2 mins to hits the server and fetch response.
