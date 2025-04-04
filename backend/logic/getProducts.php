<?php

require_once(__DIR__ . '/../inc/dbaccess.php');


header('Content-Type: application/json');

$sql = "
    SELECT p.*, c.category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
";

$result = $conn->query($sql);
$products = [];

while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);


?>
