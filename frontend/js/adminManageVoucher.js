document.addEventListener("DOMContentLoaded", () => {
  loadVouchers();

  document.getElementById("generateCode").addEventListener("click", () => {
    const code = generateVoucherCode();
    document.getElementById("voucherCode").value = code;
  });

  document.getElementById("voucherForm").addEventListener("submit", (e) => {
    e.preventDefault();
    createVoucher();
  });
});

// 5-stelliger random alphanumerischer Code
function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// PopUp Nachrichten
function showMessage(message, type = "success", timeout = 2000) {
  const container = document.getElementById("messageContainer");

  // Neue Nachricht setzen
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Nachricht nach Timeout entfernen
  setTimeout(() => {
    const alert = container.querySelector(".alert");
    if (alert) {
      alert.classList.remove("show");
      alert.classList.add("fade");
      setTimeout(() => {
        alert.remove();
      }, 300); // Bootstrap braucht etwas Zeit für Fade-Out
    }
  }, timeout);
}

// Gutscheine laden
async function loadVouchers() {
  try {
    const res = await fetch('../../backend/admin_voucher_api.php?vouchers');
    const data = await res.json();
    const tbody = document.querySelector("#voucherTable tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No vouchers available.</td></tr>`;
      return;
    }

    data.forEach(voucher => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${voucher.code}</td>
        <td>${voucher.value}</td>
        <td>${voucher.expiry}</td>
        <td>${voucher.status}</td>
        <td>
        ${voucher.status === "active" 
            ? `<button class="btn btn-sm btn-warning me-1" onclick="deactivateVoucher('${voucher.code}')">Deactivate</button>` 
            : voucher.status === "disabled" 
            ? `<button class="btn btn-sm btn-success me-1" onclick="reactivateVoucher('${voucher.code}')">Activate</button>`
            : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteVoucher('${voucher.code}')">Delete</button>
        </td>

        
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showMessage("Error loading vouchers: " + err.message, "danger");
  }
}

// Gutschein erstellen
async function createVoucher() {
  const code = document.getElementById("voucherCode").value.trim();
  const value = document.getElementById("voucherValue").value;
  const expiry = document.getElementById("voucherExpiry").value;

  if (!code || !value || !expiry) {
    showMessage("All fields are required.", "warning");
    return;
  }

  try {
    const res = await fetch('../../backend/admin_voucher_api.php?createVoucher', {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `code=${encodeURIComponent(code)}&value=${encodeURIComponent(value)}&expiry=${encodeURIComponent(expiry)}`
    });

    const result = await res.json();
    if (result.success) {
      showMessage("Voucher created successfully!", "success");
      document.getElementById("voucherForm").reset();
      loadVouchers();
    } else {
      throw new Error(result.error || "Unknown error");
    }
  } catch (err) {
    showMessage("Error creating voucher: " + err.message, "danger");
  }
}

// Gutschein deaktivieren
async function deactivateVoucher(code) {
  try {
    await fetch('../../backend/admin_voucher_api.php?deactivateVoucher', {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `code=${encodeURIComponent(code)}`
    });
    showMessage("Voucher deactivated.", "info");
    loadVouchers();
  } catch (err) {
    showMessage("Error deactivating voucher.", "danger");
  }
}

// Gutschein aktivieren falls deaktiviert
async function reactivateVoucher(code) {
  try {
    await fetch('../../backend/admin_voucher_api.php?reactivateVoucher', {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `code=${encodeURIComponent(code)}`
    });
    showMessage("Voucher reactivated.", "success");
    loadVouchers();
  } catch (err) {
    showMessage("Error reactivating voucher.", "danger");
  }
}



// Gutschein löschen
async function deleteVoucher(code) {
  if (!confirm("Delete this voucher?")) return;

  try {
    await fetch('../../backend/admin_voucher_api.php?deleteVoucher', {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `code=${encodeURIComponent(code)}`
    });
    showMessage("Voucher deleted.", "secondary");
    loadVouchers();
  } catch (err) {
    showMessage("Error deleting voucher.", "danger");
  }
}
