import { API_BASE } from "../../lib/index.js";

const searchQuery = document.getElementById('search-query');
const resultsCount = document.getElementById('results-count');
const searchResults = document.getElementById('search-results');
const aiSuggestionsArea = document.getElementById('ai-suggestions-area');
const suggestedBooks = document.getElementById('suggested-books');
const signOutBtn = document.getElementById('signOutBtn');
const signInBtn = document.getElementById('signInBtn');
const profile = document.getElementById('profile');
const userBtn = document.querySelector('.user-btn');
const navLink = document.getElementById('navLink');

// Get search query from URL
const queryParams = new URLSearchParams(window.location.search);
const searchTerm = queryParams.get('q') || window.location.search.substring(1);

// Check user session
const checkUserSession = () => {
    const session = window.localStorage.getItem('userSession');
    if (session) {
        const user = JSON.parse(session);
        signInBtn.style.display = 'none';
        if (profile) {
            profile.innerHTML = `
                <div class="user-profile" onclick='displayUserBtn()'>${user.userName.charAt(0)}</div>
                <p class="user-name">${user.userName}</p>`;
        }
    } else {
        window.location.href = '/frontend/sign-in/sign-in.html';
    }
}

function displayUserBtn() {
    if (userBtn.style.display === 'none' || userBtn.style.display === '') {
        userBtn.style.display = 'flex';
    } else {
        userBtn.style.display = 'none';
    }
}

// Sign Out Functionality
signOutBtn.addEventListener('click', () => {
    window.localStorage.removeItem('userSession');
    window.location.href = '/frontend/sign-in/sign-in.html';
});

// Display navigation links
function displayNavLinks() {
    const navLinks = [
        { label: 'Home', link: '/' },
        { label: 'Dashboard', link: '/frontend/dashboard/dashboard.html' },
        { label: 'Books', link: '/frontend/books' },
        { label: 'Add books', link: '/books' }
    ];
    
    navLinks.forEach((link, i) => {
        const navLinkElement = document.createElement('li');
        const navLinkHref = document.createElement('a');
        navLinkHref.innerText = link.label;
        navLinkHref.href = link.link;
        navLinkElement.className = 'nav-link';
        navLinkElement.appendChild(navLinkHref);
        navLink.appendChild(navLinkElement);
    });
}

// Perform search
async function performSearch() {
    searchQuery.textContent = `Search results for: "${searchTerm}"`;
    
    if (!searchTerm || searchTerm.trim() === '') {
        resultsCount.textContent = 'Please enter a search term';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/search/${encodeURIComponent(searchTerm)}`);
        const books = await response.json();

        if (!books || books.length === 0) {
            resultsCount.textContent = 'No books found. Showing AI suggestions...';
            searchResults.innerHTML = '<div class="no-results">No matching books found</div>';
            await fetchAISuggestions();
        } else {
            resultsCount.textContent = `Found ${books.length} book(s)`;
            displaySearchResults(books);
            aiSuggestionsArea.style.display = 'none';
        }
    } catch (error) {
        console.error('Error searching books:', error);
        resultsCount.textContent = 'Error performing search';
        searchResults.innerHTML = '<div class="no-results">Error searching books. Please try again.</div>';
    }
}

// Display search results
function displaySearchResults(books) {
    searchResults.innerHTML = '';
    
    books.forEach((book) => {
        const bookElement = document.createElement('div');
        const bookCard = document.createElement('div');
        const bookImage = document.createElement('img');
        const bookName = document.createElement('h2');
        const bookAuthor = document.createElement('p');
        const bookDescription = document.createElement('p');
        const bookPrice = document.createElement('p');
        const bookSpan = document.createElement('span');
        const readBtn = document.createElement('button');

        bookImage.src = book.imageSrc;
        bookName.textContent = book.name;
        bookAuthor.textContent = `Author: ${book.author}`;
        bookDescription.textContent = book.description;
        bookPrice.textContent = 'Price: ';
        bookSpan.textContent = `$${book.price.toFixed(2)}`;
        readBtn.textContent = 'Read';
        readBtn.style.cssText = 'background-color: var(--accent-color); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px; font-weight: 600; transition: all 0.3s ease;';
        readBtn.onmouseover = () => readBtn.style.backgroundColor = 'var(--secondary-color)';
        readBtn.onmouseout = () => readBtn.style.backgroundColor = 'var(--accent-color)';

        bookElement.className = 'book-element';
        bookName.className = 'book-title';
        bookAuthor.className = 'book-author';
        bookDescription.className = 'book-desc';
        bookPrice.className = 'book-price';
        bookImage.className = 'bookImage';
        bookCard.className = 'book-card';
        bookSpan.className = 'book-span-price';

        bookElement.appendChild(bookImage);
        bookCard.appendChild(bookName);
        bookCard.appendChild(bookAuthor);
        bookCard.appendChild(bookDescription);
        bookCard.appendChild(bookPrice);
        bookPrice.appendChild(bookSpan);
        bookCard.appendChild(readBtn);
        bookElement.appendChild(bookCard);
        searchResults.appendChild(bookElement);

        // Navigate to book reader on click or button click
        bookElement.addEventListener('click', () => {
            window.location.href = `/frontend/reader/?${book.id}`;
        });
    });
}

// Fetch AI suggestions when no results found
async function fetchAISuggestions() {
    suggestedBooks.innerHTML = '<div class="loading"><span class="ai-loading-spinner">⏳</span> AI is finding similar books...</div>';
    aiSuggestionsArea.style.display = 'block';

    try {
        // Get all books and let AI find similar ones
        const response = await fetch(`${API_BASE}/books`);
        const allBooks = await response.json();

        // Use AI to find similar books based on description similarity
        const similarBooks = findSimilarBooks(searchTerm, allBooks);

        if (similarBooks.length === 0) {
            suggestedBooks.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-light);">No similar books available at this time.</p>';
            return;
        }

        suggestedBooks.innerHTML = '';
        displaySearchResults(similarBooks);
    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        suggestedBooks.innerHTML = '<p style="text-align: center; color: red;">Error fetching suggestions</p>';
    }
}

// Simple AI similarity algorithm (can be enhanced with actual ML/AI)
function findSimilarBooks(searchTerm, allBooks) {
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    
    const scoredBooks = allBooks.map(book => {
        let score = 0;
        const bookText = `${book.name} ${book.description} ${book.author}`.toLowerCase();
        
        searchWords.forEach(word => {
            if (word.length > 2) { // Ignore very short words
                const regex = new RegExp(`\\b${word}`, 'g');
                const matches = bookText.match(regex);
                score += matches ? matches.length * 10 : 0;
            }
        });

        // Bonus for partial matches
        searchWords.forEach(word => {
            if (bookText.includes(word)) {
                score += 5;
            }
        });

        return { book, score };
    });

    return scoredBooks
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4) // Return top 4 similar books
        .map(item => item.book);
}

// Initialize
checkUserSession();
displayNavLinks();
performSearch();
