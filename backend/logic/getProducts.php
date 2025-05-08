<?php
require_once(__DIR__ . '/../inc/dbaccess.php');
function getProducts($search = "", $categoryId = null) {
    $conn = getDbConnection();

    $sql = "
    SELECT p.*, c.category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
    ";

    if (!empty($search)) {
        $searchEscaped = $conn->real_escape_string($search);
        $sql .= " AND p.product_name LIKE '%$searchEscaped%'";
    }

    if (!empty($categoryId)) {
        $categoryId = intval($categoryId);
        $sql .= " AND p.category_id = $categoryId";
    }

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Fehler beim Laden der Produkte: " . $conn->error);
    }

    $products = [];

    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    return $products;
}


