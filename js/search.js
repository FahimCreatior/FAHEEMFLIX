// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('movieSearchInput');
    const searchResults = document.getElementById('searchResults');
    const openSearchBtn = document.getElementById('openSearch');
    const closeSearchBtn = document.getElementById('closeSearch');
    let searchTimeout;

    // Toggle search modal
    function toggleSearchModal() {
        searchModal.classList.toggle('active');
        if (searchModal.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    }

    // Close search when clicking outside
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            toggleSearchModal();
        }
    });

    // Close search with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            toggleSearchModal();
        }
    });

    // Event listeners for search
    if (openSearchBtn) openSearchBtn.addEventListener('click', toggleSearchModal);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', toggleSearchModal);

    // Search function
    async function searchMovies(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '<p class="no-results">Start typing to search for movies</p>';
            return;
        }

        try {
            // Show loading state
            searchResults.innerHTML = '<div class="loading">Searching movies...</div>';
            
            // Search movies using TMDB API
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=d87e27aa77fbcfe8fbebfe5f40f4f215&query=${encodeURIComponent(query)}&include_adult=false`);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                displaySearchResults(data.results);
            } else {
                searchResults.innerHTML = '<p class="no-results">No movies found. Try a different search term.</p>';
            }
        } catch (error) {
            console.error('Error searching movies:', error);
            searchResults.innerHTML = `
                <div class="error">
                    <p>Error searching movies. Please try again.</p>
                    <p class="error-detail">${error.message}</p>
                </div>`;
        }
    }

    // Display search results
    function displaySearchResults(movies) {
        if (!movies || movies.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No movies found. Try a different search term.</p>';
            return;
        }

        searchResults.innerHTML = movies.map(movie => `
            <div class="search-result-item" 
                 data-id="${movie.id}" 
                 data-title="${movie.title}" 
                 data-poster="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'placeholder.jpg'}"
                 data-year="${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}"
                 data-overview="${movie.overview ? movie.overview.replace(/"/g, '&quot;') : 'No description available'}">
                <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w200' + movie.poster_path : 'placeholder.jpg'}" 
                     alt="${movie.title}" 
                     onerror="this.src='placeholder.jpg'"
                     class="search-poster">
                <div class="search-result-info">
                    <h3>${movie.title}</h3>
                    <p class="year">${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</p>
                    <p class="overview">${movie.overview ? movie.overview.substring(0, 100) + (movie.overview.length > 100 ? '...' : '') : 'No description available'}</p>
                </div>
            </div>
        `).join('');

        // Add click event to search results
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const movieData = {
                    id: this.getAttribute('data-id'),
                    title: this.getAttribute('data-title'),
                    poster: this.getAttribute('data-poster'),
                    year: this.getAttribute('data-year'),
                    overview: this.getAttribute('data-overview'),
                    rating: 'N/A',
                    duration: '2h',
                    cast: 'N/A',
                    director: 'N/A',
                    vimeoId: 'default_video_id'
                };
                
                // Show movie details
                showMovieDetails(
                    movieData.title,
                    movieData.poster,
                    movieData.rating,
                    movieData.year,
                    movieData.duration,
                    movieData.overview,
                    movieData.cast,
                    movieData.director,
                    movieData.vimeoId
                );
                
                // Close the search modal
                toggleSearchModal();
            });
        });
    }

    // Debounce search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                searchResults.innerHTML = '<p class="no-results">Start typing to search for movies</p>';
                return;
            }
            
            if (query.length < 3) {
                searchResults.innerHTML = '<p class="no-results">Type at least 3 characters to search</p>';
                return;
            }
            
            searchResults.innerHTML = '<div class="loading">Searching...</div>';
            
            searchTimeout = setTimeout(() => {
                searchMovies(query);
            }, 500);
        });
    }
});

// Make showMovieDetails available globally
function showMovieDetails(title, poster, rating, year, duration, description, cast, director, vimeoId) {
    console.log('Showing movie details:', { title, poster, vimeoId });
    
    // Ensure the movie details elements exist
    const page = document.getElementById('movieDetailsPage');
    const header = document.getElementById('movieDetailsHeader');
    const titleEl = document.getElementById('movieDetailsTitle');
    const metaEl = document.getElementById('movieDetailsMeta');
    const descEl = document.getElementById('movieDetailsDescription');
    const castEl = document.getElementById('movieDetailsStarring');
    const directorEl = document.getElementById('movieDetailsDirector');
    
    if (!page || !header || !titleEl || !metaEl || !descEl || !castEl || !directorEl) {
        console.error('Missing required elements in the DOM');
        return;
    }
    
    try {
        // Set the background image with error handling
        header.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${poster})`;
        
        // Set the content
        titleEl.textContent = title || 'No Title';
        metaEl.innerHTML = `
            <span>${year || 'N/A'}</span>
            <span>${rating || 'N/A'}</span>
            <span>${duration || 'N/A'}</span>
        `;
        descEl.textContent = description || 'No description available';
        castEl.textContent = cast || 'N/A';
        directorEl.textContent = director || 'N/A';
        
        // Show the details page
        page.classList.add('active');
        
        // Store the Vimeo ID for the current movie
        if (vimeoId) {
            page.dataset.vimeoId = vimeoId;
        }
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error showing movie details:', error);
    }
}

// Make closeMovieDetails available globally
function closeMovieDetails() {
    const page = document.getElementById('movieDetailsPage');
    if (page) {
        page.classList.remove('active');
    }
}
