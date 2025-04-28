document.addEventListener("DOMContentLoaded", () => {
    loadCustomers();
  });
  
  function loadCustomers() {
    let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";
  
    fetch(prefix + "backend/api.php?customers=1")
      .then(res => res.json())
      .then(customers => {
        console.log("Kunden erhalten:", customers);
  
        const tableBody = document.querySelector("#customer-table tbody");
        tableBody.innerHTML = "";
  
        if (!Array.isArray(customers) || customers.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='5'>Keine Kunden gefunden.</td></tr>";
          return;
        }
  
        customers.forEach(customer => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.firstname} ${customer.lastname}</td>
            <td>${customer.email}</td>
            <td>${customer.active === 'active' ? "Aktiv" : "Inaktiv"}</td>
            <td>
              <button class="btn btn-sm ${customer.active === 'active' ? 'btn-danger' : 'btn-success'}" 
                onclick="toggleCustomerStatus(${customer.id}, '${customer.active}')">
                ${customer.active === 'active' ? "Deaktivieren" : "Aktivieren"}

              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(err => {
        console.error("❌ Fehler beim Laden der Kunden:", err);
        const tableBody = document.querySelector("#customer-table tbody");
        tableBody.innerHTML = "<tr><td colspan='5'>Fehler beim Laden der Kunden.</td></tr>";
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
        alert("Fehler beim Ändern des Kundenstatus: " + data.error);
      }
    })
    .catch(err => {
      console.error("❌ Fehler beim Ändern des Status:", err);
      alert("Netzwerkfehler beim Ändern des Status!");
    });
  }
  