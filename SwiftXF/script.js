document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');

    // --- ФУНКЦИЯ ГЕНЕРАЦИИ КНОПОК ---
    const createLinksHTML = (links) => {
        let html = '';
        
        const generateBtn = (linkData, type) => {
            if (!linkData) return '';
            
            const label = linkData.label || type.toUpperCase();
            
            if (linkData.available) {
                return `<a href="${linkData.url}" target="_blank" class="btn">${label}</a>`;
            } else {
                // Текст для наведения (data-hover) для неактивных кнопок
                const hoverText = type === 'github' ? 'Private' : 'Pending';
                return `<span class="btn disabled" data-hover="${hoverText}">${label}</span>`;
            }
        };

        // Порядок кнопок в карточке
        html += generateBtn(links.github, 'github');
        html += generateBtn(links.unity, 'unity');
        html += generateBtn(links.boosty, 'boosty');
        
        // Документация (в CSS прижат вправо через margin-left: auto)
        if (links.documentation && links.documentation.available) {
            html += `<a href="${links.documentation.url}" target="_blank" class="btn documentation">${links.documentation.label || 'Documentation'}</a>`;
        }

        return html;
    };

    // --- ЗАГРУЗКА ДАННЫХ ИЗ JSON ---
    fetch('productdata.json')
        .then(response => {
            if (!response.ok) throw new Error('Network error while loading products');
            return response.json();
        })
        .then(products => {
            if (products.length === 0) {
                productsContainer.innerHTML = '<p style="color: var(--text-secondary); font-family: var(--font-mono); text-align: center;">// Products in development...</p>';
                return;
            }

            products.forEach(product => {
                const productElement = document.createElement('article');
                productElement.className = 'product-card';
                
                // Формируем медиа-контент (Статика + Видео поверх)
                // Атрибуты playsinline и muted критичны для работы на смартфонах
                const mediaHTML = `
                    <div class="product-video"> 
                        <img src="${product.previewImg}" alt="${product.title}" class="product-preview-static" loading="lazy">
                        <video loop muted playsinline webkit-playsinline class="product-preview-video" preload="metadata">
                            <source src="${product.previewVideo}" type="video/mp4">
                            Video playback is not supported.
                        </video>
                    </div>
                `;

                productElement.innerHTML = `
                    ${mediaHTML}
                    <div class="product-info">
                        <div class="product-header-row">
                            <h3 class="product-title">${product.title}</h3>
                            <img src="images/UnityLogo.svg" alt="Unity" class="engine-logo" title="Developed for Unity">
                        </div>
                        <p class="product-desc">${product.description}</p>
                        <div class="product-links">
                            ${createLinksHTML(product.links)}
                        </div>
                    </div>
                `;

                productsContainer.appendChild(productElement);

                // --- ЛОГИКА ВОСПРОИЗВЕДЕНИЯ ПРИ НАВЕДЕНИИ НА КАРТОЧКУ ---
                const video = productElement.querySelector('.product-preview-video');

                // Теперь слушаем наведение на ВСЮ карточку (productElement)
                productElement.addEventListener('mouseenter', () => {
                    video.play().catch(error => {
                        console.warn("Playback prevented by browser policy:", error);
                    });
                });

                productElement.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0; // Сбрасываем видео на начало при уходе мыши
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            productsContainer.innerHTML = '<p style="color: var(--accent-color); font-family: var(--font-mono); text-align: center;">// Failed to load product database.</p>';
        });
});