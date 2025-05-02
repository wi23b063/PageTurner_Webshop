async function addToCart(productId) {
  // Check if user is logged in
  const userId = await getLoggedInUserId() || 0;  // Default to 0 if not logged in

  fetch("/PageTurner/PageTurner_Webshop/backend/cart_api.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "add_to_cart",
      user_id: userId,  // Pass user_id (0 if guest)
      product_id: productId,
      quantity: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    if (userId===0) {
      alert("You are currently not logged in. Please log in to access the cart.");
      return;
    }
    if (data.success) {
      updateCartCountFromBackend(userId); // Update cart count
      console.log("Produkt reingelegt als UserID:", userId);
      alert("Item has been added to cart!");
    } else {
      alert("Fehler: " + (data.error || "Unbekannter Fehler"));
    }
  })
  .catch(err => {
    console.error("AJAX Fehler:", err);
    alert("Netzwerkfehler beim Hinzufügen zum Warenkorb.");
  });
}

  
function updateCartCountFromBackend(userId) {
  fetch(`/PageTurner/PageTurner_Webshop/backend/cart_api.php?action=get_cart_count&user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      const count = data.count ?? 0;
      const countElement = document.getElementById("cart-count");
      if (countElement) {
        countElement.textContent = count;
      }
    })
    .catch(err => console.error("Fehler beim Abrufen der Warenkorbanzahl:", err));
}


function getLoggedInUserId() {
  return fetch("/PageTurner/PageTurner_Webshop/backend/auth_api.php")
    .then(res => res.json())
    .then(data => data.user_id)
    .catch(err => {
      
      console.error("Fehler beim Abrufen der User-ID:", err);
      return null;
    });
}

document.addEventListener("DOMContentLoaded", function() {
  loadCartItems();
});


function loadCartItems() {
  console.log("🛒 Warenkorb wird geladen...");

  getLoggedInUserId().then(userId => {
    if (!userId) userId = 0; // default to 0 for guest

    fetch(`/PageTurner/PageTurner_Webshop/backend/cart_api.php?action=get_cart_items&user_id=${userId}`)
      .then(res => res.json())
      .then(cartItems => {
        const container = document.getElementById("cart-items");
        container.innerHTML = "";

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          container.innerHTML = "<p>Your cart is empty.</p>";
          const totalAmountElement = document.getElementById("cart-total-amount");
          const cartItemCountElement = document.getElementById("cart-item-count");
          if (totalAmountElement) totalAmountElement.textContent = "0,00€";
          if (cartItemCountElement) cartItemCountElement.textContent = "0";
          return;
        }

        let total = 0;
        let totalItems = 0;

        cartItems.forEach(item => {
          total += item.price * item.quantity;
          totalItems += item.quantity;

          container.innerHTML += `
            <div class="cart-card" data-product-id="${item.product_id}">
              <h3>${item.product_name}</h3>
              <p><strong>Preis:</strong> €${parseFloat(item.price).toFixed(2)}</p>
              <p><strong>Menge:</strong> 
                <button class="decrease-quantity">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase-quantity">+</button>
              </p>
              <p><strong>Zwischensumme:</strong> €${(item.price * item.quantity).toFixed(2)}</p>
              <button class="remove-button">Entfernen</button>
            </div>
          `;
        });

        const totalAmountElement = document.getElementById("cart-total-amount");
        const cartItemCountElement = document.getElementById("cart-item-count");
        if (totalAmountElement) totalAmountElement.textContent = total.toFixed(2) + "€";
        if (cartItemCountElement) cartItemCountElement.textContent = totalItems;

        
        container.querySelectorAll(".remove-button").forEach(button => {
          button.addEventListener("click", function() {
            const productId = this.parentElement.getAttribute("data-product-id");
            removeFromCart(productId);
          });
        });

        container.querySelectorAll(".increase-quantity").forEach(button => {
          button.addEventListener("click", function() {
            const productId = this.parentElement.parentElement.getAttribute("data-product-id");
            changeCartQuantity(productId, 1);
          });
        });

        container.querySelectorAll(".decrease-quantity").forEach(button => {
          button.addEventListener("click", function() {
            const productId = this.parentElement.parentElement.getAttribute("data-product-id");
            changeCartQuantity(productId, -1);
          });
        });
      })
      .catch(err => {
        console.error("Error while loading cart:", err);
        document.getElementById("cart-items").innerHTML =
          "<p>Eror while loading cart.</p>";
      });
  });
}


function removeFromCart(productId) {
  getLoggedInUserId().then(userId => {
    if (!userId) userId = 0;

    fetch("/PageTurner/PageTurner_Webshop/backend/cart_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "remove_from_cart",
        user_id: userId,
        product_id: productId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadCartItems(); // Reload cart
        updateCartCountFromBackend(userId); // Update cart count at top
      } else {
        alert("Error while removing from cart");
      }
    })
    .catch(err => console.error("Error while removing from cart", err));
  });
}


function changeCartQuantity(productId, change) {
  getLoggedInUserId().then(userId => {
    if (!userId) userId = 0;

    fetch("/PageTurner/PageTurner_Webshop/backend/cart_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "change_quantity",
        user_id: userId,
        product_id: productId,
        change: change
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadCartItems(); // Reload cart view
        updateCartCountFromBackend(userId); // Update cart icon at top
      } else {
        alert("Error while updating amount.");
      }
    })
    .catch(err => console.error("Error while updating amount", err));
  });
}


  