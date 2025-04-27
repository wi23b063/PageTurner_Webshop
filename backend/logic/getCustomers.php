<?php
require_once(__DIR__ . '/../inc/dbaccess.php');

function getCustomers() {
  $conn = getDbConnection();

  $sql = "
    SELECT 
      id, 
      firstname, 
      lastname, 
      email, 
      user_status AS active
    FROM users 
    WHERE role != 'admin'
  ";

  $result = $conn->query($sql);
  if (!$result) {
    throw new Exception("Fehler beim Laden der Kunden: " . $conn->error);
  }

  $customers = [];
  while ($row = $result->fetch_assoc()) {
    $customers[] = $row;
  }

  return $customers;
}
