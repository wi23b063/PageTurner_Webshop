<?php
header("Content-Type: application/json");

require_once("inc/dbaccess.php");

$conn = getDbConnection(); 

$sql = "SELECT * FROM products ORDER BY id DESC LIMIT 4";
$result = $conn->query($sql);

$products = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode($products);
} else {
    http_response_code(500);
    echo json_encode(["error" => "DB Fehler: " . $conn->error]);
}

$conn->close();
?>
