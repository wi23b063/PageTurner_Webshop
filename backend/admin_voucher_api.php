<?php

require_once("inc/dbaccess.php");
require_once("logic/voucherAdminService.php");

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Gutscheine anzeigen (GET)
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["vouchers"])) {
    try {
        $vouchers = getAllVouchers();
        echo json_encode($vouchers);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// Gutschein erstellen (POST)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["createVoucher"])) {
    try {
        if (!isset($_POST["code"], $_POST["value"], $_POST["expiry"])) {
            throw new Exception("Fehlende Felder für Gutschein-Erstellung.");
        }

        $code = strtoupper(trim($_POST["code"]));
        $value = floatval($_POST["value"]);
        $expiry = $_POST["expiry"];

        createVoucher($code, $value, $expiry);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// Gutschein deaktivieren (POST)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["deactivateVoucher"])) {
    try {
        $code = $_POST["code"];
        deactivateVoucher($code);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// Gutschein reaktivieren (POST)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["reactivateVoucher"])) {
    try {
        $code = $_POST["code"];
        reactivateVoucher($code);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// Gutschein löschen (POST)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["deleteVoucher"])) {
    try {
        $code = $_POST["code"];
        deleteVoucher($code);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

http_response_code(400);
echo json_encode(["error" => "Ungültiger Request"]);
exit;
