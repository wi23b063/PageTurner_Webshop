// includeParts.js
// Lädt Header, Footer, Navbar-Visibility, Auth-Logik und Warenkorb-Zähler dynamisch auf allen Seiten

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  // Prefix für Seiten bestimmen
  const prefix = path.includes("/sites/") || path.includes("/admin/") ? "../" : "";

  // Admin-Seiten erkennen
  const isAdminPage = path.includes("/admin/") || path.includes("adminPanel.html");

  // Header-Datei auswählen (klassisch geschrieben für Browser-Kompatibilität)
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

      const loginBtn = document.getElementById("login");
      if (loginBtn) {
        const redirectPrefix = path.includes("/sites/") || path.includes("/admin/") ? "" : "sites/";
        loginBtn.addEventListener("click", () => {
          window.location.href = `${redirectPrefix}userLogin.html`;
        });
      }
    }, 50);

    await loadScript(`${prefix}js/userAuthorization.js`);

  } catch (e) {
    console.error("❌ Include-Error:", e);
    return;
  }

  // Alle internen Link-Pfade anpassen (z.B. Navbar-Links)
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("/") && !href.startsWith("#")) {
      link.setAttribute("href", prefix + href);
    }
  });

  // Bildpfade (z.B. Logos) anpassen
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
      if (!res.ok) throw new Error(`${file} nicht gefunden (${res.status})`);
      return res.text();
    })
    .then(html => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element <${selector}> nicht gefunden`);
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
