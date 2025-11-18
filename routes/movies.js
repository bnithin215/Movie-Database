const express = require('express');
const Movie = require('../models/Movie');
const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Create a new movie
router.post('/', async (req, res) => {
  try {
    const {
      title, genre, actor, rating, director, cast, poster,
      imdbID, imdbRating, year, runtime, plot, country,
      language, awards, trailer, boxOffice, production
    } = req.body;

    if (!title || !genre) {
      return res.status(400).json({ error: 'Title and genre are required' });
    }

    const movie = new Movie({
      title,
      genre,
      actor,
      rating: rating ? Number(rating) : undefined,
      director,
      cast,
      poster,
      imdbID,
      imdbRating,
      year,
      runtime,
      plot,
      country,
      language,
      awards,
      trailer,
      boxOffice,
      production
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    // Handle duplicate imdbID error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.imdbID) {
      return res.status(400).json({ error: 'This movie is already in your collection' });
    }
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

// Get a specific movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Update a movie
router.put('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Delete a movie
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

module.exports = router;