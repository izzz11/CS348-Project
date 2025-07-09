# routers/matching.py
from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from database.utils import user_repo, matching_repo
from database.schema import models

router = APIRouter(prefix="/matching", tags=["matching"])

@router.get("/profile/{uid}", response_model=models.UserProfile)
def get_user_profile(uid: str):
    """
    Get extended user profile with music taste information
    """
    profile = user_repo.get_user_profile(uid)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    
    # Get favorite genres and artists
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
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of candidates per page")
):
    """
    Get potential match candidates for a user
    """
    offset = (page - 1) * limit
    
    # Get candidates
    candidates_data = user_repo.get_users_for_matching(current_uid, limit, offset)
    total_candidates = user_repo.get_total_users_for_matching(current_uid)
    
    candidates = []
    for candidate in candidates_data:
        # Calculate similarity
        similarity = user_repo.calculate_user_similarity(current_uid, candidate['uid'])
        
        # Get candidate's favorite genres and artists
        favorite_genres = user_repo.get_user_favorite_genres(candidate['uid'])
        top_artists = user_repo.get_user_top_artists(candidate['uid'])
        
        # Calculate common elements
        current_genres = set(user_repo.get_user_favorite_genres(current_uid))
        candidate_genres = set(favorite_genres)
        common_genres = len(current_genres.intersection(candidate_genres))
        
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
            "common_songs": 0  # Placeholder for now
        })
    
    total_pages = (total_candidates + limit - 1) // limit
    
    return {
        "candidates": candidates,
        "total_candidates": total_candidates,
        "current_page": page,
        "total_pages": total_pages
    }

@router.post("/like", response_model=dict)
def like_user(match: models.UserMatchCreate):
    """
    Like a user (create or update match)
    """
    success = matching_repo.create_user_match(match)
    if not success:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to create match")
    
    return {"message": "Like recorded successfully"}

@router.get("/matches/{uid}", response_model=List[dict])
def get_user_matches(uid: str):
    """
    Get all successful matches for a user
    """
    matches = matching_repo.get_user_matches(uid)
    return matches

@router.get("/likes/{uid}", response_model=List[dict])
def get_user_likes(uid: str):
    """
    Get all users that the current user has liked
    """
    likes = matching_repo.get_user_likes(uid)
    return likes

@router.get("/recommendations/users/{uid}", response_model=List[dict])
def get_user_recommendations(
    uid: str,
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get user recommendations based on music taste
    """
    recommendations = matching_repo.get_user_recommendations(uid, limit)
    return recommendations

@router.get("/recommendations/songs/{uid}", response_model=List[dict])
def get_song_recommendations(
    uid: str,
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get song recommendations for a user
    """
    recommendations = matching_repo.get_song_recommendations(uid, limit)
    return recommendations

@router.get("/recommendations/playlists/{uid}", response_model=List[dict])
def get_playlist_recommendations(
    uid: str,
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get playlist recommendations for a user
    """
    recommendations = matching_repo.get_playlist_recommendations(uid, limit)
    return recommendations

@router.post("/recommendations/generate/{uid}")
def generate_recommendations(uid: str):
    """
    Generate recommendations for a user based on their music taste
    This is a placeholder for a more sophisticated recommendation algorithm
    """
    try:
        # Get user's favorite genres and artists
        favorite_genres = user_repo.get_user_favorite_genres(uid)
        top_artists = user_repo.get_user_top_artists(uid)
        
        # Get other users with similar taste
        all_users = user_repo.get_all_users()
        recommendations_created = 0
        
        for user in all_users:
            if user['uid'] == uid:
                continue
                
            # Calculate similarity
            similarity = user_repo.calculate_user_similarity(uid, user['uid'])
            
            if similarity > 0.3:  # Threshold for recommendation
                # Create user recommendation
                recommendation = models.UserRecommendation(
                    uid=uid,
                    recommended_uid=user['uid'],
                    recommendation_type=models.RecommendationType.GENRE_BASED,
                    confidence_score=similarity
                )
                matching_repo.create_user_recommendation(recommendation)
                recommendations_created += 1
        
        return {
            "message": f"Generated {recommendations_created} recommendations",
            "recommendations_created": recommendations_created
        }
        
    except Exception as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Failed to generate recommendations: {str(e)}") 