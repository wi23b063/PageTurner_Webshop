function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    cart.push(productId); 
    localStorage.setItem("cart", JSON.stringify(cart));
  
    updateCartCount();
  }
  
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.length;
  
    const countElement = document.getElementById("cart-count");
    if (countElement) {
      countElement.textContent = count;
    }
  }
  