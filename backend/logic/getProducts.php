<?php
require_once(__DIR__ . '/../inc/dbaccess.php');


function getProducts($search = "") {
    $conn = getDbConnection();

    $sql = "
    SELECT p.*, c.category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
";


    if (!empty($search)) {
        $sql .= " WHERE p.product_name LIKE '%" . $conn->real_escape_string($search) . "%'";
    }

    $sql .= " GROUP BY p.id";

    $result = $conn->query($sql);
    $products = [];

    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    return $products;
}
