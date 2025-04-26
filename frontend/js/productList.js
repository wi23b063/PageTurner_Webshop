document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Produktliste wird geladen...");

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.value = ""; // <-- clear the search input on page load!
    searchInput.addEventListener("input", () => {
      const search = searchInput.value.trim();
      console.log("Live-Suche nach:", search);
      loadProducts(search);
    });
  }
});


function loadProducts(search = "") {
  console.log("Lade Produkte... Suchbegriff:", search);

  const url = new URL("../backend/product_api.php", window.location.href);
  url.searchParams.set("products", "1"); // signalisiert Produktabfrage

  if (search) {
    url.searchParams.set("search", search);
  }

  console.log("Fetch URL:", url.toString()); // Debug Ausgabe

  fetch(url.toString())
    .then((res) => res.json())
    .then((products) => {
      console.log("Produkte erhalten:", products); // Debug Ausgabe

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
            <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
            <p><strong>Bewertung:</strong> ${ratingStars}</p>
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
