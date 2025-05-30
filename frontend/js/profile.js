document.addEventListener("DOMContentLoaded", async () => {
  console.log("profile.js script loaded");

  let userId = null;

  try {
    const response = await fetch('../../backend/api.php?checkSession');
    const data = await response.json();

    if (data.user) {
      userId = data.user.id; // store userId for later use

      // Prefill form inputs
      document.getElementById('firstname').value = data.user.firstname || '';
      document.getElementById('lastname').value = data.user.lastname || '';
      document.getElementById('username').value = data.user.username || '';
      document.getElementById('email').value = data.user.email || '';
      document.getElementById('address').value = data.user.address || '';
      document.getElementById('city').value = data.user.city || '';
      document.getElementById('postal_code').value = data.user.postal_code || '';

      loadUserOrders(userId);
    } else {
      console.error("User not logged in");
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

  // Delegated event listener for Cancel buttons AND Print Invoice buttons
  document.querySelector("#ordersTable").addEventListener("click", function (e) {
    if (e.target.classList.contains("cancel-order")) {
      const orderId = e.target.getAttribute("data-id");

      if (confirm("Cancel this order?")) {
        fetch("../../backend/order_api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId })
        })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            alert("Order cancelled.");
            loadUserOrders(userId); // Reuse stored userId
          } else {
            alert("Cancel failed: " + result.error);
          }
        });
      }
    }
    
    // Neu: Rechnung drucken
    if (e.target.classList.contains("print-invoice")) {
      const orderId = e.target.getAttribute("data-id");
      printInvoice(orderId);
    }
  });
});

function loadUserOrders(userId) {
  fetch("../../backend/order_api.php?user_id=" + userId)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        console.error("Unexpected response:", data);
        document.querySelector("#ordersTable tbody").innerHTML =
          `<tr><td colspan="6">Failed to load orders: ${data.error || 'Unknown error'}</td></tr>`;
        return;
      }

      const tbody = document.querySelector("#ordersTable tbody");
      tbody.innerHTML = "";

      data.forEach(order => {
        const orderRow = document.createElement("tr");
        orderRow.classList.add("order-row");

        orderRow.innerHTML = `
          <td>${order.order_id}</td>
          <td>${new Date(order.order_date).toLocaleDateString()}</td>
          <td>€${parseFloat(order.total_amount).toFixed(2)}</td>
          <td>${order.status || "Pending"}</td>
          <td>
            ${order.status === "Pending" 
              ? `<button class="cancel-order" data-id="${order.order_id}">Cancel</button>` 
              : ""}
            <button class="toggle-details">View Details</button>
          </td>
          <td>
            <button class="print-invoice" data-id="${order.order_id}">Print Invoice</button>
          </td>
        `;

        const detailsRow = document.createElement("tr");
        detailsRow.classList.add("details-row");
        detailsRow.style.display = "none";

        const productRows = (order.products || []).map(p =>
          `<tr><td>${p.name}</td><td>${p.quantity}</td><td>€${parseFloat(p.price).toFixed(2)}</td></tr>`
        ).join("");

        detailsRow.innerHTML = `
          <td colspan="5">
            <strong>Products in this order:</strong>
            <table class="products-table">
              <thead>
                <tr><th>Name</th><th>Quantity</th><th>Price</th></tr>
              </thead>
              <tbody>${productRows}</tbody>
            </table>
          </td>
        `;

        tbody.appendChild(orderRow);
        tbody.appendChild(detailsRow);
      });
    })
    .catch(err => {
      console.error("Error loading orders:", err);
    });

document.querySelector("#ordersTable").addEventListener("click", function (e) {
  if (e.target.classList.contains("toggle-details")) {
    const orderRow = e.target.closest("tr");
    const detailsRow = orderRow?.nextElementSibling;

    if (detailsRow && detailsRow.classList.contains("details-row")) {
      const isVisible = detailsRow.style.display !== "none";
      detailsRow.style.display = isVisible ? "none" : "table-row";
      e.target.textContent = isVisible ? "View Details" : "Hide Details";
    }
  }

  if (e.target.classList.contains("cancel-order")) {
    const orderId = e.target.getAttribute("data-id");

    if (confirm("Cancel this order?")) {
      fetch("../../backend/order_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert("Order cancelled.");
          loadUserOrders(userId);
        } else {
          alert("Cancel failed: " + result.error);
        }
      });
    }
  }
});

}

// Rechnung drucken Funktion (neues Fenster)
async function printInvoice(orderId) {
  try {
    const resp = await fetch(`../../backend/order_api.php?order_id=${orderId}&invoice=1`);
    if (!resp.ok) {
      alert("Invoice could not be loaded.");
      return;
    }
    const invoice = await resp.json();

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>Rechnung ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #eee; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Invoice</h1>
        <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
        <p><strong>Order Date:</strong> ${new Date(invoice.order_date).toLocaleDateString()}</p>
        <p><strong>Delivery Address:</strong> ${invoice.delivery_address}</p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Amount</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(i => `
              <tr>
                <td>${i.product_name}</td>
                <td>${i.quantity}</td>
                <td>€${parseFloat(i.price).toFixed(2)}</td>
                <td>€${(parseFloat(i.price) * i.quantity).toFixed(2)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <h3>Total Amount: €${parseFloat(invoice.total_amount).toFixed(2)}</h3>

        <button onclick="window.print()">Print Invoice</button>
      </body>
      </html>
    `);
    win.document.close();
  } catch (error) {
    console.error("Error printing invoice:", error);
    alert("Error while creating the invoice.");
  }
}