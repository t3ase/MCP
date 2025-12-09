// src/clients/spotifyClient.ts
import SpotifyWebApi from "spotify-web-api-node";
import { config } from "../config/env";
import { logger } from "../utils/logger";

const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
});

async function ensureAccessToken() {
  if (!config.spotify.clientId || !config.spotify.clientSecret) {
    throw new Error("Missing Spotify client credentials in .env");
  }

  const tokenData = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(tokenData.body.access_token);
}

type TrackInfo = {
  name: string;
  artists: string;
  url?: string;
};

export async function getPlaylistForMood(mood: string): Promise<TrackInfo[]> {
  await ensureAccessToken();

  const query = mood || "happy";

  const search = await spotifyApi.searchPlaylists(query, { limit: 5 });

  // Log raw response once to understand structure (will show in terminal)
  console.log("Spotify playlists search result:", JSON.stringify(search.body.playlists, null, 2));

  const rawItems = search.body.playlists?.items ?? [];

  // Filter out any null/undefined items
  const playlists = (rawItems as any[]).filter((p) => p && p.id);

  if (playlists.length === 0) {
    logger.warn({ mood, query, raw: search.body.playlists }, "No valid playlists found");
    return [];
  }

  const first = playlists[0];
  const playlistId = first.id as string;

  const playlistTracks = await spotifyApi.getPlaylistTracks(playlistId, {
    limit: 10,
  });

  const trackItems = (playlistTracks.body.items ?? []) as any[];

  return trackItems
    .map((item) => {
      const track = item?.track;
      if (!track) return null;

      const artistsArr = (track.artists ?? []) as any[];

      return {
        name: track.name as string,
        artists: artistsArr.map((a) => a.name as string).join(", "),
        url: track.external_urls?.spotify as string | undefined,
      };
    })
    .filter(Boolean) as TrackInfo[];
}

// keep compatibility with old name
export const getTracksForMood = getPlaylistForMood;
