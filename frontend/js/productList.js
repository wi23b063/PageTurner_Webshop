document.addEventListener("DOMContentLoaded", () => {
    fetch('../backend/getProducts.php')
      .then(res => res.json())
      .then(products => {
        const container = document.getElementById("product-list");
  
        products.forEach(p => {
          const ratingStars = p.rating
            ? "⭐".repeat(Math.floor(p.rating)) + ` (${p.rating})`
            : "No rating";
  
          container.innerHTML += `
            <div class="product">
              <h2>${p.product_name} <small>(${p.category_name ?? "Uncategorized"})</small></h2>
              <img src="../img/${p.image_url}" alt="${p.product_name}" />
              <p><strong>Price:</strong> €${parseFloat(p.price).toFixed(2)}</p>
              <p><strong>Rating:</strong> ${ratingStars}</p>
            </div>
          `;
        });
      })
      .catch(err => {
        document.getElementById("product-list").innerHTML = "<p>Error loading products.</p>";
        console.error("Fetch error:", err);
      });
  });
  