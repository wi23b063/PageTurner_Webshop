document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("payment-button");

    button.addEventListener("click", async function () {
        try {
            const authResponse = await fetch('../../backend/auth_api.php');
            const authData = await authResponse.json();
            const userId = authData.user_id;

            console.log("✅ authData:", authData);


            if (!userId || userId === 0) {
                alert("You must be logged in to place an order.");
                return;
            }

            // Gutschein- und Zahlungsmethode auslesen
            const couponCode = document.getElementById("coupon-code").value.trim();
            const paymentMethod = document.getElementById("payment-method").value.trim();

            console.log("Sending order with:", {
                userId,
                couponCode,
                paymentMethod
                });



            const orderResponse = await fetch('../../backend/order_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    coupon_code: couponCode !== "" ? couponCode : null,
                    payment_method: paymentMethod !== "" ? paymentMethod : null
                })
            });

            const responseText = await orderResponse.text();
            console.log("Raw Response from Order API:", responseText);

            const result = JSON.parse(responseText);

            if (result.success) {
                alert("Order placed successfully!");

                const cartContainer = document.getElementById("cart-items");
                if (cartContainer) {
                    cartContainer.innerHTML = "<p>Your cart is now empty.</p>";
                }
                const cartCount = document.getElementById("cart-item-count");
                if (cartCount) {
                    cartCount.textContent = "0";
                }
                const totalAmount = document.getElementById("cart-total-amount");
                if (totalAmount) {
                    totalAmount.textContent = "0,00€";
                }
            } else {
                alert("Order failed: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An unexpected error occurred.");
        }
    });
});
