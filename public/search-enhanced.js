// API Configuration
const API_BASE = '/api';
const MOVIES_API = `${API_BASE}/movies`;
const OMDB_API = `${API_BASE}/omdb`;

// State Management
let allMovies = [];
let searchResults = [];
let omdbResults = [];
let activeTab = 'myCollection'; // 'myCollection' or 'omdb'
let currentView = 'grid'; // 'grid' or 'list'
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Verify token
        const userResponse = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (userResponse.ok) {
            currentUser = await userResponse.json();
            await loadMovies();
            setupEventListeners();
        } else {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        window.location.href = '/login.html';
    }
}

function setupEventListeners() {
    // Logout
    document.getElementById('navLogoutBtn')?.addEventListener('click', handleLogout);

    // Tab switching
    document.getElementById('myCollectionTab')?.addEventListener('click', () => switchTab('myCollection'));
    document.getElementById('omdbSearchTab')?.addEventListener('click', () => switchTab('omdb'));

    // My Collection Search
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('clearSearchBtn')?.addEventListener('click', clearSearch);
    document.getElementById('showAllBtn')?.addEventListener('click', showAllMovies);

    // OMDB Search
    document.getElementById('omdbSearchBtn')?.addEventListener('click', performOMDBSearch);
    document.getElementById('searchByActorBtn')?.addEventListener('click', searchByActor);
    document.getElementById('clearOmdbBtn')?.addEventListener('click', clearOMDBSearch);
    document.getElementById('loadIndianMoviesBtn')?.addEventListener('click', loadIndianMovies);
    document.getElementById('loadBollywoodBtn')?.addEventListener('click', () => searchOMDBByQuery('Bollywood'));

    // Actor chips
    document.querySelectorAll('.actor-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const actor = e.target.getAttribute('data-actor');
            document.getElementById('omdbActorSearch').value = actor;
            searchByActor();
        });
    });

    // Quick filters
    document.querySelectorAll('.quick-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            const genre = e.target.getAttribute('data-genre');
            const rating = e.target.getAttribute('data-rating');

            if (genre) {
                document.getElementById('genreSearch').value = genre;
            }
            if (rating) {
                document.getElementById('ratingSearch').value = rating;
            }

            performSearch();
        });
    });

    // View toggle
    document.getElementById('gridViewBtn')?.addEventListener('click', () => switchView('grid'));
    document.getElementById('listViewBtn')?.addEventListener('click', () => switchView('list'));

    // Sort
    document.getElementById('sortResults')?.addEventListener('change', sortResults);

    // Enter key listeners
    ['mainSearch', 'titleSearch', 'actorSearch', 'directorSearch', 'castSearch'].forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    });

    ['omdbQuery', 'omdbActorSearch'].forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (id === 'omdbActorSearch') searchByActor();
                else performOMDBSearch();
            }
        });
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function switchTab(tab) {
    activeTab = tab;

    // Update tab buttons
    document.getElementById('myCollectionTab').classList.toggle('active', tab === 'myCollection');
    document.getElementById('omdbSearchTab').classList.toggle('active', tab === 'omdb');

    // Show/hide search forms
    document.querySelector('.search-container').style.display = tab === 'myCollection' ? 'block' : 'none';
    document.getElementById('omdbSearchForm').style.display = tab === 'omdb' ? 'block' : 'none';

    // Clear and show appropriate results
    if (tab === 'myCollection') {
        showWelcomeMessage();
    } else {
        showOMDBWelcomeMessage();
    }
}

