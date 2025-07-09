#!/usr/bin/env python3
"""
Script to populate the database with sample data for testing the matching system.
This creates users with different music preferences to test the matching algorithm.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.db import run
from database.utils import user_repo, user_actions_repo
from database.schema.models import UserCreate, UserTrackActionCreate
import uuid
import random

def create_sample_users():
    """Create sample users with different music preferences"""
    
    sample_users = [
        {
            "username": "musiclover_alex",
            "name": "Alex Johnson",
            "age": 25,
            "country": "USA",
            "preferred_genres": ["Pop", "Rock", "Electronic"],
            "preferred_artists": ["The Weeknd", "Dua Lipa", "Calvin Harris"]
        },
        {
            "username": "jazz_fan_sarah",
            "name": "Sarah Chen",
            "age": 28,
            "country": "Canada",
            "preferred_genres": ["Jazz", "Classical", "Blues"],
            "preferred_artists": ["Miles Davis", "Ella Fitzgerald", "John Coltrane"]
        },
        {
            "username": "rock_star_mike",
            "name": "Mike Rodriguez",
            "age": 22,
            "country": "Spain",
            "preferred_genres": ["Rock", "Metal", "Alternative"],
            "preferred_artists": ["Metallica", "Nirvana", "Foo Fighters"]
        },
        {
            "username": "hiphop_queen_jess",
            "name": "Jessica Williams",
            "age": 24,
            "country": "USA",
            "preferred_genres": ["Hip Hop", "R&B", "Pop"],
            "preferred_artists": ["Drake", "Beyoncé", "Kendrick Lamar"]
        },
        {
            "username": "electronic_dave",
            "name": "David Kim",
            "age": 26,
            "country": "South Korea",
            "preferred_genres": ["Electronic", "Pop", "Hip Hop"],
            "preferred_artists": ["BTS", "Blackpink", "Calvin Harris"]
        },
        {
            "username": "folk_music_emma",
            "name": "Emma Thompson",
            "age": 30,
            "country": "UK",
            "preferred_genres": ["Folk", "Country", "Indie"],
            "preferred_artists": ["Mumford & Sons", "The Lumineers", "Ed Sheeran"]
        }
    ]
    
    created_users = []
    
    for user_data in sample_users:
        # Check if user already exists
        existing_user = user_repo.get_by_username(user_data["username"])
        if existing_user:
            print(f"User {user_data['username']} already exists, skipping...")
            created_users.append(existing_user)
            continue
        
        # Create user
        user_create = UserCreate(
            username=user_data["username"],
            password="password123"  # In real app, this would be hashed
        )
        
        user = user_repo.create_user(user_create.username, user_create.password)
        
        # Update user profile with additional info
        update_sql = """
        UPDATE users 
        SET name = :name, age = :age, country = :country
        WHERE uid = :uid
        """
        run(update_sql, {
            "name": user_data["name"],
            "age": user_data["age"],
            "country": user_data["country"],
            "uid": user["uid"]
        })
        
        created_users.append(user)
        print(f"Created user: {user_data['username']}")
    
    return created_users

def get_songs_by_genre(genre):
    """Get songs of a specific genre from the database"""
    sql = """
    SELECT sid, name, artist, genre
    FROM songs 
    WHERE genre = :genre
    LIMIT 20
    """
    return run(sql, {"genre": genre}, fetch=True)

def get_songs_by_artist(artist):
    """Get songs by a specific artist from the database"""
    sql = """
    SELECT sid, name, artist, genre
    FROM songs 
    WHERE artist LIKE :artist
    LIMIT 10
    """
    return run(sql, {"artist": f"%{artist}%"}, fetch=True)

def create_user_music_preferences(users):
    """Create music preferences for each user"""
    
    for user in users:
        print(f"Creating music preferences for {user['username']}...")
        
        # Get user's preferred genres and artists
        user_data = next((u for u in sample_users if u["username"] == user["username"]), None)
        if not user_data:
            continue
        
        # Create favorite songs for each genre
        for genre in user_data["preferred_genres"]:
            songs = get_songs_by_genre(genre)
            if songs:
                # Mark some songs as favorites
                for song in songs[:5]:  # Mark first 5 songs as favorites
                    action = UserTrackActionCreate(
                        uid=user["uid"],
                        sid=song["sid"],
                        favourite=True,
                        total_plays=random.randint(10, 100),
                        rating=random.randint(4, 5)
                    )
                    user_actions_repo.create_user_track_action(action)
        
        # Create favorite songs for each artist
        for artist in user_data["preferred_artists"]:
            songs = get_songs_by_artist(artist)
            if songs:
                # Mark some songs as favorites
                for song in songs[:3]:  # Mark first 3 songs as favorites
                    action = UserTrackActionCreate(
                        uid=user["uid"],
                        sid=song["sid"],
                        favourite=True,
                        total_plays=random.randint(20, 150),
                        rating=random.randint(4, 5)
                    )
                    user_actions_repo.create_user_track_action(action)
        
        # Add some random plays for variety
        all_songs = run("SELECT sid FROM songs LIMIT 50", fetch=True)
        for _ in range(10):
            song = random.choice(all_songs)
            action = UserTrackActionCreate(
                uid=user["uid"],
                sid=song["sid"],
                favourite=random.choice([True, False]),
                total_plays=random.randint(1, 50),
                rating=random.randint(1, 5)
            )
            user_actions_repo.create_user_track_action(action)

def main():
    """Main function to populate the database with sample data"""
    print("Starting to populate database with sample matching data...")
    
    # Create sample users
    print("\n1. Creating sample users...")
    users = create_sample_users()
    
    # Create music preferences
    print("\n2. Creating music preferences...")
    create_user_music_preferences(users)
    
    print("\n✅ Database populated successfully!")
    print(f"Created {len(users)} users with music preferences")
    print("\nYou can now test the matching system with these users:")
    for user in users:
        print(f"- {user['username']} (UID: {user['uid']})")

if __name__ == "__main__":
    # Define sample_users globally for the create_user_music_preferences function
    sample_users = [
        {
            "username": "musiclover_alex",
            "name": "Alex Johnson",
            "age": 25,
            "country": "USA",
            "preferred_genres": ["Pop", "Rock", "Electronic"],
            "preferred_artists": ["The Weeknd", "Dua Lipa", "Calvin Harris"]
        },
        {
            "username": "jazz_fan_sarah",
            "name": "Sarah Chen",
            "age": 28,
            "country": "Canada",
            "preferred_genres": ["Jazz", "Classical", "Blues"],
            "preferred_artists": ["Miles Davis", "Ella Fitzgerald", "John Coltrane"]
        },
        {
            "username": "rock_star_mike",
            "name": "Mike Rodriguez",
            "age": 22,
            "country": "Spain",
            "preferred_genres": ["Rock", "Metal", "Alternative"],
            "preferred_artists": ["Metallica", "Nirvana", "Foo Fighters"]
        },
        {
            "username": "hiphop_queen_jess",
            "name": "Jessica Williams",
            "age": 24,
            "country": "USA",
            "preferred_genres": ["Hip Hop", "R&B", "Pop"],
            "preferred_artists": ["Drake", "Beyoncé", "Kendrick Lamar"]
        },
        {
            "username": "electronic_dave",
            "name": "David Kim",
            "age": 26,
            "country": "South Korea",
            "preferred_genres": ["Electronic", "Pop", "Hip Hop"],
            "preferred_artists": ["BTS", "Blackpink", "Calvin Harris"]
        },
        {
            "username": "folk_music_emma",
            "name": "Emma Thompson",
            "age": 30,
            "country": "UK",
            "preferred_genres": ["Folk", "Country", "Indie"],
            "preferred_artists": ["Mumford & Sons", "The Lumineers", "Ed Sheeran"]
        }
    ]
    
    main() 