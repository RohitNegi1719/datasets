document.addEventListener('DOMContentLoaded', function() {
    // Fetch movie recommendations from Flask server
    function fetchRecommendations(movieTitle) {
        fetch('/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                movie_title: movieTitle
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                displayErrorMessage(data.message); // Display error message if present
            } else {
                displayMovieRecommendations(data); // Display movie recommendations
            }
        })
        .catch(error => console.error('Error fetching recommendations:', error));
    }

    // Function to display error message on the webpage
    function displayErrorMessage(message) {
        const movieContainer = document.getElementById('movieContainer');
        movieContainer.innerHTML = ''; // Clear previous results or messages

        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.classList.add('error-message'); // Add CSS class for styling
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.color = 'white';
        errorMessageDiv.style.fontSize = '3vh';

        movieContainer.appendChild(errorMessageDiv);
    }

    // Function to display movie recommendations on the webpage
    function displayMovieRecommendations(recommendations) {
        const movieContainer = document.getElementById('movieContainer');
        movieContainer.innerHTML = '';

        recommendations.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie-poster-container');

            const moviePoster = document.createElement('img');
            moviePoster.src = movie.Poster_Link;
            moviePoster.alt = movie.Title;
            moviePoster.width = 150;

            // Add click event listener to show movie details
            moviePoster.addEventListener('click', () => {
                showMovieDetails(movie);
            });

            movieDiv.appendChild(moviePoster);
            movieContainer.appendChild(movieDiv);
        });
    }

 // Function to display movie details when clicked on a movie poster
function showMovieDetails(movie) {
    const detailsContainer = document.querySelector('.details-container');
    const movieTitle = document.getElementById('movieTitle');
    const movieAbout = document.getElementById('movieAbout');

    movieTitle.textContent = movie.Title;
    movieAbout.textContent = movie.Plot_Story;
    detailsContainer.style.display = 'block';

    // Position movieDetails over the clicked image
    const moviePoster = event.target;
    const posterRect = moviePoster.getBoundingClientRect();
    const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Position movieDetails directly over the clicked image
    detailsContainer.style.top = `${posterRect.top + windowScrollTop}px`;
    detailsContainer.style.left = `${posterRect.left}px`;
}

// Close the movie details when the close button is clicked
document.getElementById('closeBtn').addEventListener('click', () => {
    document.querySelector('.details-container').style.display = 'none';
});



    // Close the movie details when the close button is clicked
    document.getElementById('closeBtn').addEventListener('click', () => {
        document.querySelector('.details-container').style.display = 'none';
    });

    // Fetch movie recommendations when search button is clicked
    document.getElementById('searchBtn').addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput').value.trim();
        if (searchInput !== '') {
            fetchRecommendations(searchInput);
        }
    });

 // Function to display movie suggestions on the webpage
function displaySuggestions(suggestions) {
    let suggestionsBox = document.getElementById('suggestionsBox');
    const searchInput = document.getElementById('searchInput');
    
    // If the suggestions box doesn't exist, create it
    if (!suggestionsBox) {
        const searchContainer = document.querySelector('.search-container'); // Ensure this matches your search input container's class
        if (!searchContainer) {
            console.error('Search container not found');
            return;
        }
        suggestionsBox = document.createElement('div');
        suggestionsBox.setAttribute('id', 'suggestionsBox');
        suggestionsBox.classList.add('suggestions-box'); // Add class for styling
        searchContainer.appendChild(suggestionsBox);
    }

    // Clear previous suggestions
    suggestionsBox.innerHTML = '';

    // Style the suggestions box to match the searchInput width and dynamically adjust height
    suggestionsBox.style.width = `${searchInput.offsetWidth}px`; // Set width to match searchInput
    suggestionsBox.style.maxHeight = '200px'; // Set a max height for the box
    //suggestionsBox.style.overflowY = 'auto'; // Allow scrolling within the box if content exceeds max height

    // Style the suggestions box for better visibility
    suggestionsBox.style.position = 'absolute';
    suggestionsBox.style.top = `${searchInput.offsetTop + searchInput.offsetHeight}px`; // Position below the searchInput
    suggestionsBox.style.left = `${searchInput.offsetLeft}px`; // Position horizontally aligned with searchInput
    suggestionsBox.style.backgroundColor = 'white'; // Ensure the background contrasts with text
    suggestionsBox.style.border = '1px solid #ccc'; // Light grey border
    suggestionsBox.style.zIndex = '1000'; // Ensure it's above other content

    // Only show up to 5 suggestions
    const maxSuggestions = Math.min(suggestions.length, 3);
    if (maxSuggestions > 0) {
        for (let i = 0; i < maxSuggestions; i++) {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item'); // Add class for styling
            suggestionItem.textContent = suggestions[i];
            suggestionItem.style.color = 'black'; // Ensure text is visible
            suggestionItem.style.padding = '10px'; // Add some padding for readability
            suggestionItem.addEventListener('click', () => {
                document.getElementById('searchInput').value = suggestions[i];
                suggestionsBox.innerHTML = ''; // Clear suggestions
                fetchRecommendations(suggestions[i]); // Fetch and display the recommendations
            }); 
            suggestionsBox.appendChild(suggestionItem);
        }
    } else {
        suggestionsBox.remove(); // Remove the suggestions box if there are no suggestions
    }
}



    // Adjust the event listener for input to also hide the suggestions box when input is empty
    document.getElementById('searchInput').addEventListener('input', () => {
        const partialTitle = document.getElementById('searchInput').value.trim();
        if (partialTitle !== '') {
            fetchSuggestions(partialTitle);
        } else {
            const suggestionsBox = document.getElementById('suggestionsBox');
            if (suggestionsBox) {
                suggestionsBox.innerHTML = ''; // Optionally remove the box
            }
        }
    });

    // Function to fetch movie suggestions from Flask server
    function fetchSuggestions(partialTitle) {
        fetch('/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                partial_title: partialTitle
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.suggestions) {
                displaySuggestions(data.suggestions); // Display movie suggestions
            } else {
                console.error('No suggestions found');
            }
        })
        .catch(error => console.error('Error fetching suggestions:', error));
    }
});
