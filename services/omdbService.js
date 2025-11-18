const axios = require('axios');

const OMDB_API_KEY = process.env.OMDB_API_KEY || '28d4864'; // Fallback to default key
const OMDB_API_URL = 'http://www.omdbapi.com/';

// List of popular Indian movies and actors to prioritize
const INDIAN_MOVIE_KEYWORDS = [
  'Bollywood', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada',
  'Bengali', 'Marathi', 'Punjabi', 'Indian'
];

const INDIAN_ACTORS = [
  'Shah Rukh Khan', 'Amitabh Bachchan', 'Aamir Khan', 'Salman Khan',
  'Akshay Kumar', 'Rajinikanth', 'Kamal Haasan', 'Allu Arjun',
  'Mahesh Babu', 'Prabhas', 'Vijay', 'Ajith Kumar', 'Mammootty',
  'Mohanlal', 'Chiranjeevi', 'Ranveer Singh', 'Ranbir Kapoor',
  'Hrithik Roshan', 'Deepika Padukone', 'Priyanka Chopra', 'Katrina Kaif',
  'Alia Bhatt', 'Kangana Ranaut', 'Kareena Kapoor', 'Aishwarya Rai'
];

/**
 * Search movies by query
 * @param {string} query - Search query
 * @param {string} year - Optional year filter
 * @param {string} type - Optional type filter (movie, series, episode)
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} Search results
 */
async function searchMovies(query, year = '', type = '', page = 1) {
  try {
    if (!OMDB_API_KEY) {
      throw new Error('OMDB API key is not configured');
    }

    // Build URL according to OMDB API documentation
    // Format: http://www.omdbapi.com/?apikey=[yourkey]&s=[search]
    let url = `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`;

    // Add optional parameters
    if (page && page > 1) {
      url += `&page=${page}`;
    }

    if (year) {
      url += `&y=${year}`;
    }

    if (type) {
      url += `&type=${type}`;
    }

    // Add response format
    url += `&r=json`;

    console.log('OMDB Search URL:', url.replace(OMDB_API_KEY, '***')); // Log without exposing key

    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    if (response.data.Response === 'True') {
      return {
        success: true,
        movies: response.data.Search || [],
        totalResults: parseInt(response.data.totalResults) || 0
      };
    } else {
      return {
        success: false,
        error: response.data.Error || 'Movie not found'
      };
    }
  } catch (error) {
    console.error('OMDB search error:', error.message);
    if (error.response) {
      console.error('OMDB API response:', error.response.data);
    }
    throw new Error(error.message || 'Failed to search OMDB database');
  }
}

/**
 * Get detailed movie information by IMDB ID
 * @param {string} imdbID - IMDB ID
 * @returns {Promise<Object>} Movie details
 */
async function getMovieDetails(imdbID) {
  try {
    if (!OMDB_API_KEY) {
      throw new Error('OMDB API key is not configured');
    }

    // Format: http://www.omdbapi.com/?apikey=[yourkey]&i=[imdbid]
    const url = `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full&r=json`;
    
    const response = await axios.get(url, {
      timeout: 10000
    });

    if (response.data.Response === 'True') {
      return {
        success: true,
        movie: response.data
      };
    } else {
      return {
        success: false,
        error: response.data.Error || 'Movie not found'
      };
    }
  } catch (error) {
    console.error('OMDB get movie details error:', error.message);
    if (error.response) {
      console.error('OMDB API response:', error.response.data);
    }
    throw new Error(error.message || 'Failed to get movie details from OMDB');
  }
}

/**
 * Get detailed information for multiple movies
 * @param {Array} movieList - Array of movies with imdbID
 * @returns {Promise<Array>} Array of detailed movie information
 */
