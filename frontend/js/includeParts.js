document.addEventListener("DOMContentLoaded", () => {
    includeHTML("header", "header.html");
    includeHTML("footer", "footer.html");
  });
  
  function includeHTML(tagName, file) {
    fetch(file)
      .then(res => res.text())
      .then(data => {
        document.querySelector(tagName).outerHTML = data;
      })
      .catch(err => console.error(`Fehler beim Laden von ${file}:`, err));
  }