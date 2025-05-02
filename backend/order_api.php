<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

$user_id = intval($input['user_id']);

require_once 'logic/createOrder.php';

$result = createOrder($user_id);

echo json_encode($result);
?>
