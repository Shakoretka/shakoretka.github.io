document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');

    const createLinksHTML = (links) => {
        let html = '';
        const generateBtn = (linkData, type) => {
            if (!linkData) return '';
            const label = linkData.label;
            if (linkData.available) {
                return `<a href="${linkData.url}" target="_blank" class="btn">${label}</a>`;
            } else {
                const hoverText = type === 'github' ? 'Private' : 'Pending';
                return `<span class="btn disabled" data-hover="${hoverText}">${label}</span>`;
            }
        };

        html += generateBtn(links.github, 'github');
        html += generateBtn(links.unity, 'unity');
        html += generateBtn(links.boosty, 'boosty');
        
        if (links.documentation && links.documentation.available) {
            html += `<a href="${links.documentation.url}" target="_blank" class="btn documentation">${links.documentation.label}</a>`;
        }
        return html;
    };

    fetch('productdata.json')
        .then(response => {
            if (!response.ok) throw new Error('Network error');
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
                
                // ИСПОЛЬЗУЕМ КЛАСС .product-video, КОТОРЫЙ ОПИСАН В CSS
                productElement.innerHTML = `
                    <div class="product-video"> 
                        <img src="${product.previewImg}" alt="${product.title}" class="product-preview-static">
                        <video loop muted playsinline webkit-playsinline class="product-preview-video" preload="metadata">
                            <source src="${product.previewVideo}" type="video/mp4">
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

                // Поиск элементов внутри созданного productElement
                const mediaContainer = productElement.querySelector('.product-video');
                const video = productElement.querySelector('.product-preview-video');

                mediaContainer.addEventListener('mouseenter', () => {
                    video.play().catch(e => console.warn("Autoplay blocked or failed", e));
                });

                mediaContainer.addEventListener('mouseleave', () => {
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