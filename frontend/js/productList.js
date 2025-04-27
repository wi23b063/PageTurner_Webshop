document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Produktliste wird geladen...");

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.value = ""; // Suchfeld beim Laden leeren
    searchInput.addEventListener("input", () => {
      const search = searchInput.value.trim();
      console.log("Live-Suche nach:", search);

      if (search.length < 2) {
        // 🔥 Nur suchen wenn mindestens 2 Zeichen
        const container = document.getElementById("product-list");
        if (container) {
          container.innerHTML = ""; // Produktliste leeren
        }
        return;
      }

      // 🔥 Bei gültiger Eingabe Produkte suchen
      loadProducts(search);
    });
  }

  // 🔥 Produkte nur automatisch laden, wenn wir auf products.html sind
  if (window.location.pathname.includes("products.html")) {
    loadProducts();
  }
});

function loadProducts(search = "") {
  console.log("Lade Produkte... Suchbegriff:", search);

  let pathPrefix = "";
  if (window.location.pathname.includes("/frontend/sites/")) {
    pathPrefix = "../../backend/product_api.php";
  } else {
    pathPrefix = "../backend/product_api.php";
  }

  let url = pathPrefix + "?products=1";

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  console.log("Fetch URL:", url);

  fetch(url)
    .then((res) => res.json())
    .then((products) => {
      console.log("Produkte erhalten:", products);

      const container = document.getElementById("product-list");
      if (!container) {
        console.error("❌ Kein #product-list Container gefunden!");
        return;
      }

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
      const container = document.getElementById("product-list");
      if (container) {
        container.innerHTML = "<p>Fehler beim Laden der Produkte.</p>";
      }
    });
}
