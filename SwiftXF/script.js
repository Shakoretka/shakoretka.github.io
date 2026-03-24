fetch('productdata.json')
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById('product-container');

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      card.innerHTML = `
        <div class="product-video">
          <iframe src="${product.video}" allowfullscreen></iframe>
        </div>
        <div class="product-info">
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          <div class="product-links">
            ${product.links.unity ? `<a href="${product.links.unity}" target="_blank">Unity</a>` : ''}
            ${product.links.github ? `<a href="${product.links.github}" target="_blank">GitHub</a>` : ''}
            ${product.links.boosty ? `<a href="${product.links.boosty}" target="_blank">Boosty</a>` : ''}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  });