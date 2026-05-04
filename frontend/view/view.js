import { API_BASE } from "../../lib/index.js";
const bookName = document.getElementById('book-name')
const bookDesc = document.getElementById('book-des')
const author = document.getElementById('author')

const params = window.location.href.split('?')
const id = params[1]
console.log(id);


const loadBooks = async () => {

  try {
    const response = await fetch(`${API_BASE}/books/${id}`);
    if (!response.ok) {
      console.log("error in getting data");
      return;
    }

    const book = await response.json();
    bookName.innerText = book.name
    bookDesc.innerText = book.description
    author.innerText = book.author
    
  } catch (error) {
    console.log(error);
  }

  console.log('here');
  
};
document.addEventListener("DOMContentLoaded", loadBooks);
