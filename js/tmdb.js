// TMDB API Configuration
const TMDB_API_KEY = 'd87e27aa77fbcfe8fbebfe5f40f4f215';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Categories to fetch from TMDB
const categories = [
    { id: 'popular', name: 'Popular on FAHEEMFLIX', url: '/movie/popular' },
    { id: 'top_rated', name: 'Top Rated Movies', url: '/movie/top_rated' },
    { id: 'upcoming', name: 'Upcoming Movies', url: '/movie/upcoming' },
    { id: 'now_playing', name: 'Now Playing', url: '/movie/now_playing' },
    { id: 'action', name: 'Action Movies', url: '/discover/movie', genre: 28 },
    { id: 'comedy', name: 'Comedies', url: '/discover/movie', genre: 35 },
    { id: 'documentary', name: 'Documentaries', url: '/discover/movie', genre: 99 },
];

// Function to fetch movies from TMDB API
async function fetchMovies(category) {
    try {
        let url = `${TMDB_BASE_URL}${category.url}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        
        // Add genre parameter if it exists
        if (category.genre) {
            url += `&with_genres=${category.genre}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching ${category.name}: ${response.status}`);
        }
        const data = await response.json();
        return data.results.slice(0, 10); // Return first 10 movies
    } catch (error) {
        console.error(`Error fetching ${category.name}:`, error);
        return [];
    }
}

// Function to create a movie card element
function createMovieCard(movie) {
    // Skip movies without a poster
    if (!movie.poster_path) return null;

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="movie-thumbnail">
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="play-button"><i class="fas fa-play"></i></div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) + ' ★' : 'N/A'}</span>
                <span class="movie-year">${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
            </div>
        </div>
    `;

    // Add click event to show movie details
    card.addEventListener('click', () => {
        // Format movie duration (TMDB doesn't provide duration in the list endpoint)
        const duration = '2h 0m'; // Default duration, you can fetch actual duration from movie details if needed
        
        showMovieDetails(
            movie.title,
            `${IMAGE_BASE_URL}${movie.poster_path}`,
            movie.adult ? 'R' : 'PG-13',
            movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
            duration,
            movie.overview || 'No description available.',
            'Cast not available', // You can fetch cast details from movie credits endpoint if needed
            'Director not available',
            '' // No Vimeo ID for TMDB movies
        );
    });

    return card;
}

// Function to create a category section
function createCategorySection(category, movies) {
    if (movies.length === 0) return null;

    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = `category-${category.id}`;
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = category.name;
    
    const grid = document.createElement('div');
    grid.className = 'movies-grid';
    
    // Add movies to the grid
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        if (card) grid.appendChild(card);
    });
    
    section.appendChild(title);
    section.appendChild(grid);
    
    return section;
}

// Main function to load all categories
async function loadAllCategories() {
    const container = document.getElementById('tmdb-categories');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading">Loading movies...</div>';
    
    try {
        // Fetch all categories in parallel
        const categoriesWithMovies = await Promise.all(
            categories.map(async category => {
                const movies = await fetchMovies(category);
                return { ...category, movies };
            })
        );
        
        // Clear loading state
        container.innerHTML = '';
        
        // Add each category to the page
        categoriesWithMovies.forEach(({ ...category }) => {
            if (category.movies.length > 0) {
                const section = createCategorySection(category, category.movies);
                if (section) {
                    container.appendChild(section);
                }
            }
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = '<div class="error">Failed to load movies. Please try again later.</div>';
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadAllCategories);
