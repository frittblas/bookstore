import '../scss/style.scss';

import * as bootstrap from 'bootstrap';
import { getJSON } from './utils/getJSON';

let books,
  chosenCategoryFilter = 'all',
  chosenSortOption,
  categories = [];

let myShoppingCartModal;

async function start() {
  books = await getJSON('/json/books.json');
  myShoppingCartModal = new bootstrap.Modal(document.getElementById('myCart'));
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
  document.querySelector('.sortingOptions').innerHTML = `
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
  document.querySelector('.filters').innerHTML = `
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
  }) => `
    <div class="book">
      <h3>${title}</h3>
      <h5>${author_firstName} ${author_lastName}</h5>
      <p><span>id</span>${id}</p>
      <p><span>category</span>${category}</p>
      <p><span>price</span>${price}</p>
      <p><span>image</span>${image}</p>
      <p><span>description</span>${description}</p>
    </div>
  `);
  document.querySelector('.bookList').innerHTML = htmlArray.join('');
  document.querySelector('.cartData').innerHTML = htmlArray.join('');
}

start();