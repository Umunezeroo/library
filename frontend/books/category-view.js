const bookContainer = document.getElementById('bookContainer');
const categoryTitle = document.getElementById('categoryTitle');
const categoryDesc = document.getElementById('categoryDesc');
const signOutBtn = document.getElementById('signOutBtn');
const signInBtn = document.getElementById('signInBtn');
const profile = document.getElementById('profile');
const userBtn = document.querySelector('.user-btn');

// Get category ID from URL
const categoryId = window.location.search.substring(1);

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

// Back to home
function goBack() {
    window.location.href = '/';
}

// Fetch and display category books
async function displayCategoryBooks() {
    if (!categoryId) {
        bookContainer.innerHTML = '<div class="no-books">Invalid category</div>';
        return;
    }

    try {
        // Fetch category details
        const categoryRes = await fetch(`http://localhost:3000/api/categories/${categoryId}`);
        const category = await categoryRes.json();

        if (!category) {
            bookContainer.innerHTML = '<div class="no-books">Category not found</div>';
            return;
        }

        categoryTitle.textContent = category.name;
        categoryDesc.textContent = category.description || '';

        // Fetch books in this category
        const booksRes = await fetch(`http://localhost:3000/api/categories/${categoryId}/books`);
        const books = await booksRes.json();

        if (!books || books.length === 0) {
            bookContainer.innerHTML = '<div class="no-books">No books available in this category</div>';
            return;
        }

        bookContainer.innerHTML = '';

        books.forEach((book) => {
            const bookElement = document.createElement('div');
            const bookCard = document.createElement('div');
            const bookImage = document.createElement('img');
            const bookName = document.createElement('h2');
            const bookAuthor = document.createElement('p');
            const bookDescription = document.createElement('p');
            const bookPrice = document.createElement('p');
            const bookSpan = document.createElement('span');

            bookImage.src = book.imageSrc;
            bookName.textContent = book.name;
            bookAuthor.textContent = `Author: ${book.author}`;
            bookDescription.textContent = book.description;
            bookPrice.textContent = 'Price: ';
            bookSpan.textContent = `$${book.price.toFixed(2)}`;

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
            bookElement.appendChild(bookCard);
            bookContainer.appendChild(bookElement);

            bookElement.addEventListener('click', () => {
                window.location.href = `/frontend/view/?${book.id}`;
            });
        });
    } catch (error) {
        console.error('Error loading category books:', error);
        bookContainer.innerHTML = '<div class="no-books">Error loading books. Please try again.</div>';
    }
}

// Initialize
checkUserSession();
displayCategoryBooks();