async function getMultipleMovieDetails(movieList) {
  try {
    if (!OMDB_API_KEY) {
      throw new Error('OMDB API key is not configured');
    }

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    const allMovies = [];

    for (let i = 0; i < movieList.length; i += batchSize) {
      const batch = movieList.slice(i, i + batchSize);
      const promises = batch.map(movie => {
        const imdbID = movie.imdbID;
        if (!imdbID) {
          console.warn('Movie missing imdbID:', movie);
          return Promise.resolve(null);
        }
        return axios.get(`${OMDB_API_URL}?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=short&r=json`, {
          timeout: 10000
        }).catch(err => {
          console.error(`Error fetching details for ${imdbID}:`, err.message);
          return null;
        });
      });

      const responses = await Promise.all(promises);
      const validMovies = responses
        .filter(res => res && res.data && res.data.Response === 'True')
        .map(res => res.data);
      
      allMovies.push(...validMovies);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < movieList.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return allMovies;
  } catch (error) {
    console.error('OMDB get multiple movie details error:', error.message);
    throw new Error(error.message || 'Failed to get multiple movie details from OMDB');
  }
}

/**
 * Search for Indian movies
 * @param {number} limit - Number of movies to return
 * @returns {Promise<Array>} Array of Indian movies
 */
async function searchIndianMovies(limit = 20) {
  try {
    const allMovies = [];
    const searchTerms = [
      'Bollywood',
      'RRR',
      'Baahubali',
      '3 Idiots',
      'Dangal',
      'PK',
      'Kabhi Khushi Kabhie Gham',
      'Dilwale Dulhania Le Jayenge',
      'Lagaan',
      'Taare Zameen Par'
    ];

    // Search for multiple Indian movie terms
    for (const term of searchTerms.slice(0, 5)) {
      const result = await searchMovies(term);
      if (result.success && result.movies) {
        allMovies.push(...result.movies);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Remove duplicates based on imdbID
    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.imdbID, movie])).values()
    );

    // Get detailed information for each movie
    const detailedMovies = await getMultipleMovieDetails(uniqueMovies.slice(0, limit));

    // Filter to prioritize Indian movies
    const indianMovies = detailedMovies.filter(movie => {
      const isIndian =
        (movie.Country && (movie.Country.includes('India') || movie.Country.includes('Indian'))) ||
        (movie.Language && INDIAN_MOVIE_KEYWORDS.some(keyword =>
          movie.Language.toLowerCase().includes(keyword.toLowerCase())
        )) ||
        (movie.Actors && INDIAN_ACTORS.some(actor =>
          movie.Actors.includes(actor)
        ));
      return isIndian;
    });

    return indianMovies.length > 0 ? indianMovies : detailedMovies;
  } catch (error) {
    console.error('Error searching Indian movies:', error);
    throw new Error('Failed to search Indian movies');
  }
}

/**
 * Search movies by actor name
 * @param {string} actorName - Actor name
 * @returns {Promise<Array>} Array of movies featuring the actor
 */
async function searchByActor(actorName) {
  try {
    // OMDB doesn't support direct actor search, so we search by name
    // and filter results
    const result = await searchMovies(actorName);

    if (result.success && result.movies) {
      const detailedMovies = await getMultipleMovieDetails(result.movies.slice(0, 10));
      return detailedMovies.filter(movie =>
        movie.Actors && movie.Actors.toLowerCase().includes(actorName.toLowerCase())
      );
    }

    return [];
  } catch (error) {
    console.error('Error searching by actor:', error);
    throw new Error('Failed to search movies by actor');
  }
}

/**
 * Get popular Indian actors' movies
 * @returns {Promise<Object>} Object with actor names as keys and their movies as values
 */
async function getPopularIndianActorsMovies() {
  try {
    const actorsMovies = {};
    const topActors = INDIAN_ACTORS.slice(0, 5); // Get top 5 actors

    for (const actor of topActors) {
      const result = await searchMovies(actor);
      if (result.success && result.movies && result.movies.length > 0) {
        // Get detailed info for first 3 movies
        const detailedMovies = await getMultipleMovieDetails(result.movies.slice(0, 3));
        actorsMovies[actor] = detailedMovies;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return actorsMovies;
  } catch (error) {
    console.error('Error getting popular Indian actors movies:', error);
    throw new Error('Failed to get popular Indian actors movies');
  }
}

module.exports = {
  searchMovies,
  getMovieDetails,
  getMultipleMovieDetails,
  searchIndianMovies,
  searchByActor,
  getPopularIndianActorsMovies,
  INDIAN_ACTORS,
  INDIAN_MOVIE_KEYWORDS
};
