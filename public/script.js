const MOVIES_API_URL = '/api/movies';
let selectedRating = 0;
let movies = [];
let filteredMovies = [];
let currentView = 'grid'; // 'grid' or 'list'

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  setupEventListeners();
  setupStarRating();
  fetchMovies();
  showMovieUI();
}

function setupEventListeners() {
  // Movie form
  const movieForm = document.getElementById('movieForm');
  if (movieForm) {
    movieForm.addEventListener('submit', handleAddMovie);
  }

  // Search and Filter Controls
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  const genreFilter = document.getElementById('genreFilter');
  if (genreFilter) {
    genreFilter.addEventListener('change', applyFilters);
  }

  const ratingFilter = document.getElementById('ratingFilter');
  if (ratingFilter) {
    ratingFilter.addEventListener('change', applyFilters);
  }

  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    sortBy.addEventListener('change', applyFilters);
  }

  const clearFilters = document.getElementById('clearFilters');
  if (clearFilters) {
    clearFilters.addEventListener('click', clearAllFilters);
  }

  // View Toggle
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');
  if (gridView && listView) {
    gridView.addEventListener('click', () => switchView('grid'));
    listView.addEventListener('click', () => switchView('list'));
  }
}

function setupStarRating() {
  const stars = document.querySelectorAll('.stars span');
  if (stars.length === 0) return;

  stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(star.dataset.star));
    star.addEventListener('mouseout', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.star);
      document.getElementById('ratingInput').value = selectedRating;
      updateStars();
    });
  });
}

function highlightStars(rating) {
  document.querySelectorAll('.stars span').forEach(star => {
    star.classList.toggle('hovered', parseInt(star.dataset.star) <= rating);
  });
}

function updateStars() {
  document.querySelectorAll('.stars span').forEach(star => {
    star.classList.toggle('active', parseInt(star.dataset.star) <= selectedRating);
  });
}

async function handleAddMovie(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const movie = Object.fromEntries(formData);

  if (!selectedRating) {
    alert('Please select a rating for the movie');
    return;
  }

  movie.rating = selectedRating;

  try {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding Movie...';
    submitBtn.disabled = true;

    const response = await fetch(MOVIES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(movie)
    });

    if (response.ok) {
      const newMovie = await response.json();
      movies.unshift(newMovie); // Add to beginning of array

      // Reset form
      e.target.reset();
      selectedRating = 0;
      updateStars();

      // Update UI
      renderMovies();
      updateMovieStats();

      // Show success message
      showTemporaryMessage('Movie added successfully!', 'success');
    } else {
      const error = await response.json();
      alert(error.error || 'Error adding movie');
    }
  } catch (error) {
    console.error('Add movie error:', error);
    alert('Network error. Please try again.');
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Add Movie to Collection';
    submitBtn.disabled = false;
  }
}

async function fetchMovies() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = 'block';
  }

  try {
    const response = await fetch(MOVIES_API_URL);

    if (response.ok) {
      movies = await response.json();
      filteredMovies = [...movies]; // Initialize filtered movies
      renderMovies();
      updateMovieStats();
    } else {
      console.error('Failed to fetch movies');
      showTemporaryMessage('Failed to load movies', 'error');
    }
  } catch (error) {
    console.error('Fetch movies error:', error);
    showTemporaryMessage('Network error while loading movies', 'error');
  } finally {
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }
}

