
const bookContainer = document.getElementById('book-container');
const navLink = document.getElementById('navLink');
const bookCard = document.getElementsByClassName('book-card')
const profile = document.getElementById('profile')
const userIcon = document.getElementById('user-icon')
const signInBtn = document.getElementById('signInBtn')
const signOutBtn = document.getElementById('signOutBtn')
const userBtn = document.querySelector('.user-btn');
const searchInput = document.getElementById('search-input');
const categoryContainer = document.querySelector('.category');

searchInput.addEventListener('keydown', async (e) => {

    
    if (e.key === 'Enter') {
e.preventDefault();
        const searchValue = searchInput.value;

        window.location.href = `/frontend/search/?${searchValue}`


    }
});

// Sign Out Functionality
signOutBtn.addEventListener('click', () => {
    window.localStorage.removeItem('userSession');
    window.location.href = '/frontend/sign-in/sign-in.html';
});



const navLinks = [
    {
        label: 'Home',
        active: true,
        link: '/'

    },
    {
        label: 'Dashboard',
        active: false,
        link: '/frontend/dashboard/dashboard.html'

    },
    {
        label: 'Books',
        active: false,
        link: '/frontend/books'

    },
    {
        label: 'Add books',
        active: false,
        link: '/books'

    }
]


const checkUserSession = () => {
    const session = window.localStorage.getItem('userSession');
    if (session) {
        const user = JSON.parse(session);
        console.log(user);
        signInBtn.style.display = 'none';

        if (profile) {
            profile.innerHTML = ` 
            <div class="user-profile"onClick='displayUserBtn()'>${user.userName.charAt(0)}</div>
         <p class="user-name">${user.userName}</p>`;
        }
    }
    else {
        window.location.href = '/frontend/sign-in/sign-in.html';
    }
}

function displayUserBtn() {
    // userBtn.style.display = userBtn.style.display === 'block' ? 'none' : 'block';

    if (userBtn.style.display === 'none') {
        userBtn.style.display = 'flex';
    }
    else {
        userBtn.style.display = 'none';
    }
}
checkUserSession();
let clickedCard = null

const currentPath = window.location.pathname


signInBtn.addEventListener('click', () => {
    window.location.href = '/frontend/sign-in/sign-in.html'

})

async function displayBooks() {
    const response = await fetch('http://localhost:3000/api/books');
    const books = await response.json();
    books.map((book) => {

        const bookElement = document.createElement('div');
        const bookCard = document.createElement('div');

        const bookImage = document.createElement('img');
        const bookName = document.createElement('h2');
        const bookAuthor = document.createElement('p');
        const bookDescription = document.createElement('p');
        const bookPrice = document.createElement('p');
        const bookSpan = document.createElement('span')

        bookImage.src = book.imageSrc;
        bookName.textContent = book.name;
        bookAuthor.textContent = `Author: ${book.author}`;
        bookDescription.textContent = book.description;
        bookPrice.textContent = `Price: `;
        bookSpan.textContent = `$${book.price.toFixed(2)}`;

        bookElement.className = 'book-element';
        bookName.className = 'book-title';
        bookAuthor.className = 'book-author';
        bookDescription.className = 'book-desc';
        bookPrice.className = 'book-price';
        bookImage.className = 'bookImage'
        bookCard.className = 'book-card';
        bookSpan.className = 'book-span-price'

        bookElement.appendChild(bookImage);
        bookCard.appendChild(bookName);
        bookCard.appendChild(bookAuthor);
        bookCard.appendChild(bookDescription);
        bookCard.appendChild(bookPrice);
        bookPrice.appendChild(bookSpan)
        bookElement.appendChild(bookCard);
        bookContainer.appendChild(bookElement);
        bookElement.addEventListener('click', (e) => {
            viewBook(book.id)

        })

    })
}

function viewBook(bookId) {
    if (!bookId) {
        return console.log('missing id');

    }
    window.location.href = `/frontend/view/?${bookId}`
}

function displayNavLinks() {
    navLinks.map((link, i) => {
        const navLinkElement = document.createElement('li');
        const navLinkHref = document.createElement('a')

        navLinkHref.innerText = `${link.label}`
        navLinkHref.href = `${link.link}`
        navLinkElement.className = 'nav-link'
        navLinkElement.appendChild(navLinkHref)
        navLink.appendChild(navLinkElement)

    })
}

displayBooks()

displayNavLinks()

async function displayCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories');
        const categories = await response.json();
        
        // Clear existing category content
        categoryContainer.innerHTML = '';
        
        if (categories.length === 0) {
            categoryContainer.innerHTML = '<p style="text-align: center; width: 100%;">No categories available</p>';
            return;
        }
        
        categories.forEach((category) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.style.cursor = 'pointer';
            categoryItem.style.textAlign = 'center';
            categoryItem.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder">
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                </svg>
                <p style="margin: 5px 0 0 0; font-size: 14px;">${category.name}</p>
            `;
            
            categoryItem.addEventListener('click', () => {
                window.location.href = `/frontend/books/category-view.html?${category.id}`;
            });
            
            categoryContainer.appendChild(categoryItem);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

displayCategories();
window.displayUserBtn = displayUserBtn;