import '../scss/style.scss';

import * as bootstrap from 'bootstrap';
import { getJSON } from './utils/getJSON';

let books,
  chosenCategoryFilter = 'all',
  chosenSortOption,
  categories = [];

let booksInCart = [];

let justOpenCart = true; // is the cart opened from a book view or navbar
let mousePos = { x: undefined, y: undefined };

async function start() {
  books = await getJSON('/json/books.json');

  // for some reason I could'nt
  window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
  });

  getCategories();
  addFilters();
  addSortingOptions();
  sortByLastName(books);
  displayBooks();

}

function sortByLastName(books) {
  books.sort(({ author_lastName: aLastName }, { author_lastName: bLastName }) =>
    aLastName > bLastName ? 1 : -1);
}

function sortByPrice(books) {
  books.sort(({ price: aAge }, { price: bAge }) =>
    aAge > bAge ? 1 : -1);
}

function addSortingOptions() {
  // create and display html
  document.querySelector('.sortingOptions').innerHTML = /*html*/`
    <label><span>Sort by:</span>
      <select class="sortOption">
        <option>Last name</option>
        <option>Price</option>
      </select>
    </label>
  `;
  // add an event listener
  document.querySelector('.sortOption').addEventListener('change', event => {
    chosenSortOption = event.target.value;
    displayBooks();
  });
}

function getCategories() {
  // create an array of all categories that books have
  let withDuplicates = books.map(book => book.category);
  // remove duplicates by creating a set
  // that we then spread into an array to cast it to an array
  categories = [...new Set(withDuplicates)];
  // sort the categories
  categories.sort();
}

function addFilters() {
  // create and display html
  document.querySelector('.filters').innerHTML = /*html*/`
    <label><span>Filter by Category:</span>
      <select class="categoryFilter">
        <option>all</option>
        ${categories.map(category => `<option>${category}</option>`).join('')}
      </select>
    </label>
  `;
  // add an event listener
  document.querySelector('.categoryFilter').addEventListener(
    'change',
    event => {
      // get the selected category
      chosenCategoryFilter = event.target.value;
      displayBooks();
    }
  );
}

function addBookToCart(title) {

  if (!justOpenCart) {

    let b;

    // find the correct book based on the title
    for (b of books) {
      if (b.title == title)
        break;
    }


    booksInCart.push(b);

  }

  // calculate total price
  let totalPrice = 0;
  for (let c of booksInCart) {
    totalPrice += c.price;
  }

  // create a new array with no duplicates and a count variable for each object
  const outputArray = Object.values(booksInCart.reduce((acc, obj) => {
    const key = JSON.stringify(obj);
    if (!acc[key]) {
      acc[key] = { ...obj, count: 1 };
    } else {
      acc[key].count++;
    }
    return acc;
  }, {}));

  document.querySelector('.cartData').innerHTML = "";
  let htmlDetails = "";

  for (let c of outputArray) {

    htmlDetails += /*html*/`
  <hr>
  <div>
    <span><p>${c.title} (amount:  ${c.count}) = ${(c.price * c.count).toFixed(2)} SEK</p></span>
  </div>

  `;

  }

  document.querySelector('.cartData').innerHTML += htmlDetails;

  document.querySelector('.cartData').innerHTML += /*html*/`
    <hr>
    <div>
    <span><p>Total cost: ${totalPrice} SEK</p></span>
  </div>
  
  `;

}

function showDetailedView(title) {

  let b;

  // find the correct book based on the title
  for (b of books) {
    if (b.title == title)
      break;
  }

  let htmlDetails = /*html*/`

<div class="book">
  <div class="book-info">
    <h3>${b.title}</h3>
    <h5><I>By ${b.author_firstName} ${b.author_lastName}</I></h5>
    <p></p>
    <p><span>category: </span>${b.category}
    <span>price: </span>${b.price} SEK</p>
    <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#bookInfo">Close</button>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myCart">Add to Cart</button>
  </div>
  <div class="book-image">
    <img src="${b.image}" alt="Book image" width="170" height="250">
  </div>

</div>

<div class="descr">
<p><span>Description: </span></p>${b.description}
</div>

  `;

  document.querySelector('.infoData').innerHTML = htmlDetails;

}

function displayBooks() {
  // filter according to category and call displaBooks
  let filteredBooks = books.filter(
    ({ category }) => chosenCategoryFilter === 'all'
      || chosenCategoryFilter === category
  );
  if (chosenSortOption === 'Last name') { sortByLastName(filteredBooks); }
  if (chosenSortOption === 'Price') { sortByPrice(filteredBooks); }
  let htmlArray = filteredBooks.map(({
    id, title, category, author_firstName, author_lastName, price, image, description
  }) => /*html*/`

<div class="book">
  <div class="book-info">
    <h3>${title}</h3>
    <h5><I>By ${author_firstName} ${author_lastName}</I></h5>
    <p></p>
    <p><span>category</span>${category}
    <span>price</span>${price} SEK</p>
    <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#bookInfo">Info</button>
    <button type="button" id="crtbtn" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myCart">Add to Cart</button>
  </div>
  <div class="book-image">
    <img src="${image}" alt="Book image" width="170" height="250">
  </div>
</div>

  `);

  document.querySelector('.bookList').innerHTML = htmlArray.join('');

  // add event listener when info modal is shown
  document.querySelector('#bookInfo').addEventListener('show.bs.modal', event => {
    // console.log(event.relatedTarget.parentNode.firstElementChild.innerText);
    let title = event.relatedTarget.parentNode.firstElementChild.innerText; // find the title in the book-info div (h3)
    showDetailedView(title);
  });

  // add event listener when shopping cart modal is shown
  document.querySelector('#myCart').addEventListener('show.bs.modal', event => {
    // console.log(event.relatedTarget.parentNode.firstElementChild.innerText);
    let title = event.relatedTarget.parentNode.firstElementChild.innerText; // find the title in the book-info div (h3)
    //justOpenCart = lastClickY < 100 ? true : false;
    justOpenCart = mousePos.y < 100 ? true : false;
    addBookToCart(title);
  });

}


start();