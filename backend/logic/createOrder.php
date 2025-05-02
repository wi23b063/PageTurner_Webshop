<?php
require_once __DIR__ . '/../inc/dbaccess.php';

function createOrder($user_id) {
    $conn = getDbConnection();

    // Start transaction
    $conn->begin_transaction();

    try {
        // Get cart items
        $stmt = $conn->prepare("
            SELECT c.product_id, c.quantity, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");

        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cartItems = $result->fetch_all(MYSQLI_ASSOC);

        if (empty($cartItems)) {
            return ['success' => false, 'error' => 'Cart is empty'];
        }

           $totalAmount = 0;
        foreach ($cartItems as $item) {
        $totalAmount += $item['quantity'] * $item['price'];
        }

        // Create new order
        $stmt = $conn->prepare("INSERT INTO orders (user_id, order_date, total_amount) VALUES (?, NOW(), ?)");
        $stmt->bind_param("id", $user_id, $totalAmount);

        $stmt->execute();
        $order_id = $stmt->insert_id;


        // Insert order items
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($cartItems as $item) {
            $stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $item['price']);
            $stmt->execute();
        }

        // Clear cart
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        $conn->commit();
        return ['success' => true, 'order_id' => $order_id];
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Order creation failed: " . $e->getMessage());
    

        return ['success' => false, 'error' => $e->getMessage()];
    }
     finally {
        $conn->close();
    }
}
