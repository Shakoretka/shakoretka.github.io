const selectedTags = new Set();
let items = [];
let currentItem = null;
let currentImageIndex = 0;
let isExpanded = false; 
const INITIAL_COUNT = 3;

const grid = document.getElementById('grid');
const modalBg = document.getElementById('modal-bg');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalVideo = document.getElementById('modal-video');
const modalImage = document.getElementById('modal-image');
const showAllBtn = document.getElementById('show-all-btn');

fetch("data.json")
    .then(res => res.json())
    .then(data => {
        items = data;
        renderGrid();
    });

if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
        isExpanded = true;
        renderGrid();
    });
}

document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const val = tag.dataset.value;
        selectedTags.has(val) ? selectedTags.delete(val) : selectedTags.add(val);
        tag.classList.toggle('active');
        isExpanded = false; 
        renderGrid();
    });
});

document.getElementById('clear-btn').onclick = () => {
    selectedTags.clear();
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    isExpanded = false;
    renderGrid();
};

function renderGrid() {
    const filtered = selectedTags.size === 0 
        ? items 
        : items.filter(it => it.Tags.some(t => selectedTags.has(t)));

    const shouldShowButton = !isExpanded && filtered.length > INITIAL_COUNT;
    const itemsToRender = shouldShowButton ? filtered.slice(0, INITIAL_COUNT) : filtered;

    if (showAllBtn) {
        showAllBtn.style.display = shouldShowButton ? 'inline-block' : 'none';
    }

    grid.innerHTML = itemsToRender.map((item) => {
        // Ищем ПЕРВОЕ видео в массиве Images для ховера
        const hoverVideo = item.Images.find(file => file.endsWith('.mp4') || file.endsWith('.webm'));
        const previewIsVideo = item.Preview.endsWith('.mp4');

        return `
            <div class="item" data-name="${encodeURIComponent(item.Name)}">
                <div class="media-container">
                    ${previewIsVideo 
                        ? `<video class="preview-media" src="images/${item.Preview}" muted loop playsinline></video>` 
                        : `<img class="preview-media" src="images/${item.Preview}">`
                    }
                    
                    ${(!previewIsVideo && hoverVideo) 
                        ? `<video class="hover-video" src="images/${hoverVideo}" muted loop playsinline style="display:none;"></video>` 
                        : ''
                    }
                </div>
                <div class="item-title">${item.Name}</div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.item').forEach(el => {
        const itemName = decodeURIComponent(el.dataset.name);
        const itemData = items.find(it => it.Name === itemName);
        
        // Логика ховера
        const mainVideo = el.querySelector('video.preview-media');
        const hoverVideo = el.querySelector('video.hover-video');
        const previewImg = el.querySelector('img.preview-media');

        el.onmouseenter = () => {
            if (mainVideo) {
                mainVideo.play();
            } else if (hoverVideo && previewImg) {
                previewImg.style.display = 'none';
                hoverVideo.style.display = 'block';
                hoverVideo.play();
            }
        };

        el.onmouseleave = () => {
            if (mainVideo) {
                mainVideo.pause();
                mainVideo.currentTime = 0;
            } else if (hoverVideo && previewImg) {
                hoverVideo.pause();
                hoverVideo.currentTime = 0;
                hoverVideo.style.display = 'none';
                previewImg.style.display = 'block';
            }
        };

        el.onclick = () => openModal(itemData);
    });
}

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

modalBg.onclick = (e) => { if (e.target === modalBg) closeModal(); };