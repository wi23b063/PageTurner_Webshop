<?php
header('Content-Type: application/json');
require_once 'inc/dbaccess.php';
require_once 'logic/voucherService.php';

$input = json_decode(file_get_contents("php://input"), true);
$code = $input['code'] ?? null;
$user_id = $input['user_id'] ?? null;

if (!$code) {
    echo json_encode(['success' => false, 'error' => 'Kein Gutscheincode angegeben']);
    exit;
}

$result = validateVoucher($code, $user_id);
echo json_encode($result);