async function loadMovies() {
    try {
        const response = await fetch(MOVIES_API, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            allMovies = await response.json();
            console.log(`Loaded ${allMovies.length} movies from collection`);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showError('Failed to load your movie collection');
    }
}

function performSearch() {
    const searchTerms = {
        main: document.getElementById('mainSearch').value.toLowerCase().trim(),
        title: document.getElementById('titleSearch').value.toLowerCase().trim(),
        actor: document.getElementById('actorSearch').value.toLowerCase().trim(),
        director: document.getElementById('directorSearch').value.toLowerCase().trim(),
        cast: document.getElementById('castSearch').value.toLowerCase().trim(),
        genre: document.getElementById('genreSearch').value,
        rating: document.getElementById('ratingSearch').value
    };

    const hasSearchCriteria = Object.values(searchTerms).some(term => term !== '');

    if (!hasSearchCriteria) {
        showWelcomeMessage();
        return;
    }

    showLoading(true);

    searchResults = allMovies.filter(movie => {
        // Main search
        if (searchTerms.main) {
            const searchableText = [
                movie.title,
                movie.actor,
                movie.director,
                movie.cast,
                movie.genre
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchableText.includes(searchTerms.main)) return false;
        }

        // Specific field searches
        if (searchTerms.title && !movie.title.toLowerCase().includes(searchTerms.title)) return false;
        if (searchTerms.actor && (!movie.actor || !movie.actor.toLowerCase().includes(searchTerms.actor))) return false;
        if (searchTerms.director && (!movie.director || !movie.director.toLowerCase().includes(searchTerms.director))) return false;
        if (searchTerms.cast && (!movie.cast || !movie.cast.toLowerCase().includes(searchTerms.cast))) return false;
        if (searchTerms.genre && movie.genre !== searchTerms.genre) return false;
        if (searchTerms.rating && (!movie.rating || movie.rating < parseInt(searchTerms.rating))) return false;

        return true;
    });

    displaySearchResults();
    showLoading(false);
}

async function performOMDBSearch() {
    const query = document.getElementById('omdbQuery').value.trim();
    const year = document.getElementById('omdbYear').value.trim();
    const type = document.getElementById('omdbType').value;

    if (!query) {
        showError('Please enter a search query');
        return;
    }

    await searchOMDBByQuery(query, year, type);
}

async function searchOMDBByQuery(query, year = '', type = '') {
    showLoading(true);

    try {
        let url = `${OMDB_API}/search?query=${encodeURIComponent(query)}`;
        if (year) url += `&year=${year}`;
        if (type) url += `&type=${type}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await response.json();

        if (data.success && data.movies && data.movies.length > 0) {
            // Get detailed information for each movie
            const detailsResponse = await fetch(`${OMDB_API}/batch-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ movieList: data.movies })
            });

            const detailsData = await detailsResponse.json();

            if (detailsData.success) {
                omdbResults = detailsData.movies;
                displayOMDBResults();
                updateOMDBStats();
            }
        } else {
            omdbResults = [];
            showNoResults();
        }
    } catch (error) {
        console.error('OMDB search error:', error);
        showError('Failed to search OMDB database');
    } finally {
        showLoading(false);
    }
}

