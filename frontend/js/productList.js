document.addEventListener("DOMContentLoaded", () => {
    fetch('../backend/getProducts.php')
      .then(res => res.json())
      .then(products => {
        const container = document.getElementById("product-list");
  
        products.forEach(p => {
          const ratingStars = p.rating
        ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})`
        : "Keine Bewertung";

          container.innerHTML += `
            <div class="product">
              <h3>${p.product_name}</h3>
              <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
<p><strong>Bewertung:</strong> ${p.rating ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})` : "Keine Bewertung"}</p>
              <p><strong>Kategorie:</strong> ${p.category_name ?? "Unkategorisiert"}</p>
            </div>
          `;
        });
        
      })
      .catch(err => {
        document.getElementById("product-list").innerHTML = "<p>Error loading products.</p>";
        console.error("Fetch error:", err);
      });
  });
  