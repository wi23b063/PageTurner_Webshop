
<?php
$conn = new mysqli('localhost', 'root', '', 'pageturner_webshop');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>
