<?php
require_once("inc/dbaccess.php");
include("inc/session.php");

header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$response = ["success" => false, "message" => ""];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $response["message"] = "Username and password required.";
        echo json_encode($response);
        exit();
    }

    try {
        $db_obj = new mysqli($host, $dbuser, $dbpassword, $database);

        if ($db_obj->connect_error) {
            throw new Exception("Database connection failed: " . $db_obj->connect_error);
        }

        $stmt = $db_obj->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user) {
            if ($user['user_status'] === 'inactive') {
                $response["message"] = "Account inactive, please contact an admin.";
            } elseif (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['firstname'] = $user['firstname'];
                $_SESSION['lastname'] = $user['lastname'];
                $_SESSION['role'] = $user['role'];

                $response["success"] = true;
            } else {
                $response["message"] = "Invalid login data.";
            }
        } else {
            $response["message"] = "Invalid login data.";
        }
    } catch (Exception $e) {
        $response["message"] = "An error has occured: " . $e->getMessage();
    }
}

echo json_encode($response);
?>
