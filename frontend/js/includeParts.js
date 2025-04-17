// includeParts.js
// Lädt Header, Footer, Navbar-Visibility, Auth-Logik und Warenkorb-Zähler dynamisch auf allen Seiten

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  const prefix = path.includes("/sites/") ? "../" : "";

  // Bestimme Prefix für Redirects (unterscheidet zwischen Root-Index und /sites/)
  const redirectPrefix = path.includes("/sites/") ? "" : "sites/";

  

  try {
    // 1) Header & Footer asynchron laden
    await includeHTML("header", `${prefix}partials/header.html`);
    await includeHTML("footer", `${prefix}partials/footer.html`);

    // nachdem Header geladen hat, lade navVisibility und warte auf vollständiges Laden
    await loadScript(`${prefix}js/navVisibility.js`);

    setTimeout(() => {
      if (typeof updateNavbarVisibility === "function") {
        updateNavbarVisibility();
      }

      const loginBtn = document.getElementById("login");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          window.location.href = `${redirectPrefix}userLogin.html`;
        });
      }
    }, 50); // Verzögerung von 50ms garantiert DOM-Verfügbarkeit!


    // danach weitere Scripts laden (userAuthorization.js etc.)
    await loadScript(`${prefix}js/userAuthorization.js`);

    

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

  // 3) Bildpfade (z.B. Logo) anpassen
  document.querySelectorAll("header img").forEach(img => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("http") && !src.startsWith("/")) {
      img.src = prefix + src;
    }
  });

  // 4) Warenkorb‑Zähler aktualisieren (optional, falls vorhanden)
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
});

// Hilfsfunktion zum Laden externer JS-Scripts (fehlt aktuell noch in deinem Code!)
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
}

// Funktion zum Einbinden von HTML‑Partials (bereits vorhanden)
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
