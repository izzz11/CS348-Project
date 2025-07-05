#!/usr/bin/env python3
import requests
import os
import csv

# ──────────────────────────────────────────────────────────────
# CONFIGURATION
CLIENT_ID = "c538f291"
TAGS      = ["pop", "jazz", "rock", "blues", "electronic", "disco", "ambient", "dance"]  # Multiple genres
LIMIT     = 10 # Limit per genre, adjust as needed
OUT_DIR   = "jamendo_data"
CSV_FILE  = os.path.join(OUT_DIR, "jamendo_tracks.csv")
# ──────────────────────────────────────────────────────────────

API_URL = "https://api.jamendo.com/v3.0/tracks"
os.makedirs(OUT_DIR, exist_ok=True)

def fetch_tracks(tag):
    """Fetch track metadata for a given genre tag."""
    params = {
        "client_id":     CLIENT_ID,
        "format":        "json",
        "limit":         LIMIT,
        "tags":          tag,
        "audioformat":   "mp31",
        "audiodlformat": "mp31",
        "include":       "musicinfo+licenses+stats"
    }
    resp = requests.get(API_URL, params=params)
    resp.raise_for_status()
    return resp.json().get("results", [])

def main():
    fieldnames = [
        "id","name","artist_name","duration",
        "audio","audiodownload","file_path",
        "genres",
        "shareurl","album_id","album_name","album_image",
        "artist_id","position","license_ccurl",
        "stats_rate_downloads_total","stats_rate_listened_total",
        "stats_playlisted","stats_favorited","stats_likes",
        "stats_dislikes","stats_avgnote","stats_notes"
    ]

    with open(CSV_FILE, "w", newline="", encoding="utf-8") as cf:
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()

        for tag in TAGS:
            print(f"🎵 Fetching genre: {tag}")
            tracks = fetch_tracks(tag)
            if not tracks:
                print(f"⚠️  No tracks found for tag: {tag}")
                continue

            for t in tracks:
                genres = ",".join(t.get("musicinfo", {}).get("tags", {}).get("genres", []))
                stats = t.get("stats", {})

                row = {
                    "id":                         t.get("id",""),
                    "name":                       t.get("name",""),
                    "artist_name":                t.get("artist_name",""),
                    "duration":                   t.get("duration",""),
                    "audio":                      t.get("audio",""),
                    "audiodownload":              t.get("audiodownload",""),
                    "file_path":                  "",  # No download
                    "genres":                     genres,
                    "shareurl":                   t.get("shareurl",""),
                    "album_id":                   t.get("album_id",""),
                    "album_name":                 t.get("album_name",""),
                    "album_image":                t.get("album_image",""),
                    "artist_id":                  t.get("artist_id",""),
                    "position":                   t.get("position",""),
                    "license_ccurl":              t.get("license_ccurl",""),
                    "stats_rate_downloads_total": stats.get("rate_downloads_total",""),
                    "stats_rate_listened_total":  stats.get("rate_listened_total",""),
                    "stats_playlisted":           stats.get("playlisted",""),
                    "stats_favorited":            stats.get("favorited",""),
                    "stats_likes":                stats.get("likes",""),
                    "stats_dislikes":             stats.get("dislikes",""),
                    "stats_avgnote":              stats.get("avgnote",""),
                    "stats_notes":                stats.get("notes",""),
                }

                writer.writerow(row)

    print(f"\n✅ CSV saved to {CSV_FILE}")

if __name__ == "__main__":
    main()
