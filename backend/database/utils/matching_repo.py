from typing import List
from database.schema.models import UserMatchCreate
from database.db import run
from database.utils import user_repo
import math

def create_user_match(match: UserMatchCreate) -> bool:
    """
    Create or update a user match (like action). If both users like each other, mark as matched.
    """
    try:
        print(f"Creating/updating match: {match}")
        # Check if match already exists
        check_sql = """
        SELECT * FROM user_matches 
        WHERE (user1_id = :user1_id AND user2_id = :user2_id)
        OR (user1_id = :user2_id AND user2_id = :user1_id)
        """
        existing = run(check_sql, {
            "user1_id": match.user1_id,
            "user2_id": match.user2_id
        }, fetchone=True)
        
        print(f"Existing match found: {existing}")
        
        if existing:
            # Update only the current user's like status
            # Determine which user is the current user and update their like status
            update_sql = """
            UPDATE user_matches 
            SET liked_by_user1 = CASE 
                WHEN user1_id = :current_user_id THEN TRUE
                ELSE liked_by_user1
            END,
            liked_by_user2 = CASE 
                WHEN user2_id = :current_user_id THEN TRUE
                ELSE liked_by_user2
            END,
            matched = CASE 
                WHEN (user1_id = :current_user_id AND liked_by_user2 = TRUE)
                OR (user2_id = :current_user_id AND liked_by_user1 = TRUE)
                THEN TRUE
                ELSE matched
            END,
            matched_at = CASE 
                WHEN (user1_id = :current_user_id AND liked_by_user2 = TRUE)
                OR (user2_id = :current_user_id AND liked_by_user1 = TRUE)
                THEN CURRENT_TIMESTAMP
                ELSE matched_at
            END
            WHERE (user1_id = :user1_id AND user2_id = :user2_id)
            OR (user1_id = :user2_id AND user2_id = :user1_id)
            """
            run(update_sql, {
                "user1_id": match.user1_id,
                "user2_id": match.user2_id,
                "current_user_id": match.user1_id  # The current user is always user1_id in the request
            })
            print("Updated existing match")
        else:
            # Create new match row with only the current user's like status as true
            similarity = user_repo.calculate_user_similarity(match.user1_id, match.user2_id)
            insert_sql = """
            INSERT INTO user_matches (user1_id, user2_id, similarity_score, liked_by_user1, liked_by_user2)
            VALUES (:user1_id, :user2_id, :similarity_score, TRUE, FALSE)
            """
            run(insert_sql, {
                "user1_id": match.user1_id,
                "user2_id": match.user2_id,
                "similarity_score": similarity
            })
            print("Created new match")
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_user_matches(uid: str) -> List[dict]:
    """
    Get all users that the current user has matched with (mutual like).
    """
    try:
        sql = """
        SELECT u.uid, u.username, u.name, u.age, u.country
        FROM user_matches um
        JOIN users u ON (u.uid = CASE WHEN um.user1_id = :uid THEN um.user2_id ELSE um.user1_id END)
        WHERE (um.user1_id = :uid OR um.user2_id = :uid)
        AND (um.liked_by_user1 = TRUE AND um.liked_by_user2 = TRUE)
        """
        users = run(sql, {"uid": uid}, fetch=True)
        
        # Add the additional data that frontend expects
        for user in users:
            # Get favorite genres and artists
            user["favorite_genres"] = user_repo.get_user_favorite_genres(user["uid"])
            user["top_artists"] = user_repo.get_user_top_artists(user["uid"])
            
            # Calculate similarity score
            sim = user_repo.calculate_user_similarity(uid, user["uid"])
            if sim is None or not isinstance(sim, (int, float)) or sim != sim:  # NaN check
                sim = 0.0
            user["similarity_score"] = float(sim) + 0.40
            
            # Calculate common elements
            current_genres = set(user_repo.get_user_favorite_genres(uid))
            candidate_genres = set(user["favorite_genres"])
            user["common_genres"] = len(current_genres.intersection(candidate_genres))
            
            # Calculate common songs
            common_songs_sql = """
            SELECT COUNT(DISTINCT uta1.sid) as common_songs
            FROM user_track_actions uta1
            JOIN user_track_actions uta2 ON uta1.sid = uta2.sid
            WHERE uta1.uid = :user1_id AND uta2.uid = :user2_id
            """
            common_songs_result = user_repo.run(common_songs_sql, {
                "user1_id": uid,
                "user2_id": user["uid"]
            }, fetchone=True)
            user["common_songs"] = common_songs_result['common_songs'] if common_songs_result else 0
        
        return users
    except Exception as e:
        print(f"Database error: {e}")
        return []

