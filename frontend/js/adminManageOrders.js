document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
  const initialId = urlParams.get("customerId");

  if (initialId) {
    loadOrders(initialId);
    document.getElementById("customer-search-input").value = initialId;
  }
  const input = document.getElementById("customer-search-input");
  const form = document.getElementById("filter-form");
  const resultDiv = document.getElementById("search-result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    resultDiv.innerHTML = "<p class='text-muted'>Suche läuft...</p>";
    document.getElementById("order-container").innerHTML = "";

    fetch(`../../backend/admin_order_api.php?customer_search=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(customers => {
        if (!Array.isArray(customers) || customers.length === 0) {
          resultDiv.innerHTML = "<p class='text-danger'>Kein Kunde gefunden.</p>";
          return;
        }

        let html = "<p><strong>Suchergebnisse:</strong></p><ul class='list-group'>";
        customers.forEach(c => {
          html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${c.firstname} ${c.lastname} (ID: ${c.id})
              <button class="btn btn-sm btn-outline-primary" onclick="loadOrders(${c.id})">View Order</button>
            </li>
          `;
        });
        html += "</ul>";
        resultDiv.innerHTML = html;
      })
      .catch(err => {
        console.error("Fehler bei der Kundensuche:", err);
        resultDiv.innerHTML = "<p class='text-danger'>Fehler beim Suchen.</p>";
      });
});

});

// Lädt Bestellungen eines bestimmten Kunden
function loadOrders(customerId) {
  const container = document.getElementById("order-container");
  container.innerHTML = "<p class='text-muted'>Load Order...</p>";
  document.getElementById("search-result").innerHTML = "";

  fetch("../../backend/admin_order_api.php?customer_id=" + customerId)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p class='text-muted'>No orders found.</p>";
        return;
      }

      let html = `
        <table class="table table-bordered table-striped">
          <thead class="table-dark">
            <tr>
              <th>Order-ID</th>
              <th>Date</th>
              <th>Products</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(order => {
        const productList = order.products.map(p =>
          `<li>
            ${p.name} (${p.quantity}) 
            <button class="btn btn-sm btn-danger ms-2" onclick="removeProduct(${order.order_id}, ${p.product_id})">Delete</button>
          </li>`
        ).join("");

        html += `
          <tr>
            <td>${order.order_id}</td>
            <td>${order.order_date}</td>
            <td><ul class="list-unstyled">${productList}</ul></td>
            <td>${order.status}</td>
          </tr>
        `;
      });

      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch(err => {
      console.error("Fehler beim Laden der Bestellungen:", err);
      container.innerHTML = "<p class='text-danger'>Fehler beim Laden der Daten.</p>";
    });
}

// Entfernt ein Produkt aus einer Bestellung
function removeProduct(orderId, productId) {
  fetch("../../backend/admin_order_api.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      remove_product: true,
      order_id: orderId,
      product_id: productId
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        
        loadOrders(new URLSearchParams(window.location.search).get("customerId"));

        if (data.orderDeleted) {
          showMessage("total order removed.", "warning");
        } else {
          showMessage("product removed.", "success");
        }
      } else {
        showMessage("Erorr removing product: " + data.error, "danger");
      }
    })
    .catch(err => {
      console.error("Fehler beim Entfernen:", err);
      showMessage("Netzwerkfehler.", "danger");
    });

   

}

 function showMessage(message, type = "info", duration = 3000) {
  const resultDiv = document.getElementById("search-result");
  const alertId = "alert-" + Date.now();

  resultDiv.innerHTML = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
    </div>
  `;

  setTimeout(() => {
    const alert = document.getElementById(alertId);
    if (alert) {
      alert.classList.remove("show");
      alert.classList.add("fade");
      setTimeout(() => alert.remove(), 200);
    }
  }, duration);
}


