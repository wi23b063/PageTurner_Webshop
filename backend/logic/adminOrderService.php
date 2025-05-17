<?php
require_once __DIR__ . '/../inc/dbaccess.php';

/**
 * Gibt alle Bestellungen eines Kunden inkl. Produkte zurück
 */
function getOrdersWithProductsByCustomer($user_id) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("SELECT order_id, order_date, total_amount, status FROM orders WHERE user_id = ? ORDER BY order_date DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $order_id = $row['order_id'];

        $stmt_items = $conn->prepare("
            SELECT p.id AS product_id, p.product_name AS name, oi.quantity
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $stmt_items->bind_param("i", $order_id);
        $stmt_items->execute();
        $items_result = $stmt_items->get_result();

        $products = [];
        while ($item = $items_result->fetch_assoc()) {
            $products[] = $item;
        }

        $row['products'] = $products;
        $orders[] = $row;
    }

    return $orders;
}

/**
 * Entfernt ein Produkt aus einer Bestellung, aktualisiert total_amount,
 * löscht Bestellung, wenn leer
 */
function removeProductFromOrder($order_id, $product_id) {
    $conn = getDbConnection();

    // 1. Aktuelle Menge abfragen
    $stmt = $conn->prepare("SELECT quantity FROM order_items WHERE order_id = ? AND product_id = ?");
    $stmt->bind_param("ii", $order_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
        return false; // Produkt nicht gefunden
    }

    $quantity = intval($row['quantity']);

    if ($quantity > 1) {
        // 2a. Menge um 1 verringern
        $stmt = $conn->prepare("UPDATE order_items SET quantity = quantity - 1 WHERE order_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $order_id, $product_id);
        $stmt->execute();
    } else {
        // 2b. Letztes Stück → Zeile löschen
        $stmt = $conn->prepare("DELETE FROM order_items WHERE order_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $order_id, $product_id);
        $stmt->execute();
    }

    // 3. Gesamtbetrag aktualisieren
    updateOrderTotal($order_id);

    // 4. Prüfen ob Bestellung leer ist
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM order_items WHERE order_id = ?");
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $count = $result->fetch_assoc()['count'] ?? 0;

    if ($count == 0) {
        // Bestellung löschen
        $stmt = $conn->prepare("DELETE FROM orders WHERE order_id = ?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
    }

    return true;
}

/**
 * Aktualisiert total_amount einer Bestellung
 */
function updateOrderTotal($order_id) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("SELECT SUM(price * quantity) AS total FROM order_items WHERE order_id = ?");
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $total = $result->fetch_assoc()['total'] ?? 0;

    $stmt = $conn->prepare("UPDATE orders SET total_amount = ? WHERE order_id = ?");
    $stmt->bind_param("di", $total, $order_id);
    $stmt->execute();
}

/**
 * Kundensuche: ID, Vorname oder Nachname
 */
function searchCustomersByNameOrId($searchTerm) {
    $conn = getDbConnection();

    $sql = "
        SELECT 
            id, 
            firstname, 
            lastname, 
            email, 
            user_status AS active
        FROM users 
        WHERE role != 'admin'
          AND (
            id = ? 
            OR firstname LIKE ? 
            OR lastname LIKE ?
        )
    ";

    $stmt = $conn->prepare($sql);
    $likeTerm = "%" . $searchTerm . "%";
    $id = is_numeric($searchTerm) ? intval($searchTerm) : 0;
    $stmt->bind_param("iss", $id, $likeTerm, $likeTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $customers = [];
    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }

    return $customers;
}

/**
 * Prüft ob Bestellung existiert
 */
function checkIfOrderDeleted($order_id) {
    $conn = getDbConnection();
    $stmt = $conn->prepare("SELECT COUNT(*) AS found FROM orders WHERE order_id = ?");
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return ($result->fetch_assoc()['found'] ?? 0) == 0;
}
