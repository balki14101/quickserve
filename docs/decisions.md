# Decisions Log

Short notes on why we chose what we chose. Added only when asked, not automatically per step.

## Backend hosting: Render

Alternatives considered: Railway, Fly.io

Why:

- Free tier, no credit card required (Railway needs a card after its trial credit; Fly.io asks for a card even for free usage)
- Zero infra to write — connects the GitHub repo directly and reuses the existing `build`/`start` scripts, no Dockerfile needed

Limitation:

- The free tier goes idle after 10-15 minutes of inactivity, so the first hit after that takes 1-2 minutes to wake the server and respond.