function renderMovies() {
  const movieList = document.getElementById('movieList');
  if (!movieList) return;

  // Apply current view class
  movieList.className = currentView === 'list' ? 'list-view' : '';
  movieList.innerHTML = '';

  if (filteredMovies.length === 0) {
    const isFiltered = filteredMovies.length !== movies.length ||
        document.getElementById('searchInput')?.value ||
        document.getElementById('genreFilter')?.value ||
        document.getElementById('ratingFilter')?.value;

    movieList.innerHTML = `
      <li class="no-results" style="grid-column: 1/-1;">
        <div class="movie-info">
          <h3>${isFiltered ? '🔍 No movies match your filters' : '🎬 No movies in the collection yet!'}</h3>
          <p>${isFiltered ? 'Try adjusting your search criteria or clear filters.' : 'Add your first movie using the form above.'}</p>
        </div>
      </li>
    `;
    return;
  }

  filteredMovies.forEach((movie, index) => {
    const li = document.createElement('li');

    if (currentView === 'list') {
      li.innerHTML = `
        <div class="movie-info">
          <div class="movie-details">
            <div class="movie-title">${escapeHtml(movie.title)}</div>
            <div class="movie-meta">
              <span class="genre">${escapeHtml(movie.genre)}</span>
              ${movie.actor ? `<span class="actor">★ ${escapeHtml(movie.actor)}</span>` : ''}
              ${movie.rating ? `<span class="rating">${'⭐'.repeat(movie.rating)} (${movie.rating}/5)</span>` : ''}
              ${movie.director ? `<span class="director">🎬 ${escapeHtml(movie.director)}</span>` : ''}
            </div>
          </div>
          <div class="movie-actions">
            <button onclick="editMovie('${movie._id}', ${movies.indexOf(movie)})" class="edit-btn">Edit</button>
            <button onclick="deleteMovie('${movie._id}', ${movies.indexOf(movie)})" class="delete-btn">Delete</button>
          </div>
        </div>
      `;
    } else {
      li.innerHTML = `
        <div class="movie-info">
          <div class="movie-title">${escapeHtml(movie.title)}</div>
          <div class="movie-meta">
            <span class="genre">${escapeHtml(movie.genre)}</span>
            ${movie.actor ? `<span class="actor">Starring: ${escapeHtml(movie.actor)}</span>` : ''}
            ${movie.rating ? `<span class="rating">${'⭐'.repeat(movie.rating)} (${movie.rating}/5)</span>` : ''}
          </div>
          ${movie.director ? `<div class="movie-director">Directed by: ${escapeHtml(movie.director)}</div>` : ''}
          ${movie.cast ? `<div class="movie-cast">Cast: ${escapeHtml(movie.cast)}</div>` : ''}
          <div class="movie-actions">
            <button onclick="editMovie('${movie._id}', ${movies.indexOf(movie)})" class="edit-btn">Edit</button>
            <button onclick="deleteMovie('${movie._id}', ${movies.indexOf(movie)})" class="delete-btn">Delete</button>
          </div>
        </div>
      `;
    }

    movieList.appendChild(li);
  });
}

function updateMovieStats() {
  const statsEl = document.getElementById('statsText');
  if (!statsEl) return;

  if (movies.length === 0) {
    statsEl.textContent = 'No movies in the collection yet';
    return;
  }

  const totalMovies = movies.length;
  const avgRating = movies.reduce((sum, movie) => sum + (movie.rating || 0), 0) / totalMovies;
  const genreCount = movies.reduce((acc, movie) => {
    acc[movie.genre] = (acc[movie.genre] || 0) + 1;
    return acc;
  }, {});

  const favoriteGenre = Object.entries(genreCount).reduce((a, b) => genreCount[a[0]] > genreCount[b[0]] ? a : b)[0];

  statsEl.innerHTML = `
    <strong>${totalMovies}</strong> movies • 
    Average rating: <strong>${avgRating.toFixed(1)}</strong>⭐ • 
    Favorite genre: <strong>${favoriteGenre}</strong>
  `;
}

