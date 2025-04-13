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
            window.location.href = "../index.html";
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

    const loginData = {
      username: username,
      password: password
    };

    fetch("../../backend/api.php?login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          $("#error_message").text(data.error).show();
        } else {
          //Umleitung je nach Rolle admin
          if(data.user.role === "admin"){
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


  // LOG OUT

  document.getElementById('logout').addEventListener('click', function() {
    window.location.href = '?logout=true'; // triggers logout condition in session php
    //  ACHTUNG schua vllt nochmal auf den richtigen Pfad !!!
});
