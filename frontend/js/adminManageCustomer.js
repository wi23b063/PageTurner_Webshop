document.addEventListener("DOMContentLoaded", () => {
    loadCustomers();
  });
  
  function loadCustomers() {
    let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  
    fetch(prefix + "backend/api.php?customers=1")
      .then(res => res.json())
      .then(customers => {
        console.log("getting customers:", customers);
  
        const tableBody = document.querySelector("#customer-table tbody");
        tableBody.innerHTML = "";
  
        if (!Array.isArray(customers) || customers.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='5'>No customers found.</td></tr>";
          return;
        }
  
        customers.forEach(customer => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${customer.id}</td>
          <td>${customer.firstname} ${customer.lastname}</td>
          <td>${customer.email}</td>
          <td>${customer.active === 'active' ? "active" : "inactive"}</td>
          <td>
            <button class="btn btn-sm ${customer.active === 'active' ? 'btn-danger' : 'btn-success'}" 
              onclick="toggleCustomerStatus(${customer.id}, '${customer.active}')">
              ${customer.active === 'active' ? "disable Account" : "enable Account"}
            </button>
            <a href="orders.html?customerId=${customer.id}" class="btn btn-info btn-sm ms-2">
             Manage Order
            </a>
          </td>
        `;
        tableBody.appendChild(row);
      });

      })
      .catch(err => {
        console.error("Error while loading customers:", err);
        const tableBody = document.querySelector("#customer-table tbody");
        tableBody.innerHTML = "<tr><td colspan='5'>Error while loading customers.</td></tr>";
      });
  }
  
  function toggleCustomerStatus(id, currentStatus) {
    let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

  
    fetch(prefix + `backend/api.php?updateCustomerStatus=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newStatus })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadCustomers(); // Nach erfolgreicher Änderung Tabelle neu laden
      } else {
        alert("Error while updating customer status: " + data.error);
      }
    })
    .catch(err => {
      console.error("Error while updating customer status: ", err);
      alert("Network error while updating customer status.");
    });
  }
  