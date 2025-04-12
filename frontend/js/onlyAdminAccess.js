document.addEventListener("DOMContentLoaded", () => {
    fetch("../backend/api.php?checkSession")
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== "admin") {
          alert("Zugriff verweigert. Nur für Administratoren.");
          window.location.href = "../index.html";
        }
      })
      .catch(err => {
        console.error("⚠️ Session-Check fehlgeschlagen:", err);
        window.location.href = "../index.html";
      });
  });
  