#!/usr/bin/env python3
import requests
import os
import csv
import json

# ──────────────────────────────────────────────────────────────
# CONFIGURATION
CLIENT_ID = "c538f291" 
TAG       = "ambient"
LIMIT     = 10              # Number of tracks to fetch (max 200)
OUT_DIR   = "jamendo_data"
CSV_FILE  = os.path.join(OUT_DIR, "jamendo_tracks.csv")
# ──────────────────────────────────────────────────────────────

API_URL = "https://api.jamendo.com/v3.0/tracks"

# Ensure output directory exists
os.makedirs(OUT_DIR, exist_ok=True)

def fetch_tracks():
    """Fetch track metadata, including musicinfo.tags, stats, and download URLs."""
    params = {
        "client_id":     CLIENT_ID,
        "format":        "json",
        "limit":         LIMIT,
        "tags":          TAG,
        "audioformat":   "mp31",
        "audiodlformat": "mp31",
        "include":       "musicinfo+licenses+stats"
    }
    resp = requests.get(API_URL, params=params)
    resp.raise_for_status()
    return resp.json().get("results", [])

def download_mp3(url, path):
    """Stream-download an MP3 if allowed by the API."""
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(path, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    tracks = fetch_tracks()
    if not tracks:
        print("⚠️ No tracks returned. Check CLIENT_ID and TAG.")
        return

    # ─── Define CSV Columns ─────────────────────────────────────
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

    # ─── Write CSV ─────────────────────────────────────────────
    with open(CSV_FILE, "w", newline="", encoding="utf-8") as cf:
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()

        for idx, t in enumerate(tracks, start=1):
            # Extract genres from musicinfo.tags
            genres = ",".join(t.get("musicinfo", {}).get("tags", {}).get("genres", []))

            stats = t.get("stats", {})

            row = {
                "id":                         t.get("id",""),
                "name":                       t.get("name",""),
                "artist_name":                t.get("artist_name",""),
                "duration":                   t.get("duration",""),
                "audio":                      t.get("audio",""),
                "audiodownload":              t.get("audiodownload",""),
                "file_path":                  "",

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

            # Download MP3 if allowed
            if t.get("audiodownload_allowed", False):
                safe_title  = row["name"].replace(" ", "_").replace("/", "_")
                safe_artist = row["artist_name"].replace(" ", "_").replace("/", "_")
                filename    = f"{idx:03d}_{safe_artist}-{safe_title}.mp3"
                path        = os.path.join(OUT_DIR, filename)
                if download_mp3(row["audiodownload"], path):
                    row["file_path"] = path

            writer.writerow(row)

    print(f"\n✅ CSV saved to {CSV_FILE}")
    print(f"🎧 MP3s (where permitted) are in: {OUT_DIR}/")

if __name__ == "__main__":
    main()