async function searchByActor() {
    const actor = document.getElementById('omdbActorSearch').value.trim();

    if (!actor) {
        showError('Please enter an actor name');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${OMDB_API}/search-by-actor?actor=${encodeURIComponent(actor)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await response.json();

        if (data.success && data.movies && data.movies.length > 0) {
            omdbResults = data.movies;
            displayOMDBResults();
            updateOMDBStats();
        } else {
            omdbResults = [];
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching by actor:', error);
        showError('Failed to search by actor');
    } finally {
        showLoading(false);
    }
}

async function loadIndianMovies() {
    showLoading(true);

    try {
        const response = await fetch(`${OMDB_API}/indian-movies?limit=20`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await response.json();

        if (data.success && data.movies && data.movies.length > 0) {
            omdbResults = data.movies;
            displayOMDBResults();
            updateOMDBStats();
        } else {
            showError('No Indian movies found');
        }
    } catch (error) {
        console.error('Error loading Indian movies:', error);
        showError('Failed to load Indian movies');
    } finally {
        showLoading(false);
    }
}

function displaySearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    const statsContainer = document.getElementById('searchStats');
    const sortContainer = document.getElementById('sortContainer');

    if (searchResults.length === 0) {
        showNoResults();
        return;
    }

    resultsContainer.innerHTML = '';
    resultsContainer.className = `search-results ${currentView}`;
    statsContainer.style.display = 'block';
    sortContainer.style.display = 'block';

    updateSearchStats();

    searchResults.forEach((movie, index) => {
        const movieCard = createMovieCard(movie, index);
        resultsContainer.appendChild(movieCard);
    });
}

function displayOMDBResults() {
    const resultsContainer = document.getElementById('searchResults');
    const sortContainer = document.getElementById('sortContainer');

    if (omdbResults.length === 0) {
        showNoResults();
        return;
    }

    resultsContainer.innerHTML = '';
    resultsContainer.className = `search-results ${currentView}`;
    sortContainer.style.display = 'block';

    omdbResults.forEach((movie, index) => {
        const movieCard = createOMDBMovieCard(movie, index);
        resultsContainer.appendChild(movieCard);
    });
}

function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterUrl = movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster';
    const stars = movie.rating ? '⭐'.repeat(movie.rating) : 'Not rated';

    card.innerHTML = `
        ${movie.poster ? `<img src="${movie.poster}" alt="${escapeHtml(movie.title)}" class="movie-poster">` : ''}
        <div class="movie-content">
            <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
            ${movie.year ? `<p class="movie-year">Year: ${movie.year}</p>` : ''}
            <p class="movie-genre">Genre: ${movie.genre}</p>
            ${movie.actor ? `<p class="movie-actor">Starring: ${escapeHtml(movie.actor)}</p>` : ''}
            ${movie.director ? `<p class="movie-director">Director: ${escapeHtml(movie.director)}</p>` : ''}
            <p class="movie-rating">Rating: ${stars} ${movie.rating ? `(${movie.rating}/5)` : ''}</p>
            ${movie.imdbRating ? `<p class="imdb-rating">IMDB: ${movie.imdbRating}/10</p>` : ''}
            ${movie.plot ? `<p class="movie-plot">${escapeHtml(movie.plot)}</p>` : ''}
            <div class="movie-actions">
                <button onclick="viewMovieDetails('${movie._id}')" class="action-btn details">View Details</button>
                ${movie.trailer ? `<button onclick="watchTrailer('${movie.trailer}')" class="action-btn trailer">🎬 Watch Trailer</button>` : ''}
            </div>
        </div>
    `;

    return card;
}

function createOMDBMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card omdb-card';

    const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    const imdbRating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${escapeHtml(movie.Title)}" class="movie-poster">
        <div class="movie-content">
            <h3 class="movie-title">${escapeHtml(movie.Title)}</h3>
            ${movie.Year ? `<p class="movie-year">Year: ${movie.Year}</p>` : ''}
            ${movie.Genre ? `<p class="movie-genre">Genre: ${movie.Genre}</p>` : ''}
            ${movie.Actors ? `<p class="movie-actors">Cast: ${escapeHtml(movie.Actors)}</p>` : ''}
            ${movie.Director && movie.Director !== 'N/A' ? `<p class="movie-director">Director: ${escapeHtml(movie.Director)}</p>` : ''}
            <p class="imdb-rating">IMDB Rating: ${imdbRating}/10</p>
            ${movie.Country ? `<p class="movie-country">🌍 ${movie.Country}</p>` : ''}
            ${movie.Language ? `<p class="movie-language">🗣️ ${movie.Language}</p>` : ''}
            ${movie.Plot && movie.Plot !== 'N/A' ? `<p class="movie-plot">${escapeHtml(movie.Plot)}</p>` : ''}
            <div class="movie-actions">
                <button onclick="addOMDBMovieToCollection(${index})" class="action-btn add">➕ Add to Collection</button>
                <button onclick="viewOMDBDetails(${index})" class="action-btn details">View Details</button>
                <button onclick="searchTrailer('${escapeHtml(movie.Title)}', ${movie.Year || 'null'})" class="action-btn trailer">🎬 Find Trailer</button>
            </div>
        </div>
    `;

    return card;
}

async function addOMDBMovieToCollection(index) {
    const omdbMovie = omdbResults[index];

    const movieData = {
        title: omdbMovie.Title,
        genre: mapOMDBGenreToOurGenre(omdbMovie.Genre),
        actor: omdbMovie.Actors && omdbMovie.Actors !== 'N/A' ? omdbMovie.Actors.split(',')[0].trim() : '',
        director: omdbMovie.Director && omdbMovie.Director !== 'N/A' ? omdbMovie.Director : '',
        cast: omdbMovie.Actors && omdbMovie.Actors !== 'N/A' ? omdbMovie.Actors : '',
        poster: omdbMovie.Poster && omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '',
        rating: omdbMovie.imdbRating && omdbMovie.imdbRating !== 'N/A' ? Math.round(parseFloat(omdbMovie.imdbRating) / 2) : 3,
        imdbID: omdbMovie.imdbID,
        imdbRating: omdbMovie.imdbRating,
        year: omdbMovie.Year,
        runtime: omdbMovie.Runtime,
        plot: omdbMovie.Plot && omdbMovie.Plot !== 'N/A' ? omdbMovie.Plot : '',
        country: omdbMovie.Country,
        language: omdbMovie.Language,
        awards: omdbMovie.Awards,
        boxOffice: omdbMovie.BoxOffice,
        production: omdbMovie.Production
    };

    try {
        const response = await fetch(MOVIES_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(movieData)
        });

        if (response.ok) {
            showSuccess(`"${omdbMovie.Title}" added to your collection!`);
            await loadMovies();
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to add movie to collection');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        showError('Failed to add movie to collection');
    }
}

function viewOMDBDetails(index) {
    const movie = omdbResults[index];
    const modal = createMovieDetailsModal(movie);
    document.body.appendChild(modal);
}

function createMovieDetailsModal(movie) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${escapeHtml(movie.Title)}</h2>
            ${movie.Poster && movie.Poster !== 'N/A' ? `<img src="${movie.Poster}" alt="${escapeHtml(movie.Title)}" style="max-width: 300px;">` : ''}
            <p><strong>Year:</strong> ${movie.Year || 'N/A'}</p>
            <p><strong>Genre:</strong> ${movie.Genre || 'N/A'}</p>
            <p><strong>Director:</strong> ${movie.Director || 'N/A'}</p>
            <p><strong>Actors:</strong> ${movie.Actors || 'N/A'}</p>
            <p><strong>Plot:</strong> ${movie.Plot || 'N/A'}</p>
            <p><strong>IMDB Rating:</strong> ${movie.imdbRating || 'N/A'}/10</p>
            <p><strong>Runtime:</strong> ${movie.Runtime || 'N/A'}</p>
            <p><strong>Country:</strong> ${movie.Country || 'N/A'}</p>
            <p><strong>Language:</strong> ${movie.Language || 'N/A'}</p>
            ${movie.Awards && movie.Awards !== 'N/A' ? `<p><strong>Awards:</strong> ${movie.Awards}</p>` : ''}
            ${movie.BoxOffice ? `<p><strong>Box Office:</strong> ${movie.BoxOffice}</p>` : ''}
        </div>
    `;
    return modal;
}

