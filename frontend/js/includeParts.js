// includeParts.js
// Lädt Header, Footer, Navbar-Visibility, Auth-Logik und Warenkorb-Zähler dynamisch auf allen Seiten

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  // Wenn wir in einem /sites/-Unterordner sind, brauchen wir "../" vor den Pfaden
  const prefix = path.includes("/sites/") ? "../" : "";

  try {
    // 1) Header & Footer asynchron laden
    await includeHTML("header", `${prefix}partials/header.html`);
    await includeHTML("footer", `${prefix}partials/footer.html`);
  } catch (e) {
    console.error("❌ Include-Error:", e);
    return;
  }

  // 2) Nav‑Links (Register, Kontakt, etc.) an den aktuellen Pfad anpassen
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("/") &&
      !href.startsWith("#")
    ) {
      link.setAttribute("href", prefix + href);
    }
  });

   // Bestimme Prefix für Redirects (unterscheidet zwischen Root-Index und /sites/)
const redirectPrefix = window.location.pathname.includes("/sites/") ? "" : "sites/";
//Button wird hier eingebunden weil navVisibility.js und userAutho.js denn beide brauchen
const loginBtn = document.getElementById("login");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = `${redirectPrefix}userLogin.html`;
  });
}




  // 3) Bildpfade (z.B. Logo) anpassen
  // Header.html sollte src="res/img/logoweis.png" nutzen
  document.querySelectorAll("header img").forEach(img => {
    const src = img.getAttribute("src");
    // nur relative Pfade anpassen
    if (src && !src.startsWith("http") && !src.startsWith("/")) {
      img.src = prefix + src;
    }
  });

 
  // 4) Navbar‑Visibility 
  const navVisScript = document.createElement("script");
  navVisScript.src = `${prefix}js/navVisibility.js`;
  document.head.appendChild(navVisScript);

  // 5) Auth‑Skript nachladen (Formular‑Handling, Logout, Cookie‑Logic)
  const authScript = document.createElement("script");
  authScript.src = `${prefix}js/userAuthorization.js`;
  document.head.appendChild(authScript);

  // 6) Warenkorb‑Zähler aktualisieren, wird noch wsl geändert
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
});

// Funktion zum Einbinden von HTML‑Partials
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
