const modal = document.getElementById("modal");
const addBookBtn = document.getElementById("add-book-btn");
const closeBtn = document.getElementById("close-modal");
const submitForm = document.getElementById("submit-form");
const saveBookBtn = document.getElementById("add-book");
const bookTable = document.getElementById("book-table");
const tableBody = document.getElementById("table-body");

const API_BASE = "http://localhost:3000/api";

// Track editing state
let editingBookId = null;
let existingImageSrc = null;

//empty state
const emptyState = document.getElementById("empty-state");
function showEmptyState() {
  emptyState.style.display = "block";
  bookTable.style.display = "none";

}
// hide empty state
function hideEmptyState() {
  emptyState.style.display = "none";
  bookTable.style.display = "table";
}

//edit book function 

// Submit books
async function handleBookSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("name").value.trim();
  const descInput = document.getElementById("description").value.trim();
  const authorInput = document.getElementById("author").value.trim();
  const priceInput = document.getElementById("price").value.trim();
  const imageInput = document.getElementById("image");

  if (!nameInput || !descInput || !authorInput || !priceInput) {
    alert("Please fill in all fields");
    return;
  }

  let imageSrc = existingImageSrc;

  if (imageInput.files && imageInput.files[0]) {
    const uploadForm = new FormData();
    uploadForm.append("image", imageInput.files[0]);

    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadResponse.ok) {
      alert("Failed to upload image. Please try again.");
      return;
    }

    const uploadData = await uploadResponse.json();
    imageSrc = uploadData.imageUrl;
  }

  if (!imageSrc) {
    alert("Please add an image for the book.");
    return;
  }

  const bookData = {
    name: nameInput,
    description: descInput,
    author: authorInput,
    price: priceInput,
    imageSrc,
  };

  try {
    const isEditing = Boolean(editingBookId);
    const endpoint = isEditing ? `${API_BASE}/books/${editingBookId}` : `${API_BASE}/books`;
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      throw new Error("Something went wrong");
    }

    modal.style.display = "none";
    submitForm.reset();
    existingImageSrc = null;
    editingBookId = null; // Reset editing state
    saveBookBtn.textContent = "Add Book"; // Reset button text
    alert(isEditing ? "Book updated successfully" : "Book added successfully");
    loadBooks(); // Reload the books list
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
}

// load books
const loadBooks = async () => {
  try {
    const response = await fetch(`${API_BASE}/books`);
    if (!response.ok) {
      console.log("error in getting data");
      return;
    }

    const books = await response.json();
    displayBooks(books);
  } catch (error) {
    console.log(error);
    showEmptyState();
    hideEmptyState();

  }
};

const displayBooks = (books) => {
  tableBody.innerHTML = "";


  if (!books || books.length === 0) {
    showEmptyState();
    return;
  }


  books.forEach((book, index) => {
    const row = createHtmlRow(book, index);
    tableBody.appendChild(row)
  });
};

const createHtmlRow = (book, index) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><strong>${index + 1}</strong></td>
    <td><strong>${book.name}</strong></td>
    <td class='truncate'>${book.author}</td>
    <td class='truncate'>${book.description}</td>
    <td class='truncate'>
      <img class='table-image' src=${book.imageSrc} alt=${book.name} />
    </td>
    <td class='truncate'>${book.price}</td>
    <td>
      <div class='action-cell'>
        <button class='btn-action'>View</button>
        <button class='btn-action' onclick='editBook(${book.id})'>Edit</button>
        <button class='btn-action ' onclick='deleteBook(${book.id})'>Delete</button>
      </div>
    </td>
  `;

  return row
};

// Display modal
addBookBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  editingBookId = null;
  saveBookBtn.textContent = "Add Book";
});


// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  submitForm.reset();
  editingBookId = null;
  saveBookBtn.textContent = "Add Book";
});

// Handle form submission
submitForm.addEventListener("submit", handleBookSubmit);

document.addEventListener("DOMContentLoaded", loadBooks);

// delete book
async function deleteBook(id){
  if(!id){
    return console.log('missing bookId');
  }
  try {
    const response = await fetch(`${API_BASE}/books/${id}`,{
      method:'DELETE',
  }
  );
    if(!response.ok){
      console.log('error in deleting book');
}
else{
  alert('book deleted successfully');
  loadBooks();
}
  } catch (error) {
    console.log(error);
    alert('something went wrong in deleting book');
  }
  } 
  //edit book function
  
  async function editBook(id){
    if(!id){
      modal.style.display = "none";
      return console.log('missing bookId');
  }

  try {
    // Fetch the book data
    const response = await fetch(`${API_BASE}/books`);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    const books = await response.json();
    const book = books.find(b => b.id == id);

    if (!book) {
      alert('Book not found');
      return;
    }

    // Populate the form with book data
    document.getElementById("name").value = book.name;
    document.getElementById("description").value = book.description;
    document.getElementById("author").value = book.author;
    document.getElementById("price").value = book.price;
    document.getElementById("image").value = null;
    existingImageSrc = book.imageSrc;

    // Set editing state
    editingBookId = id;
    saveBookBtn.textContent = "Update Book";

    // Show modal
    modal.style.display = "flex";
  } catch (error) {
    console.log(error);
    alert('Error loading book for editing');
  }
  }