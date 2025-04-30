document.addEventListener("DOMContentLoaded", () => {
  let prefix = window.location.pathname.includes("/admin/") ? "../../" : "../";

  fetch(prefix + "backend/api.php?checkSession")
    .then(res => res.json())
    .then(data => {
      if (!data.user || data.user.role !== "admin") {
        alert("Access denied. Only for admins allowed.");
        window.location.href = prefix + "index.html";
      }
    })
    .catch(err => {
      console.error("Session-Check failed:", err);
      window.location.href = prefix + "index.html";
    });
});
