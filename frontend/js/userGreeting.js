
  // Direkt nach dem Laden: Session check
  fetch("../backend/api.php?checkSession")
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        const welcome = document.getElementById("welcome-message");
        welcome.textContent = `Hallo, ${data.user.firstname}! Schön, dass du da bist.`;
      }
    })
    .catch(err => {
      console.warn("Keine Session oder Fehler:", err);
    });

