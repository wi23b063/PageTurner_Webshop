document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
  
    const newProductForm = document.getElementById("newProductForm");
    if (newProductForm) {
      newProductForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  
        const formData = new FormData();
        formData.append("productName", document.getElementById("productName").value);
        formData.append("productDescription", document.getElementById("productDescription").value);
        formData.append("productPrice", document.getElementById("productPrice").value);
        formData.append("productRating", document.getElementById("productRating").value);
        formData.append("productImage", document.getElementById("productImage").files[0]);
  
        fetch(prefix + "backend/admin_product_api.php?createProduct=1", {
          method: "POST",
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("✅ Produkt erfolgreich erstellt!");
            hideCreateProductForm();
            loadProducts();
          } else {
            alert("❌ Fehler beim Erstellen: " + data.error);
          }
        })
        .catch(err => {
          console.error("❌ Netzwerkfehler beim Erstellen des Produkts:", err);
          alert("Netzwerkfehler beim Erstellen des Produkts!");
        });
      });
    }
  });
  
  function loadProducts() {
    let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  
    fetch(prefix + "backend/admin_product_api.php?products=1")

      .then(res => res.json())
      .then(products => {
        console.log("Produkte erhalten:", products);
  
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
        console.error("❌ Fehler beim Laden der Produkte:", err);
        const tableBody = document.querySelector("#products-table tbody");
        tableBody.innerHTML = "<tr><td colspan='7'>Fehler beim Laden der Produkte.</td></tr>";
      });
  }
  
  function deleteProduct(id) {
    if (!confirm("Willst du dieses Produkt wirklich löschen?")) return;
  
    let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  
    fetch(prefix + `backend/admin_product_api.php?deleteProduct=${id}`, {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("✅ Produkt erfolgreich gelöscht!");
        loadProducts(); // Tabelle neu laden
      } else {
        alert("❌ Fehler beim Löschen: " + data.error);
      }
    })
    .catch(err => {
      console.error("❌ Netzwerkfehler beim Löschen des Produkts:", err);
      alert("Netzwerkfehler beim Löschen des Produkts!");
    });
  }
  
  function editProduct(id) {
    alert("🛠 Bearbeiten-Funktion wird bald implementiert!");
    // Hier später: Formular öffnen und Produktdaten laden
  }
  
  function showCreateProductForm() {
    document.getElementById("create-product-form").style.display = "block";
  }
  
  function hideCreateProductForm() {
    document.getElementById("create-product-form").style.display = "none";
  }
  