# Music Matching System

This document describes the implementation of a music-based matching system that allows users to find others with similar music tastes and get personalized recommendations.

## Features

### 1. User Matching
- **Swipe-based Interface**: Users can like or pass on other users based on their music preferences
- **Similarity Scoring**: Algorithm calculates compatibility based on shared genres, artists, and listening patterns
- **Match Detection**: When two users like each other, they become a match
- **Profile Display**: Shows user information, favorite genres, top artists, and similarity score

### 2. Recommendations
- **User Recommendations**: Find users with similar music taste
- **Song Recommendations**: Discover new songs based on listening history
- **Playlist Recommendations**: Get playlist suggestions from users with similar preferences

### 3. Music Taste Analysis
- **Genre Analysis**: Tracks favorite genres based on user actions
- **Artist Analysis**: Identifies top artists from listening patterns
- **Similarity Calculation**: Compares music preferences between users

## Database Schema

### New Tables

#### `user_matches`
Stores user matching relationships and interactions.
```sql
CREATE TABLE user_matches (
    user1_id VARCHAR(36),
    user2_id VARCHAR(36),
    similarity_score FLOAT DEFAULT 0.0,
    matched BOOLEAN DEFAULT FALSE,
    liked_by_user1 BOOLEAN DEFAULT FALSE,
    liked_by_user2 BOOLEAN DEFAULT FALSE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user1_id, user2_id)
);
```

#### `user_recommendations`
Stores user-to-user recommendations based on music taste.
```sql
CREATE TABLE user_recommendations (
    uid VARCHAR(36),
    recommended_uid VARCHAR(36),
    recommendation_type ENUM('song_based', 'genre_based', 'artist_based', 'playlist_based'),
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, recommended_uid, recommendation_type)
);
```

#### `song_recommendations`
Stores song recommendations for users.
```sql
CREATE TABLE song_recommendations (
    uid VARCHAR(36),
    sid VARCHAR(255),
    recommendation_reason VARCHAR(255),
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, sid)
);
```

#### `playlist_recommendations`
Stores playlist recommendations for users.
```sql
CREATE TABLE playlist_recommendations (
    uid VARCHAR(36),
    pid VARCHAR(36),
    recommendation_reason VARCHAR(255),
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, pid)
);
```

## API Endpoints

### Matching Endpoints

#### `GET /matching/profile/{uid}`
Get extended user profile with music taste information.

#### `GET /matching/candidates`
Get potential match candidates for a user with pagination.

#### `POST /matching/like`
Like a user (create or update match).

#### `GET /matching/matches/{uid}`
Get all successful matches for a user.

#### `GET /matching/likes/{uid}`
Get all users that the current user has liked.

### Recommendation Endpoints

#### `GET /matching/recommendations/users/{uid}`
Get user recommendations based on music taste.

#### `GET /matching/recommendations/songs/{uid}`
Get song recommendations for a user.

#### `GET /matching/recommendations/playlists/{uid}`
Get playlist recommendations for a user.

#### `POST /matching/recommendations/generate/{uid}`
Generate recommendations for a user based on their music taste.

## Frontend Components

### MatchCard Component
- Displays user profile with music preferences
- Shows similarity score and common elements
- Like/Pass buttons with smooth animations
- Responsive design with modern UI

### Recommendations Component
- Tabbed interface for different recommendation types
- Grid layout for recommendation cards
- Loading states and error handling
- Confidence score indicators

### Match Page
- Tab navigation between matching and recommendations
- Real-time candidate loading
- Smooth transitions and animations
- Empty state handling

## Similarity Algorithm

The matching system uses a weighted similarity algorithm:

1. **Genre Similarity (40%)**: Counts common favorite genres
2. **Artist Similarity (60%)**: Counts common favorite artists
3. **Score Calculation**: `(common_genres * 0.4 + common_artists * 0.6) / 10.0`
4. **Score Capping**: Maximum similarity score of 1.0

## Setup Instructions

### 1. Database Setup
```bash
# Run the database creation script
cd backend/database/scripts
python create_tables.sql
```

### 2. Populate Sample Data
```bash
# Run the sample data population script
cd backend/database/scripts
python populate_matching_data.py
```

### 3. Start the Backend
```bash
cd backend
python main.py
```

### 4. Start the Frontend
```bash
cd frontend
npm run dev
```

## Sample Users

The system comes with 6 sample users with different music preferences:

1. **musiclover_alex** - Pop, Rock, Electronic
2. **jazz_fan_sarah** - Jazz, Classical, Blues
3. **rock_star_mike** - Rock, Metal, Alternative
4. **hiphop_queen_jess** - Hip Hop, R&B, Pop
5. **electronic_dave** - Electronic, Pop, Hip Hop
6. **folk_music_emma** - Folk, Country, Indie

## Testing the System

1. Navigate to the match page (`/match`)
2. Use the "Matching" tab to swipe through users
3. Use the "Recommendations" tab to view different types of recommendations
4. Test the like/pass functionality
5. Check the similarity scores and matching logic

## Future Enhancements

- **Advanced Algorithms**: Implement more sophisticated recommendation algorithms
- **Machine Learning**: Add ML-based similarity scoring
- **Real-time Matching**: WebSocket-based real-time matching
- **Chat System**: Add messaging for matched users
- **Music Integration**: Direct integration with music streaming APIs
- **Social Features**: Share playlists and music discoveries

## Technical Notes

- The system uses FastAPI for the backend API
- React with TypeScript for the frontend
- MySQL database with proper indexing
- Responsive design with Tailwind CSS
- Error handling and loading states throughout
- Modular component architecture for maintainability 