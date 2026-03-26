document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');

    // Функция для создания ссылок
    const createLinksHTML = (links) => {
        let html = '';
        if (links.github && links.github !== '#') {
            html += `<a href="${links.github}" target="_blank" class="btn">GitHub</a>`;
        }
        if (links.unity && links.unity !== '#') {
            html += `<a href="${links.unity}" target="_blank" class="btn">Unity Asset Store</a>`;
        }
        if (links.boosty && links.boosty !== '#') {
            html += `<a href="${links.boosty}" target="_blank" class="btn">Boosty</a>`;
        }
        // Проверяем наличие документации
        if (links.documentation && links.documentation !== '#') {
            html += `<a href="${links.documentation}" target="_blank" class="btn documentation">Documentation</a>`;
        }
        return html;
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
                
                productElement.innerHTML = `
                    <div class="product-video">
                        <video autoplay loop muted playsinline>
                            <source src="${product.videoSrc}" type="video/mp4">
                            Video playback is not supported by your browser.
                        </video>
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
            });
        })
        .catch(error => {
            console.error('Error:', error);
            productsContainer.innerHTML = '<p style="color: red; font-family: var(--font-mono);">// Failed to load product database.</p>';
        });
});