async function deleteMovie(movieId, index) {
  if (!confirm('Are you sure you want to delete this movie?')) {
    return;
  }

  try {
    const response = await fetch(`${MOVIES_API_URL}/${movieId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      movies.splice(index, 1);
      renderMovies();
      updateMovieStats();
      showTemporaryMessage('Movie deleted successfully', 'success');
    } else {
      const error = await response.json();
      alert(error.error || 'Error deleting movie');
    }
  } catch (error) {
    console.error('Delete movie error:', error);
    alert('Network error. Please try again.');
  }
}

async function editMovie(movieId, index) {
  const movie = movies[index];
  const newTitle = prompt('Edit movie title:', movie.title);

  if (newTitle === null || newTitle.trim() === '') {
    return; // User cancelled or entered empty string
  }

  try {
    const response = await fetch(`${MOVIES_API_URL}/${movieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: newTitle.trim() })
    });

    if (response.ok) {
      const updatedMovie = await response.json();
      movies[index] = updatedMovie;
      renderMovies();
      showTemporaryMessage('Movie updated successfully', 'success');
    } else {
      const error = await response.json();
      alert(error.error || 'Error updating movie');
    }
  } catch (error) {
    console.error('Update movie error:', error);
    alert('Network error. Please try again.');
  }
}

// Utility functions
function showTemporaryMessage(message, type) {
  // Create temporary message element
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.className = `${type} temporary-message`;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(messageEl);

  // Remove after 3 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, 3000);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Search, Filter, and Sort Functions
function applyFilters() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const genreFilter = document.getElementById('genreFilter')?.value || '';
  const ratingFilter = document.getElementById('ratingFilter')?.value || '';
  const sortBy = document.getElementById('sortBy')?.value || 'newest';

  // Start with all movies
  filteredMovies = movies.filter(movie => {
    // Search filter
    const searchMatch = !searchTerm ||
        movie.title.toLowerCase().includes(searchTerm) ||
        (movie.actor && movie.actor.toLowerCase().includes(searchTerm)) ||
        (movie.director && movie.director.toLowerCase().includes(searchTerm)) ||
        (movie.cast && movie.cast.toLowerCase().includes(searchTerm));

    // Genre filter
    const genreMatch = !genreFilter || movie.genre === genreFilter;

    // Rating filter
    const ratingMatch = !ratingFilter || (movie.rating && movie.rating >= parseInt(ratingFilter));

    return searchMatch && genreMatch && ratingMatch;
  });

  // Sort filtered movies
  filteredMovies.sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'rating-high':
        return (b.rating || 0) - (a.rating || 0);
      case 'rating-low':
        return (a.rating || 0) - (b.rating || 0);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  renderMovies();
  updateFilterStats();
}

function clearAllFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('genreFilter').value = '';
  document.getElementById('ratingFilter').value = '';
  document.getElementById('sortBy').value = 'newest';
  applyFilters();
}

function switchView(view) {
  currentView = view;

  // Update button states
  document.getElementById('gridView').classList.toggle('active', view === 'grid');
  document.getElementById('listView').classList.toggle('active', view === 'list');

  renderMovies();
}

function updateFilterStats() {
  const statsEl = document.getElementById('statsText');
  if (!statsEl) return;

  if (movies.length === 0) {
    statsEl.textContent = 'No movies in the collection yet';
    return;
  }

  const totalMovies = movies.length;
  const filteredCount = filteredMovies.length;
  const avgRating = filteredMovies.reduce((sum, movie) => sum + (movie.rating || 0), 0) / (filteredMovies.length || 1);

  const genreCount = filteredMovies.reduce((acc, movie) => {
    acc[movie.genre] = (acc[movie.genre] || 0) + 1;
    return acc;
  }, {});

  const favoriteGenre = Object.keys(genreCount).length > 0 ?
      Object.entries(genreCount).reduce((a, b) => genreCount[a[0]] > genreCount[b[0]] ? a : b)[0] : 'None';

  const filterText = filteredCount !== totalMovies ? ` (${filteredCount} filtered)` : '';

  statsEl.innerHTML = `
    <strong>${totalMovies}</strong> movies${filterText} • 
    Average rating: <strong>${avgRating.toFixed(1)}</strong>⭐ • 
    ${filteredCount > 0 ? `Top genre: <strong>${favoriteGenre}</strong>` : 'No movies match filters'}
  `;
}

function showMovieUI() {
  const movieSection = document.getElementById('movieSection');
  if (movieSection) {
    movieSection.style.display = 'block';
  }
  const mainNav = document.getElementById('mainNav');
  if (mainNav) {
    mainNav.style.display = 'block';
  }
}
