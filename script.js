const selectedTags = new Set();
let items = [];
let currentItem = null;
let currentImageIndex = 0;

const grid = document.getElementById('grid');
const modalBg = document.getElementById('modal-bg');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalVideo = document.getElementById('modal-video');
const modalImage = document.getElementById('modal-image');

// Загрузка
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        items = data;
        renderGrid();
    });

// Фильтрация
document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const val = tag.dataset.value;
        selectedTags.has(val) ? selectedTags.delete(val) : selectedTags.add(val);
        tag.classList.toggle('active');
        renderGrid();
    });
});

document.getElementById('clear-btn').onclick = () => {
    selectedTags.clear();
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    renderGrid();
};

function renderGrid() {
    const filtered = selectedTags.size === 0 
        ? items 
        : items.filter(it => it.Tags.some(t => selectedTags.has(t)));

    grid.innerHTML = filtered.map((item, i) => {
        const isVideo = item.Preview.endsWith('.mp4');
        return `
            <div class="item" data-index="${i}">
                ${isVideo 
                    ? `<video src="images/${item.Preview}" muted loop playsinline></video>` 
                    : `<img src="images/${item.Preview}">`
                }
                <div class="item-title">${item.Name}</div>
            </div>
        `;
    }).join('');

    // Контроль видео при наведении
    document.querySelectorAll('.item').forEach(el => {
        const video = el.querySelector('video');
        if (video) {
            el.onmouseenter = () => video.play();
            el.onmouseleave = () => { video.pause(); video.currentTime = 0; };
        }
        el.onclick = () => openModal(filtered[el.dataset.index]);
    });
}

function openModal(item) {
    currentItem = item;
    currentImageIndex = 0;
    modalBg.style.display = 'flex';
    updateModal();
}

function updateModal() {
    const file = currentItem.Images[currentImageIndex];
    const isVideo = file.endsWith('.mp4');
    
    modalVideo.style.display = isVideo ? 'block' : 'none';
    modalImage.style.display = isVideo ? 'none' : 'block';

    if (isVideo) {
        modalVideo.src = `images/${file}`;
        modalVideo.play();
    } else {
        modalImage.src = `images/${file}`;
    }

    modalTitle.innerText = currentItem.Name;
    
    // Превращаем ссылки в тексте в кликабельные элементы
    const linkedDesc = currentItem.Description.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" style="color: var(--accent-color)">$1</a>'
    );
    modalDesc.innerHTML = linkedDesc;
}

window.closeModal = () => {
    modalBg.style.display = 'none';
    modalVideo.pause();
};

window.nextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % currentItem.Images.length;
    updateModal();
};

window.prevImage = () => {
    currentImageIndex = (currentImageIndex - 1 + currentItem.Images.length) % currentItem.Images.length;
    updateModal();
};

modalBg.onclick = (e) => { if(e.target === modalBg) closeModal(); };