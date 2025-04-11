document.addEventListener("DOMContentLoaded", () => {
    fetch('../backend/logic/getProducts.php')
      .then(res => res.json())
      .then(products => {
        const container = document.getElementById("product-list");
        container.innerHTML = ""; // Clear existing content
  
        products.forEach(p => {
          const ratingStars = p.rating
        ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})`
        : "Keine Bewertung";

          container.innerHTML += `
            <div class="product">
              <h3>${p.name}</h3>
            <img src="${p.image}" alt="${p.name}" style="max-width:150px;">
            <p><strong>Beschreibung:</strong> ${p.description}</p>
            <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
            <p><strong>Bewertung:</strong> ${ratingStars}</p>
          </div>
          `;
        });
        
      })
      .catch(err => {
        document.getElementById("product-list").innerHTML = "<p>Error loading products.</p>";
        console.error("Fetch error:", err);
      });
  });
  