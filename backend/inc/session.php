<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Für Ausloggen (NOT YET IMPLEMENTED)
/*if (isset($_GET['logout']) && $_GET['logout'] == 'true') {
    
    unset($_SESSION['user']);
    
   
    header("Location: index.php");
    exit();
}
// Logout prüfen und Session beenden
if (isset($_GET['logout']) && $_GET['logout'] === 'true') {
    session_unset();  
    session_destroy(); 
    header("Location: index.php"); 
    exit(); 
}  

*/

// Das Login wird geprüft
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

   
}

?>
