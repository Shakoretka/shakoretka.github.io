const selectedTags = new Set();
let items = [];
let currentItem = null;
let currentImageIndex = 0;

const grid = document.getElementById('grid');
const modalBg = document.getElementById('modal-bg');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const clearBtn = document.getElementById('clear-btn');

// Элементы для медиа
const modalImage = document.getElementById("modal-image");
const modalVideo = document.getElementById("modal-video");

// ЗАГРУЗКА JSON
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    items = data;
    renderGrid();
  })
  .catch(err => console.error('Ошибка загрузки JSON:', err));


// ОБРАБОТКА ТЕГОВ
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', () => {
    const value = tag.dataset.value;

    if (selectedTags.has(value)) {
      selectedTags.delete(value);
      tag.classList.remove('active');
    } else {
      selectedTags.add(value);
      tag.classList.add('active');
    }

    renderGrid();
  });
});


// Кнопка очистки тегов
clearBtn.addEventListener('click', () => {
  selectedTags.clear();

  document.querySelectorAll('.tag.active')
    .forEach(tag => tag.classList.remove('active'));

  renderGrid();
});


// ОТРИСОВКА СЕТКИ
function renderGrid() {
  const filtered = selectedTags.size === 0
    ? items
    : items.filter(item => item.Tags.some(tag => selectedTags.has(tag)));

  grid.innerHTML = filtered.map((item, i) => {
    const previewFile = item.Preview || item.Images[0];
    const ext = previewFile.split('.').pop().toLowerCase();
    const previewPath = `images/${previewFile}`;

    let mediaHtml = '';
    if (["mp4", "webm"].includes(ext)) {
      mediaHtml = `<video src="${previewPath}" autoplay muted loop playsinline></video>`;
    } else {
      mediaHtml = `<img src="${previewPath}" alt="${item.Name}">`;
    }

    return `
      <div class="item" data-index="${i}">
        ${mediaHtml}
        <div class="item-title">${item.Name}</div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.item').forEach((el, i) => {
    el.onclick = () => openModal(filtered[i]);
  });
}


// ОТКРЫТЬ МОДАЛКУ
function openModal(item) {
  currentItem = item;
  currentImageIndex = 0;
  modalBg.style.display = "flex";
  updateModalContent();
}


// ОБНОВИТЬ МЕДИА (image / video)
function updateModalContent() {
  if (!currentItem) return;

  const file = currentItem.Images[currentImageIndex];
  const ext = file.split('.').pop().toLowerCase();
  const path = `images/${file}`;

  const isVideo = ["webm", "mp4"].includes(ext);

  if (isVideo) {
    modalImage.style.display = "none";
    modalVideo.style.display = "block";
    modalVideo.src = path;
  } else {
    modalVideo.style.display = "none";
    modalImage.style.display = "block";
    modalImage.src = path;
  }

  modalTitle.textContent = currentItem.Name;
  modalDesc.textContent = currentItem.Description;
}


// СЛЕДУЮЩЕЕ МЕДИА
function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % currentItem.Images.length;
  updateModalContent();
}


// ПРЕДЫДУЩЕЕ МЕДИА
function prevImage() {
  currentImageIndex =
    (currentImageIndex - 1 + currentItem.Images.length) % currentItem.Images.length;
  updateModalContent();
}


// ЗАКРЫТЬ МОДАЛКУ
function closeModal() {
  modalBg.style.display = "none";
  modalVideo.pause();
  modalVideo.src = ""; 
}


// КЛИК ПО ФОНУ → ЗАКРЫТЬ
modalBg.addEventListener('click', e => {
  if (e.target === modalBg) closeModal();
});