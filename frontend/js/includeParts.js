document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const isInSites = path.includes("/sites/");
  
    const prefix = isInSites ? "../" : "";
  
    includeHTML("header", `${prefix}partials/header.html`);
    includeHTML("footer", `${prefix}partials/footer.html`);
  
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
        if (target) target.outerHTML = data;
      })
      .catch(err => console.error(`❌ Fehler beim Laden von ${file}:`, err));
  }
  