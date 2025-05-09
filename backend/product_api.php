<?php
require_once("logic/getProducts.php");
require_once("logic/getNewestProducts.php");

header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

//  GET products
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["products"])) {
    $search = $_GET["search"] ?? "";
    $categoryId = $_GET["category_id"] ?? null;
    $products = getProducts($search, $categoryId);

    echo json_encode($products);
    exit;
}

// GET categories
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["categories"])) {
    $conn = getDbConnection();

    $sql = "SELECT id, category_name FROM categories ORDER BY category_name ASC";
    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Datenbankfehler: " . $conn->error]);
        exit;
    }

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    echo json_encode($categories);
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
