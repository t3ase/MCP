// src/routes/webhooks.ts
import { Router } from "express";
import { getPlaylistForMood } from "../clients/spotifyClient";
import { sendTwilioMessage } from "../clients/twilioClient";
import { logger } from "../utils/logger";

export const webhooksRouter = Router();

// Twilio WhatsApp webhook
// Configure Twilio to POST here:  POST /webhooks/twilio/whatsapp
webhooksRouter.post("/twilio/whatsapp", async (req, res) => {
  try {
    const from = req.body.From as string | undefined;   // e.g. "whatsapp:+91..."
    const body = (req.body.Body as string | undefined) || "";

    if (!from || !body) {
      logger.error({ from, body }, "Missing From or Body in Twilio webhook");
      return res.status(400).json({ ok: false, error: "missing_from_or_body" });
    }

    // 👇 USER INPUT = MOOD (no hardcoding)
    const mood = body.trim().toLowerCase();

    logger.info({ from, mood }, "Incoming WhatsApp mood request");

    const tracks = await getPlaylistForMood(mood);

    let reply: string;

    if (!tracks.length) {
      reply =
        `I couldn't find any songs for the mood "${mood}". ` +
        `Try another mood like: happy, sad, chill, party.`;
    } else {
      const first = tracks[0];
      reply =
        `Mood: ${mood}\n` +
        `Song: ${first.name}\n` +
        `Artists: ${first.artists}\n` +
        (first.url ? `Link: ${first.url}` : "");
    }

    // send reply back to the same WhatsApp user
    await sendTwilioMessage(from, reply);

    // Twilio only needs a 200 OK quickly
    res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err }, "Error handling Twilio WhatsApp webhook");
    res.status(500).json({
      ok: false,
      error: "internal_error",
      details: String(err?.message || err),
    });
  }
});
