document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts();

  const productForm = document.getElementById("newProductForm");
  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
      const isEditing = productForm.dataset.editing === "true";
      const productId = productForm.dataset.productId;

      const formData = new FormData();
      formData.append("productName", document.getElementById("productName").value);
      formData.append("productDescription", document.getElementById("productDescription").value);
      formData.append("productPrice", document.getElementById("productPrice").value);
      formData.append("productRating", document.getElementById("productRating").value);
      formData.append("productCategory", document.getElementById("productCategory").value);
      const image = document.getElementById("productImage").files[0];
      if (image) formData.append("productImage", image);

      const endpoint = isEditing
        ? `backend/admin_product_api.php?updateProduct=${productId}`
        : "backend/admin_product_api.php?createProduct=1";

      fetch(prefix + endpoint, {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(isEditing ? "Product updated" : "New Product created");
            hideCreateProductForm();
            loadProducts();
          } else {
            alert("Fehler: " + data.error);
          }
        })
        .catch(err => {
          console.error("Netzwerkfehler:", err);
          alert("Network Error while sennding product");
        });
    });
  }
});

function loadCategories() {
  const prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  fetch(prefix + "backend/product_api.php?categories=1")
    .then(res => res.json())
    .then(categories => {
      const select = document.getElementById("productCategory");
      if (!select) return;
      select.innerHTML = '<option value="">Select a Category</option>';
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.category_name;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Fehler beim Laden der Kategorien:", err);
    });
}

function loadProducts() {
  const prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  fetch(prefix + "backend/admin_product_api.php?products=1")
    .then(res => res.json())
    .then(products => {
      const tableBody = document.querySelector("#products-table tbody");
      tableBody.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='7'>Keine Produkte gefunden.</td></tr>";
        return;
      }

      products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.id}</td>
          <td><img src="../../backend/productpictures/${product.image_url}" style="height: 60px;"></td>
          <td>${product.product_name}</td>
          <td>${product.description}</td>
          <td>${product.rating != null ? parseFloat(product.rating).toFixed(1) : "-"}</td>
          <td>€${parseFloat(product.price).toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">✏️ Bearbeiten</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">🗑️ Löschen</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Fehler beim Laden der Produkte:", err);
      document.querySelector("#products-table tbody").innerHTML = "<tr><td colspan='7'>Fehler beim Laden.</td></tr>";
    });
}

function deleteProduct(id) {
  const prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  if (!confirm("Willst du dieses Produkt wirklich löschen?")) return;

  fetch(prefix + `backend/admin_product_api.php?deleteProduct=${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Produkt gelöscht!");
        loadProducts();
      } else {
        alert("Fehler: " + data.error);
      }
    })
    .catch(err => {
      console.error("Fehler beim Löschen:", err);
      alert("Netzwerkfehler beim Löschen!");
    });
}

function editProduct(id) {
  const prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  fetch(prefix + `backend/admin_product_api.php?getProduct=${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById("productName").value = product.product_name;
      document.getElementById("productDescription").value = product.description;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productRating").value = product.rating;
      document.getElementById("productCategory").value = product.category_id;
      const form = document.getElementById("newProductForm");
      form.dataset.editing = "true";
      form.dataset.productId = id;
      showCreateProductForm();
    })
    .catch(err => {
      console.error("Fehler beim Laden des Produkts:", err);
      alert("Produkt konnte nicht geladen werden.");
    });
}

function showCreateProductForm() {
  document.getElementById("create-product-form").style.display = "block";

  const form = document.getElementById("newProductForm");
  const imageInput = document.getElementById("productImage");

  if (form.dataset.editing === "true") {
    imageInput.required = false;
  } else {
    imageInput.required = true;
  }
}

function hideCreateProductForm() {
  const form = document.getElementById("newProductForm");
  form.reset();
  form.removeAttribute("data-editing");
  form.removeAttribute("data-product-id");
  document.getElementById("create-product-form").style.display = "none";
  document.getElementById("productImage").required = true;
}
