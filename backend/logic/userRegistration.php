<?php
require_once("inc/dbaccess.php"); //require_once when file inclution critical

header("Content-Type: application/json");

$conn = new mysqli($host, $dbuser, $dbpassword, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}


$response = ["status" => "error", "message" => "Invalid request."];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $conn = new mysqli("localhost", "root", "", "webshop");

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $salutation = htmlspecialchars($_POST["salutation"] ?? '');
    $firstName = htmlspecialchars(trim($_POST["firstname"] ?? ''));
    $lastName = htmlspecialchars(trim($_POST["lastname"] ?? ''));
    $username = htmlspecialchars(trim($_POST["username"] ?? ''));
    $email = htmlspecialchars(trim($_POST["email"] ?? ''));
    $password = $_POST["password"] ?? '';
    $confirmPassword = $_POST["confirm_password"] ?? '';

    $errors = [];

    // Validation
    if (empty($salutation) || !in_array($salutation, ["Male", "Female", "Diverse"], true)) {
        $errors[] = "Please enter a valid salutation.";
    }
    if (empty($firstName)) {
        $errors[] = "Please enter your first name.";
    }
    if (empty($lastName)) {
        $errors[] = "Please enter your last name.";
    }
    if (empty($username)) {
        $errors[] = "Please enter your username.";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please enter a valid email address.";
    }
    if (strlen($password) < 8) {
        $errors[] = "The password must be at least 8 characters long.";
    }
    if ($password !== $confirmPassword) {
        $errors[] = "The passwords do not match.";
    }

    // Check for duplicate username and email
    $stmt = $conn->prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");
    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($dbUsername, $dbEmail);
        while ($stmt->fetch()) {
            if ($dbUsername === $username) $errors[] = "'$username' is already used.";
            if ($dbEmail === $email) $errors[] = "'$email' is already used.";
        }
    }
    $stmt->close();

    if (empty($errors)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $defaultRole = "user";

        // Insert into database
        $stmt = $conn->prepare("INSERT INTO users (salutation, firstname, lastname, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)");

        if (!$stmt) {
            die("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("sssssss", $salutation, $firstName, $lastName, $email, $username, $hashedPassword, $defaultRole);

        if ($stmt->execute()) {
            $response = ["status" => "success", "message" => "Registration successful."];
        } else {
            $response = ["status" => "error", "message" => "Registration failed: " . $stmt->error];
        }

        $stmt->close();
    } else {
        $response = ["status" => "error", "message" => implode("<br>", $errors)];
    }

    header("Content-Type: application/json");
    echo json_encode($response);
    exit;
}

$conn->close();
    echo json_encode($response);  


?>