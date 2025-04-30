document.addEventListener("DOMContentLoaded", () => {
  fetch("../backend/product_api.php?newest&limit=4")
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("newest-books");
      container.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = "<p>No new products found.</p>";
        return;
      }

      products.forEach(p => {
        const ratingStars = p.rating
          ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})`
          : "No rating";

        container.innerHTML += `
          <div class="product">
            <h3>${p.product_name}</h3>
            <img src="../backend/productpictures/${p.image_url}" alt="${p.product_name}" />
            <p><strong>price:</strong> €${parseFloat(p.price).toFixed(2)}</p>
            <p><strong>rating:</strong> ${ratingStars}</p>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error("Error while loading newest products: ", err);
    });
});
