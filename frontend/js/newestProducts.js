document.addEventListener("DOMContentLoaded", () => {
  fetch("../backend/getNewestProducts.php")



      .then(res => res.json())
      .then(products => {
        const container = document.getElementById("newest-books");
        container.innerHTML = ""; // leeren bevor neue geladen werden
  
        if (!Array.isArray(products) || products.length === 0) {
          container.innerHTML = "<p>Keine Produkte gefunden.</p>";
          return;
        }
  
        products.forEach(p => {
          container.innerHTML += `
            <div class="product">
              <h3>${p.product_name}</h3>
                <img src="img/${p.image_url}" alt="${p.product_name}" />
              <p><strong>Preis:</strong> €${parseFloat(p.price).toFixed(2)}</p>
             
            </div>
          `;
        });
      })
      .catch(err => {
        console.error("Fehler beim Laden:", err);
        document.getElementById("newest-books").innerHTML =
          "<p>Fehler beim Laden der Produkte.</p>";
      });
  });
  