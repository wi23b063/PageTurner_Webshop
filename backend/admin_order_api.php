<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once 'logic/adminOrderService.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Kundensuche (ID oder Name)
        if (isset($_GET['customer_search'])) {
            $term = trim($_GET['customer_search']);
            $customers = searchCustomersByNameOrId($term);
            echo json_encode($customers);
            exit;
        }

        // Bestellungen eines Kunden laden
        if (isset($_GET['customer_id'])) {
            $user_id = intval($_GET['customer_id']);
            $orders = getOrdersWithProductsByCustomer($user_id);
            echo json_encode($orders);
            exit;
        }

        echo json_encode(['error' => 'Ungültiger GET-Parameter']);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        if (isset($input['remove_product']) && $input['remove_product'] === true) {
            $order_id = intval($input['order_id']);
            $product_id = intval($input['product_id']);

            $success = removeProductFromOrder($order_id, $product_id);
            $orderDeleted = checkIfOrderDeleted($order_id);

            echo json_encode([
                'success' => $success,
                'orderDeleted' => $orderDeleted
            ]);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'Ungültiger POST-Body']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
