
const bookContainer = document.getElementById('book-container');
const navLink = document.getElementById('navLink');
const bookCard = document.getElementsByClassName('book-card')
const profile = document.getElementById('profile')
const userIcon = document.getElementById('user-icon')
const signInBtn = document.getElementById('signInBtn')
const logOutBtn = document.getElementById('logOutBtn')
const userBtn = document.querySelector('.user-btn');
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('keydown', async (e) => {

    
    if (e.key === 'Enter') {
e.preventDefault();
        const searchValue = searchInput.value;

        window.location.href = `/frontend/search/?${searchValue}`


    }
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
// bookCard.addEventListener('click',viewBook(book.id))