function searchTrailer(title, year) {
    const searchQuery = year ? `${title} ${year} trailer` : `${title} trailer`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(youtubeUrl, '_blank');
}

function watchTrailer(trailerUrl) {
    window.open(trailerUrl, '_blank');
}

function mapOMDBGenreToOurGenre(omdbGenre) {
    if (!omdbGenre || omdbGenre === 'N/A') return 'Drama';

    const genres = omdbGenre.toLowerCase();
    if (genres.includes('action')) return 'Action';
    if (genres.includes('comedy')) return 'Comedy';
    if (genres.includes('romance')) return 'Rom-Com';
    if (genres.includes('horror')) return 'Horror';
    if (genres.includes('thriller')) return 'Thriller';
    if (genres.includes('sci-fi') || genres.includes('science fiction')) return 'Sci-Fi';
    if (genres.includes('fantasy')) return 'Fantasy';
    return 'Drama';
}

function sortResults() {
    const sortBy = document.getElementById('sortResults').value;

    if (activeTab === 'myCollection') {
        searchResults.sort((a, b) => {
            switch (sortBy) {
                case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'title-asc': return a.title.localeCompare(b.title);
                case 'title-desc': return b.title.localeCompare(a.title);
                case 'rating-high': return (b.rating || 0) - (a.rating || 0);
                case 'rating-low': return (a.rating || 0) - (b.rating || 0);
                default: return 0;
            }
        });
        displaySearchResults();
    } else {
        omdbResults.sort((a, b) => {
            switch (sortBy) {
                case 'title-asc': return a.Title.localeCompare(b.Title);
                case 'title-desc': return b.Title.localeCompare(a.Title);
                case 'rating-high':
                    return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
                case 'rating-low':
                    return (parseFloat(a.imdbRating) || 0) - (parseFloat(b.imdbRating) || 0);
                default: return 0;
            }
        });
        displayOMDBResults();
    }
}

