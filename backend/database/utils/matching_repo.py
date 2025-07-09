from typing import List, Optional
from datetime import datetime
from database.schema.models import UserMatchCreate, UserMatchUpdate, UserRecommendation, SongRecommendation, PlaylistRecommendation
from database.db import run, run_transaction
from database.utils import user_repo

def create_user_match(match: UserMatchCreate) -> bool:
    """
    Create a new user match or update existing one
    """
    try:
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
        
        if existing:
            # Update existing match
            update_sql = """
            UPDATE user_matches 
            SET liked_by_user1 = CASE 
                WHEN user1_id = :user1_id THEN :liked_by_user1
                ELSE liked_by_user1
            END,
            liked_by_user2 = CASE 
                WHEN user2_id = :user2_id THEN :liked_by_user2
                ELSE liked_by_user2
            END,
            matched = CASE 
                WHEN (user1_id = :user1_id AND :liked_by_user1 = TRUE AND liked_by_user2 = TRUE)
                OR (user2_id = :user2_id AND :liked_by_user2 = TRUE AND liked_by_user1 = TRUE)
                THEN TRUE
                ELSE matched
            END,
            matched_at = CASE 
                WHEN (user1_id = :user1_id AND :liked_by_user1 = TRUE AND liked_by_user2 = TRUE)
                OR (user2_id = :user2_id AND :liked_by_user2 = TRUE AND liked_by_user1 = TRUE)
                THEN CURRENT_TIMESTAMP
                ELSE matched_at
            END
            WHERE (user1_id = :user1_id AND user2_id = :user2_id)
            OR (user1_id = :user2_id AND user2_id = :user1_id)
            """
            run(update_sql, {
                "user1_id": match.user1_id,
                "user2_id": match.user2_id,
                "liked_by_user1": match.liked_by_user1,
                "liked_by_user2": match.liked_by_user2
            })
        else:
            # Create new match
            similarity = user_repo.calculate_user_similarity(match.user1_id, match.user2_id)
            insert_sql = """
            INSERT INTO user_matches (user1_id, user2_id, similarity_score, liked_by_user1, liked_by_user2)
            VALUES (:user1_id, :user2_id, :similarity_score, :liked_by_user1, :liked_by_user2)
            """
            run(insert_sql, {
                "user1_id": match.user1_id,
                "user2_id": match.user2_id,
                "similarity_score": similarity,
                "liked_by_user1": match.liked_by_user1,
                "liked_by_user2": match.liked_by_user2
            })
        
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_user_matches(uid: str) -> List[dict]:
    """
    Get all matches for a user
    """
    try:
        sql = """
        SELECT um.*, u.username, u.name, u.age, u.country
        FROM user_matches um
        JOIN users u ON (um.user1_id = u.uid OR um.user2_id = u.uid)
        WHERE (um.user1_id = :uid OR um.user2_id = :uid)
        AND um.matched = TRUE
        AND u.uid != :uid
        """
        result = run(sql, {"uid": uid}, fetch=True)
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return []

def get_user_likes(uid: str) -> List[dict]:
    """
    Get all users that the current user has liked
    """
    try:
        sql = """
        SELECT um.*, u.username, u.name, u.age, u.country
        FROM user_matches um
        JOIN users u ON (um.user1_id = u.uid OR um.user2_id = u.uid)
        WHERE ((um.user1_id = :uid AND um.liked_by_user1 = TRUE)
        OR (um.user2_id = :uid AND um.liked_by_user2 = TRUE))
        AND u.uid != :uid
        """
        result = run(sql, {"uid": uid}, fetch=True)
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return []

def create_user_recommendation(recommendation: UserRecommendation) -> bool:
    """
    Create a new user recommendation
    """
    try:
        sql = """
        INSERT INTO user_recommendations (uid, recommended_uid, recommendation_type, confidence_score)
        VALUES (:uid, :recommended_uid, :recommendation_type, :confidence_score)
        ON DUPLICATE KEY UPDATE
        confidence_score = :confidence_score,
        created_at = CURRENT_TIMESTAMP
        """
        run(sql, {
            "uid": recommendation.uid,
            "recommended_uid": recommendation.recommended_uid,
            "recommendation_type": recommendation.recommendation_type,
            "confidence_score": recommendation.confidence_score
        })
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_user_recommendations(uid: str, limit: int = 10) -> List[dict]:
    """
    Get recommendations for a user
    """
    try:
        sql = """
        SELECT ur.*, u.username, u.name, u.age, u.country
        FROM user_recommendations ur
        JOIN users u ON ur.recommended_uid = u.uid
        WHERE ur.uid = :uid
        ORDER BY ur.confidence_score DESC
        LIMIT :limit
        """
        result = run(sql, {"uid": uid, "limit": limit}, fetch=True)
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return []

def create_song_recommendation(recommendation: SongRecommendation) -> bool:
    """
    Create a new song recommendation
    """
    try:
        sql = """
        INSERT INTO song_recommendations (uid, sid, recommendation_reason, confidence_score)
        VALUES (:uid, :sid, :recommendation_reason, :confidence_score)
        ON DUPLICATE KEY UPDATE
        confidence_score = :confidence_score,
        created_at = CURRENT_TIMESTAMP
        """
        run(sql, {
            "uid": recommendation.uid,
            "sid": recommendation.sid,
            "recommendation_reason": recommendation.recommendation_reason,
            "confidence_score": recommendation.confidence_score
        })
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_song_recommendations(uid: str, limit: int = 10) -> List[dict]:
    """
    Get song recommendations for a user
    """
    try:
        sql = """
        SELECT sr.*, s.name, s.artist, s.genre, s.duration
        FROM song_recommendations sr
        JOIN songs s ON sr.sid = s.sid
        WHERE sr.uid = :uid
        ORDER BY sr.confidence_score DESC
        LIMIT :limit
        """
        result = run(sql, {"uid": uid, "limit": limit}, fetch=True)
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return []

def create_playlist_recommendation(recommendation: PlaylistRecommendation) -> bool:
    """
    Create a new playlist recommendation
    """
    try:
        sql = """
        INSERT INTO playlist_recommendations (uid, pid, recommendation_reason, confidence_score)
        VALUES (:uid, :pid, :recommendation_reason, :confidence_score)
        ON DUPLICATE KEY UPDATE
        confidence_score = :confidence_score,
        created_at = CURRENT_TIMESTAMP
        """
        run(sql, {
            "uid": recommendation.uid,
            "pid": recommendation.pid,
            "recommendation_reason": recommendation.recommendation_reason,
            "confidence_score": recommendation.confidence_score
        })
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_playlist_recommendations(uid: str, limit: int = 10) -> List[dict]:
    """
    Get playlist recommendations for a user
    """
    try:
        sql = """
        SELECT pr.*, p.name, p.description, p.private
        FROM playlist_recommendations pr
        JOIN playlists p ON pr.pid = p.pid
        WHERE pr.uid = :uid
        ORDER BY pr.confidence_score DESC
        LIMIT :limit
        """
        result = run(sql, {"uid": uid, "limit": limit}, fetch=True)
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return [] 