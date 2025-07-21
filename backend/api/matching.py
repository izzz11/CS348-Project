# Completely rewrite logic

# routers/matching.py
from fastapi import APIRouter, HTTPException, status, Query
from typing import List
from database.utils import user_repo, matching_repo
from database.schema import models

router = APIRouter(prefix="/matching", tags=["matching"])

@router.get("/profile/{uid}", response_model=models.UserProfile)
def get_user_profile(uid: str):
    profile = user_repo.get_user_profile(uid)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    favorite_genres = user_repo.get_user_favorite_genres(uid)
    top_artists = user_repo.get_user_top_artists(uid)
    return {
        "uid": profile['uid'],
        "username": profile['username'],
        "name": profile['name'],
        "age": profile['age'],
        "country": profile['country'],
        "favorite_genres": favorite_genres,
        "top_artists": top_artists,
        "total_songs": profile['total_songs'] or 0,
        "total_playlists": profile['total_playlists'] or 0
    }

@router.get("/candidates", response_model=models.MatchResponse)
def get_match_candidates(
    current_uid: str = Query(..., description="Current user ID"),
    limit: int = Query(10, ge=1, le=50, description="Number of candidates per page")
):
    candidates_data = matching_repo.get_user_recommendations(current_uid, limit)
    candidates = []
    for candidate in candidates_data:
        similarity = candidate.get("similarity_score", 0.0)
        favorite_genres = user_repo.get_user_favorite_genres(candidate['uid'])
        top_artists = user_repo.get_user_top_artists(candidate['uid'])
        current_genres = set(user_repo.get_user_favorite_genres(current_uid))
        candidate_genres = set(favorite_genres)
        common_genres = len(current_genres.intersection(candidate_genres))
        # Calculate common songs
        common_songs_sql = """
        SELECT COUNT(DISTINCT uta1.sid) as common_songs
        FROM user_track_actions uta1
        JOIN user_track_actions uta2 ON uta1.sid = uta2.sid
        WHERE uta1.uid = :user1_id AND uta2.uid = :user2_id
        """
        common_songs_result = user_repo.run(common_songs_sql, {
            "user1_id": current_uid,
            "user2_id": candidate['uid']
        }, fetchone=True)
        common_songs = common_songs_result['common_songs'] if common_songs_result else 0
        candidates.append({
            "uid": candidate['uid'],
            "username": candidate['username'],
            "name": candidate['name'],
            "age": candidate['age'],
            "country": candidate['country'],
            "favorite_genres": favorite_genres,
            "top_artists": top_artists,
            "similarity_score": similarity,
            "common_genres": common_genres,
            "common_songs": common_songs
        })
    return {
        "candidates": candidates,
        "total_candidates": len(candidates),
        "current_page": 1,
        "total_pages": 1
    }

@router.post("/like", response_model=dict)
def like_user(match: models.UserMatchCreate):
    print(f"Like request received: {match}")
    success = matching_repo.create_user_match(match)
    if not success:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to create match")
    return {"message": "Like recorded successfully"}

@router.get("/matches/{uid}", response_model=List[dict])
def get_user_matches(uid: str):
    matches = matching_repo.get_user_matches(uid)
    return matches

@router.get("/likes/{uid}", response_model=List[dict])
def get_user_likes(uid: str):
    print(f"Getting likes for user: {uid}")
    likes = matching_repo.get_user_likes(uid)
    print(f"Returning likes: {likes}")
    return likes

@router.get("/recommendations/users/{uid}", response_model=List[dict])
def get_user_recommendations(uid: str, limit: int = Query(10, ge=1, le=50)):
    recommendations = matching_repo.get_user_recommendations(uid, limit)
    return recommendations 