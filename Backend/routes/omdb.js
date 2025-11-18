const express = require('express');
const router = express.Router();
const omdbService = require('../services/omdbService');
const auth = require('../Middleware/authMiddleware');

/**
 * @route   GET /api/omdb/search
 * @desc    Search movies in OMDB database
 * @access  Protected
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query, year, type, page } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await omdbService.searchMovies(query, year, type, page);

    if (result.success) {
      res.json({
        success: true,
        movies: result.movies,
        totalResults: result.totalResults
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('OMDB search error:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

/**
 * @route   GET /api/omdb/movie/:imdbID
 * @desc    Get detailed movie information by IMDB ID
 * @access  Protected
 */
router.get('/movie/:imdbID', auth, async (req, res) => {
  try {
    const { imdbID } = req.params;

    if (!imdbID) {
      return res.status(400).json({ error: 'IMDB ID is required' });
    }

    const result = await omdbService.getMovieDetails(imdbID);

    if (result.success) {
      res.json({
        success: true,
        movie: result.movie
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('OMDB get movie details error:', error);
    res.status(500).json({ error: 'Failed to get movie details' });
  }
});

/**
 * @route   GET /api/omdb/indian-movies
 * @desc    Get popular Indian movies
 * @access  Protected
 */
router.get('/indian-movies', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const movies = await omdbService.searchIndianMovies(limit);

    res.json({
      success: true,
      movies: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Error fetching Indian movies:', error);
    res.status(500).json({ error: 'Failed to fetch Indian movies' });
  }
});

/**
 * @route   GET /api/omdb/search-by-actor
 * @desc    Search movies by actor name
 * @access  Protected
 */
router.get('/search-by-actor', auth, async (req, res) => {
  try {
    const { actor } = req.query;

    if (!actor) {
      return res.status(400).json({ error: 'Actor name is required' });
    }

    const movies = await omdbService.searchByActor(actor);

    res.json({
      success: true,
      movies: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Error searching by actor:', error);
    res.status(500).json({ error: 'Failed to search movies by actor' });
  }
});

/**
 * @route   GET /api/omdb/popular-indian-actors
 * @desc    Get movies by popular Indian actors
 * @access  Protected
 */
router.get('/popular-indian-actors', auth, async (req, res) => {
  try {
    const actorsMovies = await omdbService.getPopularIndianActorsMovies();

    res.json({
      success: true,
      actorsMovies: actorsMovies
    });
  } catch (error) {
    console.error('Error fetching popular Indian actors movies:', error);
    res.status(500).json({ error: 'Failed to fetch popular Indian actors movies' });
  }
});

/**
 * @route   GET /api/omdb/batch-details
 * @desc    Get detailed information for multiple movies
 * @access  Protected
 */
router.post('/batch-details', auth, async (req, res) => {
  try {
    const { movieList } = req.body;

    if (!movieList || !Array.isArray(movieList)) {
      return res.status(400).json({ error: 'Movie list array is required' });
    }

    const detailedMovies = await omdbService.getMultipleMovieDetails(movieList);

    res.json({
      success: true,
      movies: detailedMovies,
      count: detailedMovies.length
    });
  } catch (error) {
    console.error('Error fetching batch movie details:', error);
    res.status(500).json({ error: 'Failed to fetch batch movie details' });
  }
});

/**
 * @route   GET /api/omdb/indian-actors
 * @desc    Get list of popular Indian actors
 * @access  Protected
 */
router.get('/indian-actors', auth, (req, res) => {
  res.json({
    success: true,
    actors: omdbService.INDIAN_ACTORS
  });
});

module.exports = router;
