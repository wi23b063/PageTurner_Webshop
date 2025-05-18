document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Loading product list...");

  const searchInput = document.getElementById("searchInput");
  const categoryContainer = document.getElementById("category-buttons");
  const liveSearchBox = document.getElementById("live-search-results");

  let selectedCategory = null;

  // 🔁 Universal backend path based on project folder structure
  const backendPath = window.location.origin + "/PageTurner/PageTurner_Webshop/backend";

  // 🟠 Load categories and display buttons
  fetch(`${backendPath}/product_api.php?categories=1`)
    .then((res) => res.json())
    .then((categories) => {
      categoryContainer.innerHTML = "";

      // "All" button first
      const allBtn = document.createElement("button");
      allBtn.textContent = "All";
      allBtn.dataset.id = "";
      allBtn.classList.add("category-button", "active");
      categoryContainer.appendChild(allBtn);
      selectedCategory = null;

      // Category buttons
      categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat.category_name;
        btn.dataset.id = cat.id;
        btn.classList.add("category-button");
        categoryContainer.appendChild(btn);
      });

      // Initial product load
      loadProducts("", selectedCategory, backendPath);
    })
    .catch((err) => {
      console.error("❌ Failed to load categories:", err);
    });

  // 🟠 Category selection
  categoryContainer?.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
      document.querySelectorAll(".category-button").forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");

      selectedCategory = e.target.dataset.id || null;
      const search = searchInput?.value.trim() ?? "";
      liveSearchBox.innerHTML = "";
      loadProducts(search, selectedCategory, backendPath);
    }
  });

  // 🔍 Live search input
  if (searchInput) {
    searchInput.value = "";

    searchInput.addEventListener("input", () => {
      const search = searchInput.value.trim();

      if (search.length < 2) {
        liveSearchBox.innerHTML = "";
        return;
      }

      const urlParams = new URLSearchParams();
      urlParams.set("products", "1");
      urlParams.set("search", search);

      fetch(`${backendPath}/product_api.php?${urlParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          renderSearchResults(data, backendPath);
        })
        .catch(err => {
          console.error("Live search failed:", err);
        });
    });
  }

  // 🔁 Fallback: load all products on products.html
  if (window.location.pathname.includes("products.html") && !selectedCategory) {
    loadProducts("", null, backendPath);
  }
});

// 🔄 Load full product list
function loadProducts(search = "", categoryId = null, backendPath) {
  console.log("🔄 Loading products... Search:", search, "Category:", categoryId);

  const urlParams = new URLSearchParams();
  urlParams.set("products", "1");

  if (search) urlParams.set("search", search);
  if (categoryId) urlParams.set("category_id", categoryId);

  const url = `${backendPath}/product_api.php?${urlParams.toString()}`;

  fetch(url)
    .then((res) => res.json())
    .then((products) => {
      const container = document.getElementById("product-list");
      if (!container) return;

      container.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = "<p>No products found.</p>";
        return;
      }

      products.forEach((p) => {
        const ratingStars = p.rating
          ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})`
          : "No ratings";

        container.innerHTML += `
          <div class="product">
            <img src="${backendPath}/productpictures/${p.image_url}" alt="${p.product_name}" width="150">
            <h3>${p.product_name}</h3>
            <p><strong>Price:</strong> €${parseFloat(p.price).toFixed(2)}</p>
            <p><strong>Rating:</strong> ${ratingStars}</p>
            <button class="button" onclick="addToCart(${p.id})">🛒 Add to cart</button>
          </div>
        `;
      });
    })
    .catch((err) => {
      console.error("❌ Failed to load products:", err);
      const container = document.getElementById("product-list");
      if (container) {
        container.innerHTML = "<p>Error loading products.</p>";
      }
    });
}

// 🔍 Render live search results
function renderSearchResults(products, backendPath) {
  const resultBox = document.getElementById("live-search-results");
  resultBox.innerHTML = "";

  if (!Array.isArray(products) || products.length === 0) {
    resultBox.innerHTML = '<li class="list-group-item text-muted">No matching products found.</li>';
    return;
  }

  products.forEach(p => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex align-items-center gap-3";

    item.innerHTML = `
      <img src="${backendPath}/productpictures/${p.image_url}" alt="${p.product_name}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
      <div class="flex-grow-1">
        <strong>${p.product_name}</strong><br>
        <small>€${parseFloat(p.price).toFixed(2)}</small>
      </div>
      <button class="btn btn-sm btn-outline-primary" onclick="addToCart(${p.id}); event.stopPropagation();">🛒</button>
    `;

    item.addEventListener("click", () => {
      document.getElementById("searchInput").value = p.product_name;
      resultBox.innerHTML = "";
      loadProducts(p.product_name, null, backendPath);
    });

    resultBox.appendChild(item);
  });
}



