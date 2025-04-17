document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Produktliste wird geladen...");

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  loadProducts(); // Initiale Produktliste

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const search = searchInput.value.trim();
      console.log(" Suche nach:", search);
      loadProducts(search);
    });
  }
});

function loadProducts(search = "") {
  
  const url = new URL("../../backend/product_api.php", window.location.href);
  url.searchParams.set("products", "1"); // signalisiert Produktabfrage

  if (search) {
    url.searchParams.set("search", search);
  }

  fetch(url.toString())
    .then((res) => res.json())
    .then((products) => {
      const container = document.getElementById("product-list");
      container.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = "<p>Keine Produkte gefunden.</p>";
        return;
      }

      products.forEach((p) => {
        const ratingStars = p.rating
          ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})`
          : "Keine Bewertung";

        container.innerHTML += `
          <div class="product">
            <h3>${p.product_name}</h3>
            <img src="../../backend/productpictures/${p.image_url}" alt="${p.product_name}" style="max-width:150px;">
            <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
            <p><strong>Kategorie:</strong> ${p.category_name ?? "Unkategorisiert"}</p>
            <p><strong>Bewertung:</strong> ${ratingStars}</p>
            <p><strong>Beschreibung:</strong> ${p.description ?? "Keine Beschreibung vorhanden"}</p>
             <button class="button" onclick="addToCart(${p.id})">🛒 In den Warenkorb</button>
          </div>
        `;
      });
    })
    .catch((err) => {
      console.error("❌ Fehler beim Laden der Produkte:", err);
      document.getElementById("product-list").innerHTML =
        "<p>Fehler beim Laden der Produkte.</p>";
    });
}
