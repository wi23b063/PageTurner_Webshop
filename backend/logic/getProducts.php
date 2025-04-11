<?php

require_once(__DIR__ . '/../inc/dbaccess.php');
require_once(__DIR__ . '/../models/product.class.php');

header('Content-Type: application/json');
$conn = getDbConnection();

$search = isset($_POST['search']) ? trim($_POST['search']) : '';

$sql = "
    SELECT p.*, c.category_name, 
           ROUND(AVG(r.rating), 1) AS rating
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.id = r.product_id
";

if (!empty($search)) {
    $sql .= " WHERE p.product_name LIKE '%$search%'";
}
$sql .= " GROUP BY p.id"; //


$result = $conn->query($sql);
$products = [];

while ($row = $result->fetch_assoc()) {
    $product[] = new Product(
        (int) §row['id'],
        $row['product_name'],
        $row['description'],
        (float) $row['rating']?? 0.0,
        (float) $row['price'],
        $row['image_url'],
    );
    $products[] = $product;
}

echo json_encode($products);



