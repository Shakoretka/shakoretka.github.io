const selectedTags = new Set();
let items = [];
let currentItem = null;
let currentImageIndex = 0;
let isExpanded = false; 

// Установи значение, равное количеству колонок в твоем CSS (например, 3)
const INITIAL_COUNT = 3; 

const grid = document.getElementById('grid');
const modalBg = document.getElementById('modal-bg');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalVideo = document.getElementById('modal-video');
const modalImage = document.getElementById('modal-image');
const showAllBtn = document.getElementById('show-all-btn');

// Загрузка данных
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        items = data;
        renderGrid();
    })
    .catch(err => console.error('Ошибка загрузки JSON:', err));

// Логика кнопки "Show All"
if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
        isExpanded = true;
        renderGrid();
    });
}

// Фильтрация по тегам
document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const val = tag.dataset.value;
        if (selectedTags.has(val)) {
            selectedTags.delete(val);
            tag.classList.remove('active');
        } else {
            selectedTags.add(val);
            tag.classList.add('active');
        }
        isExpanded = false; // Сбрасываем раскрытие при новой фильтрации
        renderGrid();
    });
});

// Очистка фильтров
document.getElementById('clear-btn').onclick = () => {
    selectedTags.clear();
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    isExpanded = false;
    renderGrid();
};

function renderGrid() {
    // 1. Фильтруем массив по выбранным тегам
    const filtered = selectedTags.size === 0 
        ? items 
        : items.filter(it => it.Tags.some(t => selectedTags.has(t)));

    // 2. Логика сокращения до одной строки
    const shouldShowButton = !isExpanded && filtered.length > INITIAL_COUNT;
    const itemsToRender = shouldShowButton ? filtered.slice(0, INITIAL_COUNT) : filtered;

    if (showAllBtn) {
        showAllBtn.style.display = shouldShowButton ? 'inline-block' : 'none';
    }

    // 3. Отрисовка карточек
    grid.innerHTML = itemsToRender.map((item) => {
        const isVideo = item.Preview.endsWith('.mp4');
        return `
            <div class="item" data-name="${item.Name}">
                ${isVideo 
                    ? `<video src="images/${item.Preview}" muted loop playsinline></video>` 
                    : `<img src="images/${item.Preview}">`
                }
                <div class="item-title">${item.Name}</div>
            </div>
        `;
    }).join('');

    // 4. События для карточек
    document.querySelectorAll('.item').forEach(el => {
        const itemName = el.dataset.name;
        const itemData = items.find(it => it.Name === itemName);
        const video = el.querySelector('video');
        
        if (video) {
            el.onmouseenter = () => video.play();
            el.onmouseleave = () => { 
                video.pause(); 
                video.currentTime = 0; 
            };
        }
        el.onclick = () => openModal(itemData);
    });
}

// Функции модального окна
function openModal(item) {
    if (!item) return;
    currentItem = item;
    currentImageIndex = 0;
    modalBg.style.display = 'flex';
    updateModal();
}

function updateModal() {
    const file = currentItem.Images[currentImageIndex];
    const isVideo = file.endsWith('.mp4') || file.endsWith('.webm');
    
    modalVideo.style.display = isVideo ? 'block' : 'none';
    modalImage.style.display = isVideo ? 'none' : 'block';

    if (isVideo) {
        modalVideo.src = `images/${file}`;
        modalVideo.play();
    } else {
        modalImage.src = `images/${file}`;
    }

    modalTitle.innerText = currentItem.Name;
    
    const linkedDesc = currentItem.Description.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" style="color: var(--accent-color); text-decoration: none;">$1</a>'
    );
    modalDesc.innerHTML = linkedDesc;
}

window.closeModal = () => {
    modalBg.style.display = 'none';
    modalVideo.pause();
    modalVideo.src = ""; 
};

window.nextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % currentItem.Images.length;
    updateModal();
};

window.prevImage = () => {
    currentImageIndex = (currentImageIndex - 1 + currentItem.Images.length) % currentItem.Images.length;
    updateModal();
};

modalBg.onclick = (e) => { 
    if (e.target === modalBg) closeModal(); 
};