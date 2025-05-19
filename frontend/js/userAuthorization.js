// REGISTRIERUNG
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    console.log("Formular wurde abgesendet!");
    event.preventDefault();

    const username = $("#username").val();
    const password = $("#password").val();
    const email = $("#email").val();
    const salutation = $("#salutation").val();
    const firstName = $("#firstname").val();
    const lastName = $("#lastname").val();
    const postalCode = $("#postal_code").val();
    const address = $("#address").val();
    const city = $("#city").val();
    const confirmPassword = $("#confirm_password").val();
    const messageDiv = document.getElementById("message");

    if (password.length < 8) {
      messageDiv.innerHTML = "The password needs to have at least 8 characters.";
      messageDiv.className = "error-message";
      return;
    }

    if (password !== confirmPassword) {
      messageDiv.innerHTML = "The password and the confirmation password do not match.";
      messageDiv.className = "error-message";
      return;
    }

    if (!username || !email || !salutation || !firstName || !lastName || !postalCode) {
      messageDiv.innerHTML = "Please fill in all required fields.";
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
      confirm_password: confirmPassword,
      postal_code: postalCode,
      address,
      city
    };

    fetch("../../backend/api.php?user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then((data) => {
        const message = data.message || data.error || "Unknown response";
        const isSuccess = data.status === "success" || (data.message && !data.error);
        
        messageDiv.innerHTML = message;
        messageDiv.className = isSuccess ? "success-message" : "error-message";
      
        if (isSuccess) {
          setTimeout(() => {
            window.location.href = "/PageTurner/PageTurner_Webshop/frontend/index.html";
          }, 2000);
        }
      })
      .catch((err) => console.error("Error while registering user:", err));      
  });
}


// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const messageDiv = document.getElementById("error_message");
    document.querySelectorAll(".error").forEach(el => el.textContent = "");
    if (messageDiv) messageDiv.style.display = "none";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
      if (!username) document.getElementById("username_error").textContent = "Bitte Benutzernamen eingeben.";
      if (!password) document.getElementById("password_error").textContent = "Bitte Passwort eingeben.";
      return;
    }

    fetch("../../backend/api.php?login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        if (messageDiv) {
          messageDiv.textContent = data.error;
          messageDiv.style.display = "block";
        }
      } else {
        const rememberedUser = { username, role: data.user.role || "user" };
        setCookie("rememberedLogin", JSON.stringify(rememberedUser), 30);
        window.location.href = data.user.role === "admin" ? "../adminPanel.html" : "../index.html";
      }
    })
    .catch(() => {
      if (messageDiv) {
        messageDiv.textContent = "An Error occurred while trying to login.";
        messageDiv.style.display = "block";
      }
    });
  });
}


// LOGIN MERKEN – Cookie Utils
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

// Automatisches Weiterleiten, wenn "rememberedLogin"-Cookie vorhanden ist
const rememberedLogin = getCookie("rememberedLogin");
const currentPage = window.location.pathname;

if (rememberedLogin) {
  try {
    const user = JSON.parse(rememberedLogin);

    if (user.role === "admin") {
      // Admin ist eingeloggt
      if (
        !currentPage.includes("adminPanel.html") &&
        !currentPage.includes("/admin/") &&
        !currentPage.includes("index.html")
      ) {
        window.location.href = "../adminPanel.html";
      }
      //Admin darf bleiben auf admin-Seiten!
    } else {
      //Kein Admin, aber versucht auf Admin-Seite zu gehen → Umleiten
      if (currentPage.includes("/admin/")) {
        window.location.href = "../index.html";
      }
    }
  } catch (e) {
    console.error("Fehler beim Lesen des rememberedLogin Cookies:", e);
    setCookie("rememberedLogin", "", -1);
    if (currentPage.includes("/admin/")) {
      window.location.href = "../index.html";
    }
  }
} else {
  //Wenn rememberedLogin fehlt → Umleiten nur bei /admin/ Seiten
  if (currentPage.includes("/admin/")) {
    window.location.href = "../index.html";
  }
}



// LOG OUT
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    setCookie("rememberedLogin", "", -1); // Cookie löschen

    fetch("../backend/api.php?logout")
      .then(() => {
        let prefix = "";
        const path = window.location.pathname;

        if (path.includes("/sites/") || path.includes("/admin/")) {
          prefix = "../";
        }

        // Danach zurück zur Startseite
        window.location.href = prefix + "index.html?logout=true";
      });
  });
}


