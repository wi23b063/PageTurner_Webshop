// NICHT auf DOMContentLoaded warten – wir wissen, dass wir erst geladen werden, wenn alles da ist
(() => {
  const welcomeElement = document.getElementById("welcome-message");
  if (!welcomeElement) return;

  fetch("../backend/api.php?checkSession")
    .then((res) => res.json())
    .then((data) => {
      if (data.user && data.user.username) {
        welcomeElement.textContent = `Hello, ${data.user.username}!`;
      } else {
        const remembered = getCookie("rememberedLogin");
        if (remembered) {
          try {
            const user = JSON.parse(remembered);
            welcomeElement.textContent = `Hello, ${user.username || "User"}!`;
          } catch {
            welcomeElement.textContent = "Hello Guest!";
          }
        } else {
          welcomeElement.textContent = "Hello Guest!";
        }
      }
    })
    .catch(() => {
      welcomeElement.textContent = "Hello Guest!";
    });
})();
