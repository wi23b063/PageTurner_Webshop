<?php
require_once("logic/getProducts.php");
require_once("logic/getNewestProducts.php");

header("Content-Type: application/json");

//  GET products
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["products"])) {
    $search = $_GET["search"] ?? "";
    $products = getProducts($search);
    echo json_encode($products);
    exit;
}

//  GET newest
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["newest"])) {
    $limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 4;

    try {
        $products = getNewestProducts($limit);
        echo json_encode($products);
    } catch (Exception $e) {
        http_response_code(500);
        error_log("❌ Fehler in getNewestProducts: " . $e->getMessage());
        echo json_encode(["error" => "Fehler beim Laden: " . $e->getMessage()]);
    }

    exit;
}

//  Fallback – kein gültiger Request
http_response_code(400);
echo json_encode(["error" => "Ungültiger Request"]);
exit;
