<?php
header('Content-Type: application/json');
require_once 'logic/createOrder.php';
require_once 'inc/dbaccess.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
case 'GET':
    if (!isset($_GET['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Missing user_id']);
        exit;
    }

    $user_id = intval($_GET['user_id']);
    $conn = getDbConnection();

    $stmt = $conn->prepare("SELECT order_id, order_date, total_amount, status FROM orders WHERE user_id = ? ORDER BY order_date DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $order_id = $row['order_id'];

        // Fetch items/products for this order
        $itemStmt = $conn->prepare("
            SELECT p.product_name AS name, oi.quantity, oi.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->bind_param("i", $order_id);
        $itemStmt->execute();
        $itemResult = $itemStmt->get_result();

        $products = [];
        while ($item = $itemResult->fetch_assoc()) {
            $products[] = $item;
        }

        $row['products'] = $products;
        $orders[] = $row;
    }

    echo json_encode($orders);
    break;


    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        // Case 1: Neue Bestellung aufgeben
        if (isset($input['user_id']) && !isset($input['order_id'])) {
            $user_id = intval($input['user_id']);
            $result = createOrder($user_id);
            echo json_encode($result);
            exit;
        }

        // Case 2: Bestellung stornieren
        if (isset($input['order_id'])) {
            $order_id = intval($input['order_id']);
            $conn = getDbConnection();

            // Sicherheitsabfrage: Bestellung darf nur vom Besitzer storniert werden
            $stmt = $conn->prepare("SELECT user_id, status FROM orders WHERE order_id = ?");
            $stmt->bind_param("i", $order_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $order = $result->fetch_assoc();

            if (!$order) {
                echo json_encode(['success' => false, 'error' => 'Order not found']);
                exit;
            }

            if ($order['status'] !== 'Pending') {
                echo json_encode(['success' => false, 'error' => 'Order cannot be cancelled']);
                exit;
            }

            // Bestellung stornieren
            $stmt = $conn->prepare("UPDATE orders SET status = 'Cancelled' WHERE order_id = ?");
            $stmt->bind_param("i", $order_id);
            $stmt->execute();

            echo json_encode(['success' => true]);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'Invalid request body']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
