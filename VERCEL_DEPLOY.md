# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. MongoDB Atlas account (or your MongoDB connection string)
3. OMDB API key (optional, has fallback)

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### 3. Set Environment Variables

In your Vercel project settings, add these environment variables:

- `MONGO_URI` - Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/moviedb?retryWrites=true&w=majority`
- `OMDB_API_KEY` - (Optional) Your OMDB API key
  - Get one at: https://www.omdbapi.com/apikey.aspx
  - Default fallback key is used if not set

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Project Structure

```
Movie-Database/
├── api/
│   └── index.js          # Serverless function entry point
├── public/               # Static files (HTML, CSS, JS)
├── routes/               # API route handlers
├── models/               # Mongoose models
├── services/             # Business logic
└── vercel.json           # Vercel configuration
```

## Important Notes

1. **MongoDB Connection**: The app uses connection caching for serverless functions
2. **Static Files**: All static files are served through the Express app
3. **API Routes**: All `/api/*` routes are handled by the serverless function
4. **Frontend Routes**: All other routes serve the React/HTML app

## Troubleshooting

### Database Connection Issues
- Ensure `MONGO_URI` is set correctly in Vercel environment variables
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
- Verify MongoDB connection string format

### Static Files Not Loading
- Ensure files are in the `public/` directory
- Check that file paths in HTML are relative (e.g., `href="styles.css"` not `href="/styles.css"`)

### API Routes Not Working
- Check Vercel function logs in the dashboard
- Verify environment variables are set
- Ensure MongoDB connection is established

## Local Development

For local development, use:
```bash
npm start
```

This runs the Express server on port 5001 (or PORT environment variable).

## Production vs Development

- **Development**: Uses `server.js` with `dotenv` for local `.env` file
- **Production**: Uses `api/index.js` as serverless function with Vercel environment variables

