document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  // Prefix für sites
  const prefix = path.includes("/sites/") || path.includes("/admin/") ? "../" : "";

  // Prefix für admin 
  const isAdminPage = path.includes("/admin/") || path.includes("adminPanel.html");

  // Header-Datei auswählen je nach admin oder user
  let headerFile;
  if (isAdminPage) {
    headerFile = prefix + "partials/adminHeader.html";
  } else {
    headerFile = prefix + "partials/header.html";
  }

  try {
    // Header und Footer einfügen
    await includeHTML("header", headerFile);
    await includeHTML("footer", `${prefix}partials/footer.html`);

    // Wichtige Skripte nachladen
    await loadScript(`${prefix}js/navVisibility.js`);

    setTimeout(() => {
      if (typeof updateNavbarVisibility === "function") {
        updateNavbarVisibility();
      }
    
      // Add redirect to login page
      const loginBtn = document.getElementById("login");
      if (loginBtn) {
        const redirectPrefix = path.includes("/sites/") || path.includes("/admin/") ? "" : "sites/";
        loginBtn.addEventListener("click", () => {
          window.location.href = `${redirectPrefix}userLogin.html`;
        });
      }
    
      // redirect to profile page
      const profileBtn = document.getElementById("userProfile");
      if (profileBtn) {
        profileBtn.addEventListener("click", () => {
          const redirectPrefix = path.includes("/sites/") || path.includes("/admin/") ? "" : "sites/";
          window.location.href = `${redirectPrefix}userAccount.html`;
        });
      }
    }, 50);
    

    await loadScript(`${prefix}js/userAuthorization.js`);
    

  } catch (e) {
    console.error("Include-Error:", e);
    return;
  }

  // Alle internen Link-Pfade anpassen 
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("/") && !href.startsWith("#")) {
      link.setAttribute("href", prefix + href);
    }
  });

  // Bildpfade, Logos anpassen
  document.querySelectorAll("header img").forEach(img => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("http") && !src.startsWith("/")) {
      img.src = prefix + src;
    }
  });

  // Falls vorhanden: Warenkorb-Zähler aktualisieren
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
});

// Hilfsfunktionen
function includeHTML(selector, file) {
  return fetch(file)
    .then(res => {
      if (!res.ok) throw new Error(`${file} not found (${res.status})`);
      return res.text();
    })
    .then(html => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element <${selector}> not found`);
      el.outerHTML = html;
    });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
}