def get_user_likes(uid: str) -> List[dict]:
    """
    Get all users that the current user has liked (but not necessarily matched).
    """
    try:
        sql = """
        SELECT u.uid, u.username, u.name, u.age, u.country, um.matched
        FROM user_matches um
        JOIN users u ON (u.uid = CASE WHEN um.user1_id = :uid THEN um.user2_id ELSE um.user1_id END)
        WHERE ((um.user1_id = :uid AND um.liked_by_user1 = TRUE)
           OR (um.user2_id = :uid AND um.liked_by_user2 = TRUE))
        AND u.uid != :uid
        """
        users = run(sql, {"uid": uid}, fetch=True)

        
        # Add the additional data that frontend expects
        for user in users:
            # Get favorite genres and artists
            user["favorite_genres"] = user_repo.get_user_favorite_genres(user["uid"])
            user["top_artists"] = user_repo.get_user_top_artists(user["uid"])
            
            # Calculate similarity score
            sim = user_repo.calculate_user_similarity(uid, user["uid"])
            if sim is None or not isinstance(sim, (int, float)) or sim != sim:  # NaN check
                sim = 0.0
            user["similarity_score"] = float(sim) + 0.30
            
            # Calculate common elements
            current_genres = set(user_repo.get_user_favorite_genres(uid))
            candidate_genres = set(user["favorite_genres"])
            user["common_genres"] = len(current_genres.intersection(candidate_genres))
            
            # Calculate common songs
            common_songs_sql = """
            SELECT COUNT(DISTINCT uta1.sid) as common_songs
            FROM user_track_actions uta1
            JOIN user_track_actions uta2 ON uta1.sid = uta2.sid
            WHERE uta1.uid = :user1_id AND uta2.uid = :user2_id
            """
            common_songs_result = user_repo.run(common_songs_sql, {
                "user1_id": uid,
                "user2_id": user["uid"]
            }, fetchone=True)
            user["common_songs"] = common_songs_result['common_songs'] if common_songs_result else 0
        
        return users
    except Exception as e:
        print(f"Database error: {e}")
        return []

def get_user_recommendations(uid: str, limit: int = 10) -> List[dict]:
    """
    Recommend users for matching:
    - Users with no user_matches entry with the current user
    - OR users where the other user has liked the current user, but the current user has not liked them back yet
    Exclude users already matched or already liked by the current user.
    """
    try:
        sql = """
        SELECT u.uid, u.username, u.name, u.age, u.country
        FROM users u
        WHERE u.uid != :uid
        AND (
            -- No user_matches entry exists
            NOT EXISTS (
                SELECT 1 FROM user_matches um
                WHERE (um.user1_id = :uid AND um.user2_id = u.uid)
                   OR (um.user1_id = u.uid AND um.user2_id = :uid)
            )
            OR
            -- There is a user_matches entry, the other user liked current user, but current user hasn't liked them
            EXISTS (
                SELECT 1 FROM user_matches um
                WHERE ((um.user1_id = u.uid AND um.user2_id = :uid AND um.liked_by_user1 = TRUE AND um.liked_by_user2 = FALSE)
                    OR (um.user2_id = u.uid AND um.user1_id = :uid AND um.liked_by_user2 = TRUE AND um.liked_by_user1 = FALSE))
            )
        )
        LIMIT :limit
        """
        users = run(sql, {"uid": uid, "limit": limit}, fetch=True)
        # Attach similarity score, always fallback to 0.0 if invalid
        for user in users:
            sim = user_repo.calculate_user_similarity(uid, user["uid"])
            if sim is None or not isinstance(sim, (int, float)) or sim != sim:  # NaN check
                sim = 0.0
            user["similarity_score"] = float(sim) + 0.20
        # Sort by similarity descending
        users.sort(key=lambda x: x["similarity_score"], reverse=True)
        return users[:limit]
    except Exception as e:
        print(f"Database error: {e}")
        return [] 