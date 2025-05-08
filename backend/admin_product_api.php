<?php
require_once("inc/dbaccess.php");
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

//Produkt laden beim Produkt Bearbeitungsformular (GET)
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["getProduct"])) {
    try {
        $id = intval($_GET["getProduct"]);
        $conn = getDbConnection();
        $stmt = $conn->prepare("SELECT id, product_name, description, price, rating, image_url, category_id FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Produkt nicht gefunden"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

//update Produkt (POST)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["updateProduct"])) {
    try {
        $id = intval($_GET["updateProduct"]);
        if (!$id || !isset($_POST['productName'], $_POST['productDescription'], $_POST['productPrice'], $_POST['productRating'], $_POST['productCategory'])) {
            throw new Exception("Fehlende Felder für Update.");
        }

        $productName = $_POST['productName'];
        $description = $_POST['productDescription'];
        $price = floatval($_POST['productPrice']);
        $rating = floatval($_POST['productRating']);
        $categoryId = intval($_POST['productCategory']);

        $conn = getDbConnection();

        // Wenn Bild neu hochgeladen wurde
        if (!empty($_FILES['productImage']['name'])) {
            $uploadDir = __DIR__ . "/productpictures/";
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $filename = uniqid("prod_") . "_" . basename($_FILES['productImage']['name']);
            $targetFile = $uploadDir . $filename;

            if (!move_uploaded_file($_FILES['productImage']['tmp_name'], $targetFile)) {
                throw new Exception("Bild-Upload fehlgeschlagen.");
            }

            $stmt = $conn->prepare("UPDATE products SET product_name = ?, description = ?, price = ?, rating = ?, image_url = ?, category_id = ? WHERE id = ?");
            $stmt->bind_param("ssds sii", $productName, $description, $price, $rating, $filename, $categoryId, $id);
        } else {
            $stmt = $conn->prepare("UPDATE products SET product_name = ?, description = ?, price = ?, rating = ?, category_id = ? WHERE id = ?");
            $stmt->bind_param("ssdsii", $productName, $description, $price, $rating, $categoryId, $id);
        }

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            throw new Exception("Update fehlgeschlagen: " . $conn->error);
        }
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
        if (!isset($_POST['productName'], $_POST['productDescription'], $_POST['productPrice'], $_POST['productRating'], $_POST['productCategory'], $_FILES['productImage'])) {
            throw new Exception("Fehlende Daten für das Erstellen eines Produkts.");
        }

        $productName = $_POST['productName'];
        $description = $_POST['productDescription'];
        $price = floatval($_POST['productPrice']);
        $rating = floatval($_POST['productRating']);
        $categoryId = intval($_POST['productCategory']);

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
        createProduct($productName, $description, $price, $rating, $filename, $categoryId);
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
