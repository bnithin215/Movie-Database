# IMDB/OMDb API Integration Documentation

## Overview
This document describes the complete IMDB API integration implemented using the OMDb (Open Movie Database) API. The integration includes full support for fetching movie data with a special focus on Indian cinema.

## Features Implemented

### 1. Backend API Integration

#### New Services (`Backend/services/omdbService.js`)
- **searchMovies**: Search movies by query with optional filters (year, type)
- **getMovieDetails**: Get detailed information for a specific IMDB ID
- **getMultipleMovieDetails**: Batch fetch details for multiple movies
- **searchIndianMovies**: Specialized search for Indian movies (Bollywood, Tamil, Telugu, etc.)
- **searchByActor**: Search movies by actor name
- **getPopularIndianActorsMovies**: Get movies from popular Indian actors

#### New API Routes (`Backend/routes/omdb.js`)
- `GET /api/omdb/search` - Search movies in OMDB database
- `GET /api/omdb/movie/:imdbID` - Get movie details by IMDB ID
- `GET /api/omdb/indian-movies` - Get popular Indian movies
- `GET /api/omdb/search-by-actor` - Search movies by actor name
- `GET /api/omdb/popular-indian-actors` - Get movies by popular Indian actors
- `POST /api/omdb/batch-details` - Get details for multiple movies
- `GET /api/omdb/indian-actors` - Get list of popular Indian actors

### 2. Enhanced Database Model

#### Updated Movie Schema (`Backend/models/Movie.js`)
New IMDB-related fields:
- `imdbID` - Unique IMDB identifier
- `imdbRating` - IMDB rating (e.g., "8.5/10")
- `year` - Release year
- `runtime` - Movie duration
- `plot` - Movie plot/synopsis
- `country` - Production country
- `language` - Movie language(s)
- `awards` - Awards and nominations
- `trailer` - YouTube trailer URL
- `boxOffice` - Box office earnings
- `production` - Production company

### 3. Frontend Features

#### Indian Cinema Focus
- **Quick Load Indian Movies**: One-click button to load popular Indian movies
- **Bollywood Search**: Dedicated search for Bollywood movies
- **Popular Indian Actors**: Quick-select chips for popular actors including:
  - Shah Rukh Khan
  - Amitabh Bachchan
  - Aamir Khan
  - Rajinikanth
  - Allu Arjun
  - Prabhas
  - Deepika Padukone
  - Alia Bhatt

#### Search Capabilities
1. **General Search**: Search any movie from OMDB database
2. **Actor Search**: Find movies by specific actors
3. **Year Filter**: Filter movies by release year
4. **Type Filter**: Filter by movie type (movie/series)

#### Movie Information Displayed
- Movie poster images
- Title, year, and genre
- Director and full cast
- IMDB rating
- Country and language
- Plot summary
- Awards (if any)
- Box office information

#### Trailer Support
- **Search Trailer** button: Opens YouTube search for movie trailer
- Direct trailer links (when available)
- One-click access to movie trailers

### 4. User Interface Enhancements

#### New UI Components
- **Indian Movies Section**: Dedicated section for Indian cinema with orange/saffron theme
- **Actor Chips**: Interactive buttons for quick actor selection
- **Enhanced Movie Cards**: Display posters, ratings, and comprehensive movie info
- **Modal Details View**: Popup with full movie information
- **Grid/List View Toggle**: Switch between grid and list layouts

#### Styling
- Custom styling for Indian movies section
- Actor chip buttons with hover effects
- Movie poster display with zoom effects
- Responsive design for mobile devices
- Enhanced color scheme highlighting Indian content

## Indian Movies Support

### Supported Languages
- Hindi (Bollywood)
- Tamil
- Telugu
- Malayalam
- Kannada
- Bengali
- Marathi
- Punjabi

### Popular Indian Movies Pre-loaded
- RRR
- Baahubali (1 & 2)
- 3 Idiots
- Dangal
- PK
- Kabhi Khushi Kabhie Gham
- Dilwale Dulhania Le Jayenge
- Lagaan
- Taare Zameen Par

### Featured Indian Actors
The system includes 25+ popular Indian actors across various film industries for quick searches.

## API Usage

### Example: Search Indian Movies
```javascript
GET /api/omdb/indian-movies?limit=20
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "movies": [...],
  "count": 20
}
```

### Example: Search by Actor
```javascript
GET /api/omdb/search-by-actor?actor=Shah%20Rukh%20Khan
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "movies": [...],
  "count": 10
}
```

### Example: Add Movie to Collection
```javascript
POST /api/movies
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "title": "RRR",
  "genre": "Action",
  "actor": "Ram Charan",
  "director": "S. S. Rajamouli",
  "cast": "Ram Charan, N.T. Rama Rao Jr., Ajay Devgn",
  "poster": "https://...",
  "imdbID": "tt8178634",
  "imdbRating": "7.9",
  "year": "2022",
  "plot": "A fearless revolutionary...",
  "country": "India",
  "language": "Telugu, Hindi",
  "rating": 4
}
```

## Environment Variables

Required in `.env`:
```
OMDB_API_KEY=28d4864
```

## Technical Stack

### Backend
- **axios**: HTTP client for API requests
- **Express**: REST API framework
- **MongoDB/Mongoose**: Database with enhanced schema

### Frontend
- **Vanilla JavaScript**: Enhanced search functionality
- **CSS3**: Modern styling with gradients and animations
- **HTML5**: Semantic markup with accessibility features

## How to Use

1. **Navigate to Search Page**: Click on "Search" in navigation
2. **Switch to OMDB Tab**: Click "Discover Movies (OMDB)" tab
3. **Load Indian Movies**: Click "Load Popular Indian Movies" for instant results
4. **Search by Actor**: Select an actor chip or enter name manually
5. **Add to Collection**: Click "Add to Collection" on any movie
6. **View Details**: Click "View Details" for complete movie information
7. **Watch Trailer**: Click "Find Trailer" to search on YouTube

## Future Enhancements

Potential improvements:
- Direct YouTube API integration for trailers
- Regional language filters
- Advanced filtering (by director, year range, rating)
- Movie recommendations based on collection
- Watchlist feature
- Rating and review system
- Social sharing features

## Support

For issues or questions:
- Check the OMDB API documentation: http://www.omdbapi.com/
- Ensure API key is valid and has sufficient quota
- Check network connectivity for API calls

## Credits

- **OMDb API**: The Open Movie Database (http://www.omdbapi.com/)
- **Movie Data**: Sourced from IMDB
- **Poster Images**: Provided by IMDB/OMDb

---

**Last Updated**: November 2025
**Version**: 1.0.0
