<?php
require_once(__DIR__ . '/../inc/dbaccess.php');


function getNewestProducts($limit = 4) {
    $conn = getDbConnection();

    $sql = "
    SELECT p.*, c.category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
    LIMIT ?
";


    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $limit);
    $stmt->execute();

    $result = $stmt->get_result();
    $products = [];

    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    return $products;
}
