<?php

require_once(__DIR__ . '/../inc/dbaccess.php');

class UserService {

    private $conn;

    public function __construct() {
        $this->conn = getDbConnection(); // From dbaccess.php
    }

    public function validateUserData($data) {

        if (!in_array($data->salutation ?? '', ["Male", "Female", "Diverse"], true)) {
            $errors[] = "Invalid salutation.";
        }

        if (empty($data->firstname)) $errors[] = "First name is required.";
        if (empty($data->lastname)) $errors[] = "Last name is required.";
        if (empty($data->username)) $errors[] = "Username is required.";
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email.";
        if (strlen($data->password ?? '') < 8) $errors[] = "Password must be at least 8 characters.";
        if ($data->password !== $data->confirm_password) $errors[] = "Passwords do not match.";

        if (isset($errors)) {
            throw new Exception(implode(", ", $errors));
        }
    }
        
    // REGISTER FUNCTION

    public function register($data) {
        // Check for existing username or email
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

        // Insert user
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        $role = "user";

        $stmt = $this->conn->prepare("
            INSERT INTO users (salutation, firstname, lastname, email, username, password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "sssssss",
            $data->salutation,
            $data->firstname,
            $data->lastname,
            $data->email,
            $data->username,
            $hashedPassword,
            $role
        );

        if (!$stmt->execute()) {
            throw new Exception("Registration failed: " . $stmt->error);
        }

        $insertedId = $stmt->insert_id;
        $stmt->close();

        return $insertedId;
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


    // LOGIN FUNCTION

    public function login($data) {
        require_once("inc/dbaccess.php"); // to access $conn
    
        $conn = $this->conn; //bestehende Verbinung wird genutzt!

        $response = ["success" => false, "message" => ""];
    
        $username = $data->username ?? '';
        $password = $data->password ?? '';
    
        if (empty($username) || empty($password)) {
            $response["message"] = "Username and password required.";
            return $response;
        }
    
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
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
}