document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Produktliste wird geladen...");

  const searchInput = document.getElementById("searchInput");
  const categoryContainer = document.getElementById("category-buttons");

  let selectedCategory = null;

  // 🟠 Kategorien laden + "Alle"-Button hinzufügen
  fetch("../../backend/product_api.php?categories=1")
    .then((res) => res.json())
    .then((categories) => {
      categoryContainer.innerHTML = "";

      // "Alle"-Button zuerst
      const allBtn = document.createElement("button");
      allBtn.textContent = "Alle";
      allBtn.dataset.id = "";
      allBtn.classList.add("category-button", "active");
      categoryContainer.appendChild(allBtn);
      selectedCategory = null;

      // Danach echte Kategorien
      categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat.category_name;
        btn.dataset.id = cat.id;
        btn.classList.add("category-button");
        categoryContainer.appendChild(btn);
      });

      // Direkt beim Laden alle Produkte anzeigen
      loadProducts("", selectedCategory);
    })
    .catch((err) => {
      console.error("Fehler beim Laden der Kategorien:", err);
    });

  // 🟠 Kategorie wechseln
  categoryContainer?.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
      document.querySelectorAll(".category-button").forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");

      selectedCategory = e.target.dataset.id || null;
      const search = searchInput?.value.trim() ?? "";
      loadProducts(search, selectedCategory);
    }
  });

  // 🔍 Suchfeld
  if (searchInput) {
    searchInput.value = "";
    searchInput.addEventListener("input", () => {
      const search = searchInput.value.trim();
      if (search.length < 2) {
        document.getElementById("product-list").innerHTML = "";
        return;
      }
      loadProducts(search, selectedCategory);
    });
  }

  // 🔃 Fallback-Start ohne Kategorie (zeigt alle)
  if (window.location.pathname.includes("products.html") && !selectedCategory) {
    loadProducts();
  }
});

function loadProducts(search = "", categoryId = null) {
  console.log("🔄 Lade Produkte... Suchbegriff:", search, "Kategorie:", categoryId);

  const urlParams = new URLSearchParams();
  urlParams.set("products", "1");

  if (search) {
    urlParams.set("search", search);
  }

  if (categoryId) {
    urlParams.set("category_id", categoryId);
  }

  const url = "../../backend/product_api.php?" + urlParams.toString();

  fetch(url)
    .then((res) => res.json())
    .then((products) => {
      const container = document.getElementById("product-list");
      if (!container) return;

      container.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = "<p>Keine Produkte gefunden.</p>";
        return;
      }

      products.forEach((p) => {
        console.log(p);
        const ratingStars = p.rating
          ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})`
          : "No ratings";

        container.innerHTML += `
          <div class="product">
            <img src="../../backend/productpictures/${p.image_url}" alt="${p.product_name}" width="150">


            <h3>${p.product_name}</h3>
            <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
            <p><strong>Bewertung:</strong> ${ratingStars}</p>
            <button class="button" onclick="addToCart(${p.id})">🛒 In den Warenkorb</button>
          </div>
        `;
      });
    })
    .catch((err) => {
      console.error("Fehler beim Laden der Produkte:", err);
      const container = document.getElementById("product-list");
      if (container) {
        container.innerHTML = "<p>Fehler beim Laden der Produkte.</p>";
      }
    });
}
