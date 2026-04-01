document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');

    // Функция для создания ссылок
        const createLinksHTML = (links) => {
            let html = '';
            
            const generateBtn = (linkData, type) => {
                if (!linkData) return '';
                
                const label = linkData.label;
                if (linkData.available) {
                    return `<a href="${linkData.url}" target="_blank" class="btn">${label}</a>`;
                } else {
                    // Определяем текст для наведения в зависимости от типа кнопки
                    const hoverText = type === 'github' ? 'Private' : 'Pending';
                    
                    // Добавляем data-hover и класс disabled
                    return `<span class="btn disabled" data-hover="${hoverText}">${label}</span>`;
                }
            };

            html += generateBtn(links.github, 'github');
            html += generateBtn(links.unity, 'unity');
            html += generateBtn(links.boosty, 'boosty');
            
            // Для документации оставляем логику с отступом вправо
            if (links.documentation && links.documentation.available) {
                html += `<a href="${links.documentation.url}" target="_blank" class="btn documentation">${links.documentation.label}</a>`;
            }

            return html;
        };
    };

    // Загрузка данных из JSON
    fetch('productdata.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network error while loading products');
            }
            return response.json();
        })
        .then(products => {
            if (products.length === 0) {
                productsContainer.innerHTML = '<p style="color: var(--text-secondary); font-family: var(--font-mono);">// Products in development...</p>';
                return;
            }

        products.forEach(product => {
            const productElement = document.createElement('article');
            productElement.className = 'product-card';
            
            // Формируем комбинированный медиа-контент
            // Видео по умолчанию не запускается (нет autoplay), чтобы не тратить трафик
            const mediaHTML = `
                <img src="${product.previewImg}" alt="${product.title}" class="product-preview-static">
                <video loop muted playsinline class="product-preview-video" preload="metadata">
                    <source src="${product.previewVideo}" type="video/mp4">
                    Video playback is not supported.
                </video>
            `;

            productElement.innerHTML = `
                <div class="product-media-container">
                    ${mediaHTML}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-links">
                        ${createLinksHTML(product.links)}
                    </div>
                </div>
            `;
            productsContainer.appendChild(productElement);

            // Добавляем JavaScript-контроль для запуска/остановки видео при наведении
            const mediaContainer = productElement.querySelector('.product-media-container');
            const video = productElement.querySelector('.product-preview-video');

            mediaContainer.addEventListener('mouseenter', () => {
                // Запускаем видео только когда курсор наведен
                video.play().catch(error => console.log("Video play failed:", error));
            });

            mediaContainer.addEventListener('mouseleave', () => {
                // Останавливаем и сбрасываем видео, когда курсор ушел
                video.pause();
                video.currentTime = 0; 
            });
        });
        })
        .catch(error => {
            console.error('Error:', error);
            productsContainer.innerHTML = '<p style="color: red; font-family: var(--font-mono);">// Failed to load product database.</p>';
        });
});