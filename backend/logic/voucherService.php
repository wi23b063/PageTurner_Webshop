<?php
function validateVoucher($code, $user_id) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("SELECT value, remaining_value, expiry, used_by_user_id FROM vouchers WHERE code = ?");
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $voucher = $stmt->get_result()->fetch_assoc();

    if (!$voucher) {
        return ['success' => false, 'error' => 'Gutschein nicht gefunden'];
    }

    if (strtotime($voucher['expiry']) < time()) {
        return ['success' => false, 'error' => 'Gutschein ist abgelaufen'];
    }

    if (!is_null($voucher['used_by_user_id']) && $voucher['used_by_user_id'] != $user_id) {
        return ['success' => false, 'error' => 'Gutschein gehört einem anderen Benutzer'];
    }

    $value = is_null($voucher['remaining_value']) ? $voucher['value'] : $voucher['remaining_value'];

    return [
        'success' => true,
        'original_value' => $voucher['value'],
        'available_value' => $value
    ];
}
