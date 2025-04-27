<?php
require_once("inc/dbaccess.php");  
require_once("inc/session.php");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(["success" => false, "error" => "Database connection failed."]);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? '';

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data["action"])) {
        if ($data["action"] === "add_to_cart") {
            $userId = intval($data["user_id"]);
            $productId = intval($data["product_id"]);

            $check = $conn->prepare("SELECT id FROM cart WHERE user_id = ? AND product_id = ?");
            $check->bind_param("ii", $userId, $productId);
            $check->execute();
            $checkResult = $check->get_result();

            if ($checkResult->fetch_assoc()) {
                $update = $conn->prepare("UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?");
                $update->bind_param("ii", $userId, $productId);
                $update->execute();
            } else {
                $insert = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)");
                $insert->bind_param("ii", $userId, $productId);
                $insert->execute();
            }

            echo json_encode(["success" => true]);
            exit;
        }

        if ($data["action"] === "remove_from_cart") {
            $userId = intval($data["user_id"]);
            $productId = intval($data["product_id"]);

            $delete = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
            $delete->bind_param("ii", $userId, $productId);
            $delete->execute();

            echo json_encode(["success" => true]);
            exit;
        }

        if ($data["action"] === "change_quantity") {
            $userId = intval($data["user_id"]);
            $productId = intval($data["product_id"]);
            $change = intval($data["change"]);

            if ($change === 0) {
                echo json_encode(["success" => false, "error" => "Invalid quantity change."]);
                exit;
            }

            $update = $conn->prepare("
                UPDATE cart
                SET quantity = GREATEST(quantity + ?, 1)
                WHERE user_id = ? AND product_id = ?
            ");
            $update->bind_param("iii", $change, $userId, $productId);
            $update->execute();

            echo json_encode(["success" => true]);
            exit;
        }
    }
}

if ($method === "GET" && $action === "get_cart_count") {
    $userId = intval($_GET["user_id"] ?? 0);
    $stmt = $conn->prepare("SELECT SUM(quantity) AS total FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    echo json_encode(["count" => intval($result["total"] ?? 0)]);
    exit;
}

if ($method === "GET" && $action === "get_cart_items") {
    $userId = intval($_GET["user_id"] ?? 0);

    $stmt = $conn->prepare("
        SELECT c.product_id, c.quantity, p.product_name, p.price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $cartItems = [];
    while ($row = $result->fetch_assoc()) {
        $cartItems[] = $row;
    }

    echo json_encode($cartItems);
    exit;
}

// Fallback if no valid action
echo json_encode(["success" => false, "error" => "Invalid action"]);
exit;
?>
