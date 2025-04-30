
  // Direkt nach dem Laden: Session check
  fetch("../backend/api.php?checkSession")
    .then(res => res.json())
    .then(data => {
      const cookie       = getCookie("rememberedLogin");
      if(!cookie) {
        
        const welcome = document.getElementById("welcome-message");
        welcome.textContent = "Hello, Guest! Please log in or register.";
      } if (data.user.role === "user") {
        const welcome = document.getElementById("welcome-message");
        welcome.textContent = `Hello, ${data.user.firstname}!`;
      } if (data.user.role === "admin") {
        const welcome= document.getElementById("welcome-message");
        welcome.textContent = `Hallo, ${data.user.firstname}! You are logged in as an admin.`;
      } else {
        
      }
    })
    .catch(err => {
      console.warn("Keine Session oder Fehler:", err);
    });

