const searcText=document.querySelector('.searchText');
const booksContainer=document.getElementById('book-container');
document.addEventListener('DOMContentLoaded', () => {
const params = window.location.href.split('?');
console.log(params[1]);
if(searcValue){
    searcText.innerHTML=searcValue;
       
}
const response=await fetch(`${API_BASE}/search/${params[1]}`);
if(response.ok){
    const data=await response.json();
    const bookCard = document.createElement('div');
    const bookCover=document.createElement('img');
    const bookDescWrapper=document.createElement('div');
    const bookTitle=document.createElement('h3');
    const bookAuthor=document.createElement('p');
    const bookPrice=document.createElement('p');

    bookCover.src=data.coverImageSrc;
    bookCover.alt=data.name;
    bookName.innerHTML=data.name;
    bookAuthor.innerHTML=data.author;
    bookPrice.innerHTML=data.price; 
    bookDescription.innerHTML=data.description;


    bookName.className='book-title';
    bookAuthor.className='book-author';
    bookPrice.className='book-price';
    bookCard.className='book-card';
    bookCover.className='book-cover';
    bookDescWrapper.className='book-desc-wrapper';

    bookDescWrapper.appendChild(bookName);
    bookDescWrapper.appendChild(bookAuthor);
    bookDescWrapper.appendChild(bookPrice);
    bookDescWrapper.appendChild(bookDescription);
    bookCard.appendChild(bookCover);
    bookCard.appendChild(bookDescWrapper);
   
}

});