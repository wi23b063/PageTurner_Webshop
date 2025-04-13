const loginBtn = document.getElementById("login");

if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    window.location.href = "sites/userLogin.html";
  });
}



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

    if (!username || !email || !salutation || !firstName || !lastName) {
      messageDiv.innerHTML = "Bitte füllen Sie alle Pflichtfelder aus.";
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
      confirm_password: confirmPassword
    };

    fetch("../../backend/api.php?user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then((data) => {
        messageDiv.innerHTML = data.message;
        messageDiv.className = data.status === "success" ? "success-message" : "error-message";

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

    if (!username || !password) {
      if (!username) $("#username_error").text("Bitte Benutzernamen eingeben.");
      if (!password) $("#password_error").text("Bitte Passwort eingeben.");
      return;
    }

    const loginData = { username, password };

    fetch("../../backend/api.php?login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          $("#error_message").text(data.error).show();
        } else {
          // Always set the cookie when login is successful (no matter if "Remember Me" is checked)
          const rememberedUser = {
            username,
            role: data.user.role || "user",
          };
          setCookie("rememberedLogin", JSON.stringify(rememberedUser), 30);
          console.log("Cookie gespeichert:", rememberedUser);

          // Redirect based on role
          if (data.user.role === "admin") {
            window.location.href = "../adminPanel.html";
          } else {
            window.location.href = "../index.html";
          }
        }
      })
      .catch(() => {
        $("#error_message").text("Ein Fehler ist aufgetreten.").show();
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

if (rememberedLogin && !currentPage.includes("index.html") && !currentPage.includes("adminPanel.html")) {
  try {
    const user = JSON.parse(rememberedLogin);
    console.log("Automatisch weiterleiten als:", user);

    if (user.role === "admin") {
      window.location.href = "../adminPanel.html";
    } else {
      window.location.href = "../index.html";
    }
  } catch (e) {
    console.error("Fehler beim Parsen des rememberedLogin-Cookies:", e);
    setCookie("rememberedLogin", "", -1); // Sicherheitshalber löschen
  }
}


// LOG OUT
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    setCookie("rememberedLogin", "", -1); // Cookie löschen
    window.location.href = "?logout=true";
  });
}

// Hide buttons
window.addEventListener("load", () => {
  const loginBtn = document.getElementById("login");
  const logoutBtn = document.getElementById("logout");

  const cookie = getCookie("rememberedLogin");
  console.log("Cookie found:", cookie);

  if (cookie) {
    try {
      const user = JSON.parse(cookie);
      console.log("Logged in as:", user);

      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } catch (e) {
      console.error("Fehler beim Parsen des Cookies:", e);
      setCookie("rememberedLogin", "", -1); // Cookie löschen, wenn ungültig
    }
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});



