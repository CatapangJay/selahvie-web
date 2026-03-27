/**
 * Built-in royalty-free music tracks available to all wedding templates.
 * Audio served from Bensound (https://www.bensound.com) under the free license.
 * Attribution is included per their license terms.
 *
 * To add your own track, drop an MP3 into /public/music/ and register it here,
 * or let couples paste a custom hosted URL in the customization studio.
 */

export interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  description: string;
  src: string;
  attribution: string;
}

export const CUSTOM_TRACK_ID = "custom";
export const NO_MUSIC_ID     = "none";

export const musicTracks: MusicTrack[] = [
  {
    id: "romantic",
    name: "Romantic",
    mood: "Romantic",
    description: "Soft piano & strings, perfect for an intimate ceremony",
    src: "https://www.bensound.com/bensound-music/bensound-romantic.mp3",
    attribution: "Bensound.com",
  },
  {
    id: "sweet",
    name: "Sweet",
    mood: "Tender",
    description: "A tender, delicate melody that feels like a first dance",
    src: "https://www.bensound.com/bensound-music/bensound-sweet.mp3",
    attribution: "Bensound.com",
  },
  {
    id: "memories",
    name: "Memories",
    mood: "Nostalgic",
    description: "Warm, nostalgic piano — ideal for the Our Story section",
    src: "https://www.bensound.com/bensound-music/bensound-memories.mp3",
    attribution: "Bensound.com",
  },
  {
    id: "tenderness",
    name: "Tenderness",
    mood: "Gentle",
    description: "Gentle guitar & ambient pads for a peaceful atmosphere",
    src: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3",
    attribution: "Bensound.com",
  },
  {
    id: "dreams",
    name: "Dreams",
    mood: "Dreamy",
    description: "Ethereal synth & piano swells for a modern luxe feel",
    src: "https://www.bensound.com/bensound-music/bensound-dreams.mp3",
    attribution: "Bensound.com",
  },
  {
    id: "jazzy-frenchy",
    name: "Jazzy Frenchy",
    mood: "Cocktail Hour",
    description: "Light accordion jazz — great for cocktail hour vibes",
    src: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3",
    attribution: "Bensound.com",
  },
];

/**
 * Resolve the final audio src from a config's music fields.
 * Returns null if no music is selected, so the player doesn't render.
 */
export function resolveMusicSrc(
  musicTrackId: string | undefined,
  musicCustomUrl: string | undefined
): string | null {
  if (!musicTrackId || musicTrackId === NO_MUSIC_ID) return null;
  if (musicTrackId === CUSTOM_TRACK_ID) return musicCustomUrl?.trim() || null;
  return musicTracks.find((t) => t.id === musicTrackId)?.src ?? null;
}
