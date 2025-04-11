// REGISTRIERUNG

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    console.log("🚨 Formular wurde abgesendet!");

    event.preventDefault();

    const username = $("#username").val();
    const password = $("#password").val();
    const email = $("#email").val();
    const salutation = $("#salutation").val();
    const firstName = $("#firstname").val();
    const lastName = $("#lastname").val();

    
    const confirmPassword = $("#confirm_password").val();
    const messageDiv = document.getElementById("message");


    if (password.length < 8) {
      messageDiv.innerHTML = "Das Passwort muss mindestens 8 Zeichen lang sein.";
      messageDiv.className = "error-message";
      return;
    }

    if (password !== confirmPassword) {
      messageDiv.innerHTML = "Die Passwörter stimmen nicht überein.";
      messageDiv.className = "error-message";
      return;
    }


    if (!username) {
        messageDiv.innerHTML = "Please enter a username.";
        messageDiv.className = "error-message";
        return;
    }

    if (!email) {
        messageDiv.innerHTML = "Please enter an email address.";
        messageDiv.className = "error-message";
        return;
    }

    if (!salutation) {
        messageDiv.innerHTML = "Please select a salutation.";
        messageDiv.className = "error-message";
        return;
    }

    if (!firstName) {
        messageDiv.innerHTML = "Please enter your first name.";
        messageDiv.className = "error-message";
        return;
    }

    if (!lastName) {
        messageDiv.innerHTML = "Please enter your last name.";
        messageDiv.className = "error-message";
        return;
    }


    const userData = {
      email,
      firstname: firstName,
      lastname: lastName,
      username,
      password,
      salutation,
      confirm_password:confirmPassword
    };

    fetch("../../backend/api.php?user", {
        method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then((data) => {
        messageDiv.innerHTML = data.message;
        messageDiv.className =
          data.status === "success" ? "success-message" : "error-message";

        if (data.status === "success") {
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        }
      })
      .catch((err) => console.error("Fehler bei der Registrierung:", err));
  });
}

// LOGIN

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    $(".error").text("");
    $("#error_message").hide();

    const username = $("#username").val().trim();
    const password = $("#password").val().trim();
    let isValid = true;

    if (!username) {
      $("#username_error").text("Bitte Benutzernamen eingeben.");
      isValid = false;
    }
    if (!password) {
      $("#password_error").text("Bitte Passwort eingeben.");
      isValid = false;
    }

    if (!isValid) return;

    $.ajax({
      url: "UserLogin.php",
      type: "POST",
      data: { username, password },
      dataType: "json",
      success: function (res) {
        if (res.success) {
          window.location.href = "index.html";
        } else {
          $("#error_message").text(res.message).show();
        }
      },
      error: function () {
        $("#error_message").text("Ein Fehler ist aufgetreten.").show();
      },
    });
  });
}

// PRODUKT-SUCHE AUF STARTSEITE

document.addEventListener("DOMContentLoaded", () => {
  console.log("Seite geladen");

  loadProducts();

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const search = searchInput.value.trim();
      console.log("Suche nach:", search);
      loadProducts(search);
    });
  }
});

function loadProducts(search = "") {
    fetch("../../backend/logic/getProducts.php", {
      
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ search: search }),
    })
      .then((res) => res.json())
      .then((products) => {
        const container = document.getElementById("product-list");
        container.innerHTML = "";
  
        if (!Array.isArray(products) || products.length === 0) {
          container.innerHTML = "<p>Keine Produkte gefunden.</p>";
          return;
        }
  
        products.forEach((p) => {
          container.innerHTML += `
            <div class="product">
              <h3>${p.product_name}</h3>
                <img src="img/${p.image_url}" alt="${p.product_name}" />
              <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
              <p><strong>Kategorie:</strong> ${p.category_name ?? "Unkategorisiert"}</p>
              <p class="rating"><strong>Bewertung:</strong> ${
  p.rating ? "⭐".repeat(Math.round(p.rating)) + ` (${p.rating})` : "Keine Bewertung"
}</p>
            </div>
          `;
        });
      })
      .catch((err) => {
        console.error("Fehler beim Laden:", err);
        document.getElementById("product-list").innerHTML =
          "<p>Fehler beim Laden der Produkte.</p>";
      });
  }

  // LOG OUT

  document.getElementById('logout').addEventListener('click', function() {
    window.location.href = '?logout=true'; // triggers logout condition in session php
});
