const menu = document.querySelector(".menu");
const btnNav = document.querySelector(".nav-btn");

const basketIcon = document.querySelector(".basket-icon");
const basketModal = document.querySelector(".basket-modal");

const bookListEl = document.querySelector(".book-list");

let bookList = [],
  basketList = [];

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

// nav toggle
btnNav.addEventListener("click", () => {
  menu.classList.toggle("toggle");
});

// sepet acma ve kapamayi sagliyor
const toggleModal = () => {
  basketModal.classList.toggle("active");
};

const getBooks = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => (bookList = books));
};
getBooks();

const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += ` <i class="bi bi-star-fill active"></i>`;
    else starRateHtml += ` <i class="bi bi-star-fill"></i>`;
  }
  return starRateHtml;
};

const createBookItemsHtml = () => {
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `
        <div class="col-5  ${index % 2 == 0 && "offset-2"} my-5">
        <div class="row book-card ">
          <div class="col-6">
            <img
              class="img-fluid shadow"
              src="${book.imgSource}"
              alt="nutuk"
              width="258"
              height="400"
            />
          </div>
          <div class="col-6 d-flex flex-column justify-content-between">
            <div class="book-detail">
              <span class="fos grayy fs-5">${book.author}</span><br />
              <span class="fw-bold fs-4 ">${book.name}</span><br />
              <span class="book-icons">
                 ${createBookStars(book.starRate)}
              <span class="text-secondary">${book.reviewCount} reviews</span>
              </span><br>
            </div>
            <div>
              <p class="book-desc">
               ${book.description}
              </p>
          </div>
              <div>
                  <span class="fw-bold fs-5 mx-2"> ${book.price}&#8378; </span>
                  ${
                    book.oldPrice
                      ? `<span class="text-secondary text-decoration-line-through"> ${book.oldPrice}&#8378;</span>`
                      : ""
                  }
              </div>
                  <button class="btn-add" onclick="addBookToBasket(${
                    book.id
                  })">Add To Card</button>
              </div>
          </div>
        </div>`;
  });
  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "All",
  NOVEL: "Novel",
  CHILDREN: "Children",
  SELFIMPROVEMENT: " Self Improvment",
  HISTORY: "History",
  FINANS: "Finans",
  SCIENCE: "Science Fiction ",
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  console.log(filterEl);
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter == book.type) == -1)
      filterTypes.push(book.type);
  });
  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${index == 0 ? "active" : null}"
             onclick="filterBooks(this)" data-type="${type}">
            ${BOOK_TYPES[type] || type}</li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.type;
  getBooks();
  if (bookType != "ALL")
    bookList = bookList.filter((book) => book.type == bookType);

  createBookItemsHtml();
};

const listBasketItem = () => {
  localStorage.setItem("basketList", JSON.stringify(basketList));

  const basketListEl = document.querySelector(".basket-list");
  const basketCountEl = document.querySelector(".basket-count");
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;

  const totalPriceEl = document.querySelector(".total-price");

  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `
        <li class="basket-item my-3">
        <img src="${item.product.imgSource}" width="100" height="100" alt="">
        <div class="basket-info">
            <h6 class="fw-bold book-title ">${item.product.name}</h6>
            <span class="price">${item.product.price}&#8378</span><br><br>
            <span class="remove" onclick="removeItemToBasket(${item.product.id})" >Remove</span>
        </div>
        <div class="book-count">
            <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})" > - </span>
            <span class="fw-bold">${item.quantity}</span>
            <span class="increase" onclick="increaseItemToBasket(${item.product.id})"> + </span>
        </div>
    </li>
`;
  });
  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : ` <li class="basket-item my-3"><p> Your cart is empty :(</p> </li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Total :" + totalPrice.toFixed(2) + "&#8378" : null;
};

const addBookToBasket = (bookId) => {
  let foundBook = bookList.find((book) => book.id == bookId);
  if (foundBook) {
    const basketAllReadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );

    if (basketAllReadyIndex == -1) {
      let addedItem = { quantity: 1, product: foundBook };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketAllReadyIndex].quantity <
        basketList[basketAllReadyIndex].product.stock
      )
        basketList[basketAllReadyIndex].quantity += 1;
      else {
        toastr["error"]("Sorry, we don't have enough stock.");
        return;
      }
    }
  }
  listBasketItem();
  toastr["success"]("Product added successfully to the cart.");
};

const removeItemToBasket = (bookId) => {
  const foundIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (foundIndex != -1) {
    basketList.splice(foundIndex, 1);
  }
  listBasketItem();
  toastr.succsess("Product deleted from the cart.");
};

const decreaseItemToBasket = (bookId) => {
  const foundIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );

  if (foundIndex != -1) {
    if (basketList[foundIndex].quantity != 1)
      basketList[foundIndex].quantity -= 1;
    else removeItemToBasket(bookId);
  }
  listBasketItem();
};
const increaseItemToBasket = (bookId) => {
  const foundIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );

  if (foundIndex != -1) {
    if (basketList[foundIndex].quantity != basketList[foundIndex].product.stock)
      basketList[foundIndex].quantity += 1;
    else toastr["error"]("Sorry, we don't have enough stock.");
  }
  listBasketItem();
};

if (localStorage.getItem("basketList")) {
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItem();
}

setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);
