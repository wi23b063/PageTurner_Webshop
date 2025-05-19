<?php
require_once __DIR__ . '/../inc/dbaccess.php';


function createOrder($user_id, $coupon_code = null, $payment_method = null) {
    $conn = getDbConnection();
    $conn->begin_transaction();

    try {
        // Cart abrufen
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

        // 🧾 Gutschein prüfen
        $discount = 0;
        $voucher_id = null;
        if (!empty($coupon_code)) {
            $stmt = $conn->prepare("SELECT id, value, remaining_value, expiry  FROM vouchers WHERE code = ? AND (used_by_user_id IS NULL OR used_by_user_id = ?)");
            $stmt->bind_param("si", $coupon_code, $user_id);
            $stmt->execute();
            $voucher = $stmt->get_result()->fetch_assoc();

            if (!$voucher) {
                return ['success' => false, 'error' => 'Gutschein ungültig'];
            }

            if (strtotime($voucher['expiry']) < time()) {
                return ['success' => false, 'error' => 'Gutschein ist abgelaufen'];
            }

            $remaining = $voucher['remaining_value'];

            // Falls remaining_value NULL ist, auf value zurückfallen
            if (is_null($remaining)) {
                $remaining = $voucher['value'];
            }

            $discount = min($remaining, $totalAmount);

            $voucher_id = $voucher['id'];
        }

        // Zahlungsmethode prüfen (falls Rest bleibt)
        $payable = $totalAmount - $discount;
        if ($payable > 0 && empty($payment_method)) {
            return ['success' => false, 'error' => 'Bitte Zahlungsmethode angeben'];
        }

        // Bestellung anlegen
        $stmt = $conn->prepare("
            INSERT INTO orders (user_id, order_date, total_amount, payment_method, voucher_id, status)
            VALUES (?, NOW(), ?, ?, ?, 'Pending')
        ");
        $stmt->bind_param("idsi", $user_id, $payable, $payment_method, $voucher_id);
        $stmt->execute();
        $order_id = $stmt->insert_id;

        // Positionen einfügen
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($cartItems as $item) {
            $stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $item['price']);
            $stmt->execute();
        }

        // Warenkorb leeren
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        // Gutschein aktualisieren
        if ($voucher_id) {
            $rest = $voucher['remaining_value'] - $discount;

            if ($rest <= 0) {
                $stmt = $conn->prepare("UPDATE vouchers SET remaining_value = 0, used_by_user_id = ? WHERE id = ?");
                $stmt->bind_param("ii", $user_id, $voucher_id);
            } else {
                $stmt = $conn->prepare("UPDATE vouchers SET remaining_value = ? WHERE id = ?");
                $stmt->bind_param("di", $rest, $voucher_id);
                $stmt->execute();

                $stmt = $conn->prepare("UPDATE vouchers SET used_by_user_id = ? WHERE id = ?");
                $stmt->bind_param("ii", $user_id, $voucher_id);
            }

            $stmt->execute();
        }

        $conn->commit();
        return ['success' => true, 'order_id' => $order_id];

    } catch (Exception $e) {
    $conn->rollback();
    error_log("Fehler bei Bestellung: " . $e->getMessage());
    return ['success' => false, 'error' => $e->getMessage()];
    } finally {
        $conn->close();
    }
}
