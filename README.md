# 🎬 Movie Database

A complete full-stack movie database application with **IMDB/OMDb API integration** and a special focus on **Indian Cinema**. Search, discover, and manage your personal movie collection with comprehensive movie information including posters, cast, ratings, and trailers.

Built with **Node.js, Express.js, MongoDB (Mongoose)** on the backend, and **HTML, CSS, and JavaScript** on the frontend.

---

## ✨ Features

### 🎭 Movie Management
- ⭐ Add movies with detailed information (title, genre, cast, director, plot, etc.)
- 🌟 Rate movies with a 5-star rating system
- ✏️ Edit movie details
- 🗑️ Delete movies from your collection
- 🔍 Advanced search and filtering capabilities

### 🌐 IMDB/OMDb Integration
- 🎬 Search millions of movies from the OMDb database
- 🖼️ Automatic poster image fetching
- 📊 IMDB ratings and metadata
- 🎥 Trailer search integration (YouTube)
- 📝 Complete movie information (plot, cast, director, awards, box office)

### 🇮🇳 Indian Cinema Focus
- 🎪 **One-click access to popular Indian movies**
- 🎭 Quick search for Bollywood movies
- 👤 **25+ Popular Indian actors** quick-select
- 🎬 Support for multiple languages:
  - Hindi (Bollywood)
  - Tamil (Kollywood)
  - Telugu (Tollywood)
  - Malayalam (Mollywood)
  - Kannada (Sandalwood)
  - Bengali, Marathi, Punjabi
- 🌟 Pre-loaded popular movies (RRR, Baahubali, 3 Idiots, Dangal, etc.)

### 👤 User Authentication
- 🔐 Secure signup and login
- 🔑 JWT-based authentication
- 👥 Personalized movie collections per user

### 🎨 User Interface
- 📱 Responsive design for all devices
- 🎨 Beautiful gradient UI with animations
- 🔄 Grid and List view toggle
- 🎯 Quick filters and sorting options
- 💫 Smooth animations and transitions

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with CSS Grid and Flexbox
- Modern UI with gradients and animations

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Axios for HTTP requests

**APIs:**
- OMDb API for movie data
- YouTube (for trailer searches)

---

## 📂 Project Structure

```
Movie-Database/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
│
├── models/                # MongoDB/Mongoose schemas
│   ├── User.js           # User model
│   └── Movie.js          # Movie model (with IMDB fields)
│
├── routes/               # Express route handlers
│   ├── auth.js          # Authentication routes
│   ├── movies.js        # Movie CRUD operations
│   └── omdb.js          # OMDb API integration routes
│
├── services/            # Business logic services
│   └── omdbService.js  # OMDb API service functions
│
├── middleware/          # Express middleware
│   └── authMiddleware.js # JWT authentication
│
├── public/              # Frontend static files
│   ├── index.html       # Main page (add movies)
│   ├── login.html       # Login page
│   ├── signup.html      # Signup page
│   ├── search.html      # Advanced search page
│   ├── script.js        # Main page JavaScript
│   ├── search-enhanced.js # Search page JavaScript
│   └── styles.css       # Application styles
│
├── README.md            # This file
└── IMDB_INTEGRATION.md  # Detailed API documentation
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- OMDb API key (free from [omdbapi.com](https://www.omdbapi.com/apikey.aspx))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bnithin215/Movie-Database.git
   cd Movie-Database
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5001
   OMDB_API_KEY=your_omdb_api_key
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the server:**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:5001
   ```

---

## 🎯 Usage Guide

### Getting Started
1. **Sign up** for a new account or **log in** if you already have one
2. Navigate to the **Search** page to discover movies
3. Click on **"Discover Movies (OMDB)"** tab

### Discovering Indian Movies
1. Click **"Load Popular Indian Movies"** for instant results
2. Or click **"Search Bollywood"** for Bollywood-specific content
3. Use the **actor chips** to quickly find movies by popular Indian actors
4. Click **"Add to Collection"** to save any movie

### Searching for Movies
- **By Title**: Enter movie name in the search box
- **By Actor**: Use the actor search field or click an actor chip
- **By Year**: Filter movies by release year
- **By Type**: Choose between movies and series

### Managing Your Collection
- View all your movies on the main page
- Edit movie details
- Delete movies you no longer want
- Rate movies with stars
- Filter and sort your collection

---

## 🌟 Key Features in Detail

### Advanced Search
- Search across title, actor, director, cast, and genre
- Combine multiple search criteria
- Quick filters for instant results
- Sort by relevance, date, title, or rating

### IMDB Integration
- Fetch complete movie data from OMDb
- Display IMDB ratings
- Show movie posters
- Access full cast and crew information
- View plot summaries and awards

### Indian Cinema
- Specialized search for Indian movies
- Quick access to Bollywood hits
- Support for regional cinema
- Popular Indian actors database
- Country and language filtering

### Trailer Support
- Direct YouTube search for trailers
- One-click trailer access
- Integration with movie details

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Movies
- `GET /api/movies` - Get all user's movies
- `POST /api/movies` - Add new movie
- `GET /api/movies/:id` - Get specific movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

### OMDb Integration
- `GET /api/omdb/search` - Search OMDb database
- `GET /api/omdb/movie/:imdbID` - Get movie details
- `GET /api/omdb/indian-movies` - Get popular Indian movies
- `GET /api/omdb/search-by-actor` - Search by actor name
- `POST /api/omdb/batch-details` - Get multiple movie details
- `GET /api/omdb/indian-actors` - Get list of Indian actors

For detailed API documentation, see [IMDB_INTEGRATION.md](IMDB_INTEGRATION.md)

---

## 🎨 Screenshots

### Main Features
- **Home Page**: Add movies to your collection
- **Search Page**: Discover new movies with OMDb integration
- **Indian Cinema**: Dedicated section for Indian movies
- **Movie Cards**: Beautiful display with posters and details

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Protected Routes**: API endpoints require authentication
- **Input Validation**: Server-side validation for all inputs
- **MongoDB Injection Protection**: Mongoose schema validation

---

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
PORT=5001
OMDB_API_KEY=your_omdb_api_key
JWT_SECRET=strong_random_secret_key
```

### Deployment Platforms
- **Heroku**: Perfect for Node.js apps
- **Vercel**: Great for full-stack apps
- **Railway**: Simple deployment
- **DigitalOcean**: Full control with VPS

---

## 📝 License

MIT License - feel free to use this project for learning or personal use.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@bnithin215](https://github.com/bnithin215)

---

## 🙏 Acknowledgments

- [OMDb API](https://www.omdbapi.com/) for movie data
- [MongoDB](https://www.mongodb.com/) for database
- [Express.js](https://expressjs.com/) for backend framework
- Indian cinema industry for amazing movies! 🇮🇳

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [IMDB_INTEGRATION.md](IMDB_INTEGRATION.md) for detailed API docs

---

**Made with ❤️ for movie lovers everywhere!** 🎬🍿