function clearSearch() {
    document.getElementById('mainSearch').value = '';
    document.getElementById('titleSearch').value = '';
    document.getElementById('actorSearch').value = '';
    document.getElementById('directorSearch').value = '';
    document.getElementById('castSearch').value = '';
    document.getElementById('genreSearch').value = '';
    document.getElementById('ratingSearch').value = '';
    showWelcomeMessage();
}

function clearOMDBSearch() {
    document.getElementById('omdbQuery').value = '';
    document.getElementById('omdbActorSearch').value = '';
    document.getElementById('omdbYear').value = '';
    document.getElementById('omdbType').value = '';
    showOMDBWelcomeMessage();
}

function showAllMovies() {
    searchResults = [...allMovies];
    displaySearchResults();
}

function switchView(view) {
    currentView = view;
    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');

    if (activeTab === 'myCollection') {
        displaySearchResults();
    } else {
        displayOMDBResults();
    }
}

function updateSearchStats() {
    const statsText = document.getElementById('searchStatsText');
    statsText.innerHTML = `Found <strong>${searchResults.length}</strong> movies in your collection`;
}

function updateOMDBStats() {
    const statsText = document.getElementById('searchStatsText');
    statsText.innerHTML = `Found <strong>${omdbResults.length}</strong> movies in OMDB database`;
}

function showWelcomeMessage() {
    const resultsContainer = document.getElementById('searchResults');
    document.getElementById('searchStats').style.display = 'none';
    document.getElementById('sortContainer').style.display = 'none';

    resultsContainer.innerHTML = `
        <div class="welcome-message">
            <h2>🎬 Welcome to Advanced Search</h2>
            <p>Use the search form above to find specific movies in your collection.</p>
            <p>You can search by title, actor, director, genre, rating, or any combination!</p>
        </div>
    `;
}

function showOMDBWelcomeMessage() {
    const resultsContainer = document.getElementById('searchResults');
    document.getElementById('searchStats').style.display = 'none';
    document.getElementById('sortContainer').style.display = 'none';

    resultsContainer.innerHTML = `
        <div class="welcome-message">
            <h2>🌐 Discover Movies from OMDB</h2>
            <p>🇮🇳 Start by clicking "Load Popular Indian Movies" or search for any movie!</p>
            <p>You can search by movie title, actor name, or browse our curated Indian cinema collection.</p>
        </div>
    `;
}

function showLoading(show) {
    const loading = document.getElementById('searchLoading');
    if (loading) loading.style.display = show ? 'block' : 'none';
}

function showNoResults() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
        <div class="no-results-message">
            <h2>🔍 No Movies Found</h2>
            <p>No movies match your search criteria.</p>
        </div>
    `;
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
