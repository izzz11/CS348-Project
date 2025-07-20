#!/usr/bin/env python3
import requests
import os
import csv

# ──────────────────────────────────────────────────────────────
# CONFIGURATION
CLIENT_ID        = "c538f291"
TAGS             = [
    "pop", "jazz", "rock", "blues", "electronic",
    "disco", "ambient", "dance", "waltz", "loop",
    "hiphop", "classical", "country", "reggae",
    "folk", "metal", "punk", "ska", "soul", "rnb",
    "techno", "house", "trance", "alternative",
    "indie", "latin", "world", "soundtrack",
    "k-pop", "j-pop", "vocaloid", "grunge",
    "emo", "ska punk", "bluegrass", "gospel",
    "downtempo", "drum and bass", "dubstep",
    "electro swing", "chillout", "new age"
]
LIMIT            = 200                    # Jamendo's max per request
MAX_PAGES_PER_TAG = 10                    # 10 pages * 200 = 2000 tracks/tag
TARGET_FILE_SIZE = 10 * 1024 * 1024       # 10 MB in bytes
OUT_DIR          = "jamendo_data"
CSV_FILE         = os.path.join(OUT_DIR, "jamendo_tracks.csv")
API_URL = "https://api.jamendo.com/v3.0/tracks"
# ──────────────────────────────────────────────────────────────

os.makedirs(OUT_DIR, exist_ok=True)

def fetch_tracks(tag, offset=0):
    params = {
        "client_id":     CLIENT_ID,
        "format":        "json",
        "limit":         LIMIT,
        "offset":        offset,
        "tags":          tag,
        "audioformat":   "mp31",
        "audiodlformat": "mp31",
        "include":       "musicinfo+licenses+stats",
    }
    resp = requests.get(API_URL, params=params)
    resp.raise_for_status()
    return resp.json().get("results", [])

def main():
    # Only the fields you need:
    fieldnames = [
        "id",
        "name",
        "genres",
        "artist_name",
        "duration",
        "audio",
        "audiodownload"
    ]

    seen_ids = set()
    done = False

    with open(CSV_FILE, "w", newline="", encoding="utf-8") as cf:
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()

        for tag in TAGS:
            if done: break
            print(f"🎵 Fetching genre: {tag}")
            for page in range(MAX_PAGES_PER_TAG):
                offset = page * LIMIT
                tracks = fetch_tracks(tag, offset)
                if not tracks:
                    break

                for t in tracks:

                    track_id = t.get("id", "")
                    name = t.get("name", "")
                    audiodownload = t.get("audiodownload")
                    artist_name = t.get("artist_name")
                    # Filter out duplicates, missing audiodownload, or name too long
                    if (
                        not track_id or
                        track_id in seen_ids or
                        not audiodownload or
                        not artist_name or
                        len(name) > 100
                    ):
                        continue

                    seen_ids.add(track_id)

                    genres = ",".join(
                        t.get("musicinfo", {}).get("tags", {}).get("genres", [])
                    )

                    row = {
                        "id":            track_id,
                        "name":          name,
                        "genres":        genres,
                        "artist_name":   t.get("artist_name", ""),
                        "duration":      t.get("duration", ""),
                        "audio":         t.get("audio", ""),
                        "audiodownload": audiodownload,
                    }
                    writer.writerow(row)
                    cf.flush()

                    if os.path.getsize(CSV_FILE) >= TARGET_FILE_SIZE:
                        print(f"\n✅ Reached ~10 MB.")
                        done = True
                        break
                if done: break

    print(f"\n✅ CSV saved to {CSV_FILE} ({os.path.getsize(CSV_FILE)} bytes)")

if __name__ == "__main__":
    main()