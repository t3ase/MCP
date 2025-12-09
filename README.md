# Mood-Based Music & Quote MCP Server

An MCP-style server that reacts to WhatsApp/SMS messages: it classifies the user's mood, fetches a curated Spotify playlist, adds a motivational/funny quote, and can optionally deliver a voice note (ElevenLabs). Includes Twilio webhook for inbound WhatsApp and simple MCP endpoints for tool calls.

## Quick start

1) Install deps  
```bash
npm install
```

2) Copy env template  
```bash
cp config/env.example .env
```
Fill in Spotify client credentials, Twilio (for WhatsApp/SMS), and optional ElevenLabs + OpenAI.

3) Run dev server  
```bash
npm run dev
```

## Endpoints

- `GET /healthz` – health check
- `GET /mcp/tools` – list available tools
- `POST /mcp/call` – invoke a tool: `{ "name": "run_mood_flow", "input": { "to": "whatsapp:+1...", "text": "I feel stressed", "includeVoice": false } }`
- `POST /webhooks/twilio` – Twilio WhatsApp/SMS webhook; echoes back playlist + quote

## Tools exposed
- `detect_mood`
- `get_playlist`
- `get_quote`
- `synthesize_voice` (if ElevenLabs configured)
- `send_message`
- `run_mood_flow` (end-to-end orchestration)

## Notes
- Voice replies require hosting the MP3 somewhere accessible; the current stub generates audio but does not upload it. Add an object-store upload to send `MediaUrl` with Twilio.
- Mood classification defaults to a keyword heuristic; plug in an LLM if desired.
- MCP shape here is HTTP-based for simplicity; can be adapted to an MCP transport.


