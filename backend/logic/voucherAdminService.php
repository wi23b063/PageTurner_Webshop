<?php
require_once(__DIR__ . '/../models/voucher.class.php');
require_once(__DIR__ . '/../inc/dbaccess.php');

function getAllVouchers() {
    $conn = getDbConnection();

    $sql = "SELECT code, value, expiry, status FROM vouchers ORDER BY expiry DESC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Error while loading vouchers. Error: " . $conn->error);
    }

    $vouchers = [];
    while ($row = $result->fetch_assoc()) {
        //Hier Objektorientiert :D
        $voucher = new Voucher($row["code"], $row["value"], $row["expiry"], $row["status"]);
        $vouchers[] = $voucher->toArray();
    }

    return $vouchers;
}


function createVoucher($code, $value, $expiry) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("INSERT INTO vouchers (code, value, expiry, status) VALUES (?, ?, ?, 'active')");
    $stmt->bind_param("sds", $code, $value, $expiry);

    if (!$stmt->execute()) {
        throw new Exception("Voucher couldnt be created: " . $conn->error);
    }
}

function deactivateVoucher($code) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("UPDATE vouchers SET status = 'disabled' WHERE code = ?");
    $stmt->bind_param("s", $code);

    if (!$stmt->execute()) {
        throw new Exception("Voucher couldnt be deactivated: " . $conn->error);
    }
}

function reactivateVoucher($code) {
    $conn = getDbConnection();
    $stmt = $conn->prepare("UPDATE vouchers SET status = 'active' WHERE code = ?");
    $stmt->bind_param("s", $code);

    if (!$stmt->execute()) {
        throw new Exception("Gutschein konnte nicht reaktiviert werden: " . $conn->error);
    }
}


function deleteVoucher($code) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("DELETE FROM vouchers WHERE code = ?");
    $stmt->bind_param("s", $code);

    if (!$stmt->execute()) {
        throw new Exception("Voucher couldnt be deleted: " . $conn->error);
    }
}
