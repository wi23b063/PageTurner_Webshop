<?php

require_once(__DIR__ . '/../inc/dbaccess.php');

class UserService {

    private $conn;

    public function __construct() {
        $this->conn = getDbConnection();
    }

    public function validateUserData($data) {
        $errors = [];

        if (!in_array($data->salutation ?? '', ["Male", "Female", "Diverse"], true)) {
            $errors[] = "Invalid salutation.";
        }

        if (empty($data->firstname)) $errors[] = "First name is required.";
        if (empty($data->lastname)) $errors[] = "Last name is required.";
        if (empty($data->username)) $errors[] = "Username is required.";
        if (!filter_var($data->email ?? '', FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email.";
        if (strlen($data->password ?? '') < 8) $errors[] = "Password must be at least 8 characters.";
        if (($data->password ?? '') !== ($data->confirm_password ?? '')) $errors[] = "Passwords do not match.";
        if (!preg_match('/^\d{4}$/', $data->postal_code ?? '')) $errors[] = "Postal code must be exactly 4 digits.";
        if (empty($data->city)) $errors[] = "City is required.";
        if (empty($data->address)) $errors[] = "Address is required.";

        if (!empty($errors)) {
            throw new Exception(implode(", ", $errors));
        }
    }

    public function register($data) {
        $stmt = $this->conn->prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $data->username, $data->email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($existingUsername, $existingEmail);
            while ($stmt->fetch()) {
                if ($existingUsername === $data->username) {
                    throw new Exception("Username already taken.");
                }
                if ($existingEmail === $data->email) {
                    throw new Exception("Email already registered.");
                }
            }
        }
        $stmt->close();

        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        $role = "user";
        $status = "active";

        $stmt = $this->conn->prepare("
            INSERT INTO users (salutation, firstname, lastname, email, username, password, role, postal_code, city, address, user_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "sssssssssss",
            $data->salutation,
            $data->firstname,
            $data->lastname,
            $data->email,
            $data->username,
            $hashedPassword,
            $role,
            $data->postal_code,
            $data->city,
            $data->address,
            $status
        );

        if (!$stmt->execute()) {
            throw new Exception("Registration failed: " . $stmt->error);
        }

        $insertedId = $stmt->insert_id;
        $stmt->close();

        return $insertedId;
    }

    public function login($data) {
        $response = ["success" => false, "message" => ""];

        $username = trim($data->username ?? '');
        $password = trim($data->password ?? '');

        if (empty($username) || empty($password)) {
            $response["message"] = "Username and password required.";
            return $response;
        }

        $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user) {
            if ($user['user_status'] === 'inactive') {
                $response["message"] = "Account inactive, please contact an admin.";
            } elseif (password_verify($password, $user['password'])) {
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }

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

        return $response;
    }

    public function findAll() {
        $result = $this->conn->query("SELECT * FROM users");
        $users = [];

        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }

        return $users;
    }

    public function findByID($id) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        $stmt->close();
        return $user;
    }

    public function delete($user) {
        $stmt = $this->conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['id']);
        return $stmt->execute();
    }

    public function updateProfile($userId, $data) {
    $user = $this->findByID($userId);
    if (!$user) {
        throw new Exception("User not found.");
    }

    $allowedFields = [
        'salutation' => 's',
        'firstname' => 's',
        'lastname' => 's',
        'email' => 's',
        'username' => 's',
        'postal_code' => 's',
        'city' => 's',
        'address' => 's',
    ];

    $fieldsToUpdate = [];
    $params = [];
    $types = '';

    // For password handling (optional)
    $hashedPassword = $user['password'];
    if (!empty($data->password)) {
        if (empty($data->old_password) || !password_verify($data->old_password, $user['password'])) {
            throw new Exception("Old password incorrect.");
        }
        if ($data->password !== ($data->confirm_password ?? '')) {
            throw new Exception("Passwords do not match.");
        }
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
    }

    foreach ($allowedFields as $field => $type) {
        if (property_exists($data, $field) && $data->$field !== null && $data->$field !== '') {
            if ($field === "email") {
                if (!filter_var($data->$field, FILTER_VALIDATE_EMAIL)) {
                    throw new Exception("Invalid email format.");
                }
            }
            $fieldsToUpdate[] = "$field = ?";
            $params[] = $data->$field;
            $types .= $type;
        } else {
            // keep old value if not provided or empty
            $fieldsToUpdate[] = "$field = ?";
            $params[] = $user[$field];
            $types .= $type;
        }
    }

    // Add password field to update
    $fieldsToUpdate[] = "password = ?";
    $params[] = $hashedPassword;
    $types .= 's';

    $params[] = $userId;
    $types .= 'i';

    $sql = "UPDATE users SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";

    $stmt = $this->conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $this->conn->error);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception("Profile update failed: " . $stmt->error);
    }

    return true;
}
};
