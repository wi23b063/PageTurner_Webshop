<?php
require_once(__DIR__ . '/../inc/dbaccess.php');


function getProductsForAdmin() {
    $conn = getDbConnection();

    $sql = "SELECT id, product_name, description, price, rating, image_url FROM products";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception("Fehler beim Laden der Admin-Produkte: " . $conn->error);
    }

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    return $products;
}






function deleteProduct($id) {
    $conn = getDbConnection();

    

    // Optional: Bild löschen (hier noch nicht eingebaut, können wir machen)
    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Fehler beim Vorbereiten des Statements: " . $conn->error);
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        return true;
    } else {
        return false;
    }
}

function createProduct($name, $description, $price, $rating, $imageFilename) {
    $conn = getDbConnection();

    $stmt = $conn->prepare("INSERT INTO products (product_name, description, price, rating, image_url) VALUES (?, ?, ?, ?, ?)");

    $stmt->bind_param("ssdss", $name, $description, $price, $rating, $imageFilename);

    if (!$stmt->execute()) {
        throw new Exception("Produkt konnte nicht gespeichert werden: " . $conn->error);
    }
}

