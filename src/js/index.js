import '../css/style.css';
import Notiflix from 'notiflix';
import axios from 'axios';

async function createRequest(value, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api?key=31776776-892f87ec0bcca7b792e7dfca0&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchForm.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', loadMore);

let searchValue = '';
let numberOfPage = 1;

function onSubmit(e) {
  e.preventDefault();

  gallery.innerHTML = '';
  loadMoreBtn.setAttribute('hidden', '');

  searchValue = e.target.searchQuery.value.trim();
  numberOfPage = 1;

  if (!searchValue) {
    Notiflix.Notify.warning(`Please fill in field`);
    return;
  }

  createRequest(searchValue, numberOfPage).then(onSuccess).catch(onError);
}

function onSuccess(data) {
  if (!data.total) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  } else if (numberOfPage === 1) {
    Notiflix.Notify.success(`Hooray! We found totalHits images ${data.total}`);
  }

  createMarkup(data.hits);

  let remainder = data.total - numberOfPage * 40;

  if (remainder > 0) {
    loadMoreBtn.removeAttribute('hidden');
  } else {
    loadMoreBtn.setAttribute('hidden', '');
    if (numberOfPage > 1) {
      Notiflix.Notify.warning(
        `We're sorry, but you've reached the end of search results.`
      );
    }
  }
}

function onError(error) {
  Notiflix.Notify.failure(error.message);
}

function createMarkup(arr) {
  let markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300"/>
  <div class="info">
    <p class="info-item">
      <b>Likes </b>${likes}
    </p>
    <p class="info-item">
      <b>Views </b>${views}
    </p>
    <p class="info-item">
      <b>Comments </b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads </b>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function loadMore() {
  numberOfPage += 1;
  createRequest(searchValue, numberOfPage).then(onSuccess).catch(onError);
}
