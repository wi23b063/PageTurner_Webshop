document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const isInSites = path.includes("/sites/");
  
    const prefix = isInSites ? "../" : "";
  
    includeHTML("header", `${prefix}header.html`);
    includeHTML("footer", `${prefix}footer.html`);
  
    updateCartCount?.();
  });
  
  function includeHTML(tagName, file) {
    fetch(file)
      .then(res => {
        if (!res.ok) throw new Error(`${file} not found`);
        return res.text();
      })
      .then(data => {
        const target = document.querySelector(tagName);
        if (target) {
          target.innerHTML = data;

          
  
          //Login-Button nachladen
          if (tagName === "header") {
            const loginBtn = document.getElementById("login");
            if (loginBtn) {
              loginBtn.addEventListener("click", () => {
                window.location.href = "sites/userLogin.html";
              });
            }
  
            // logout button nachladen
            const logoutBtn = document.getElementById("logout");
            if (logoutBtn) {
              logoutBtn.addEventListener("click", () => {
                document.cookie = "rememberedLogin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "?logout=true";
              });
            }
          }
        }
      })
      .catch(err => console.error(`❌ Fehler beim Laden von ${file}:`, err));
  }
  