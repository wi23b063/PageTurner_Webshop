<?php
require_once("logic/productAdminService.php");


header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

//Produkt anzeigen (GET)
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["products"])) {
    try {
        $products = getProductsForAdmin();
        echo json_encode($products);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// Produkt löschen (DELETE)
if ($_SERVER["REQUEST_METHOD"] === "DELETE" && isset($_GET["deleteProduct"])) {
    $productId = intval($_GET["deleteProduct"]);
    
    try {
        if (deleteProduct($productId)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Produkt konnte nicht gelöscht werden."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Serverfehler: " . $e->getMessage()]);
    }
    exit;
}

// Produkt erstellen (POST)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["createProduct"])) {
    try {
        if (!isset($_POST['productName'], $_POST['productDescription'], $_POST['productPrice'], $_POST['productRating'], $_FILES['productImage'])) {
            throw new Exception("Fehlende Daten für das Erstellen eines Produkts.");
        }

        $productName = $_POST['productName'];
        $description = $_POST['productDescription'];
        $price = floatval($_POST['productPrice']);
        $rating = floatval($_POST['productRating']);

        // Bild-Upload
        $uploadDir = __DIR__ . "/productpictures/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Ordner anlegen, falls nicht vorhanden
        }

        $filename = uniqid("prod_") . "_" . basename($_FILES['productImage']['name']);
        $targetFile = $uploadDir . $filename;

        if (!move_uploaded_file($_FILES['productImage']['tmp_name'], $targetFile)) {
            throw new Exception("Bild-Upload fehlgeschlagen.");
        }

        // Produkt speichern
        createProduct($productName, $description, $price, $rating, $filename);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// Fallback – Ungültiger Request
http_response_code(400);
echo json_encode(["error" => "Ungültiger Request"]);
exit;
