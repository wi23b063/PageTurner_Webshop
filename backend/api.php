<?php

require_once("inc/dbaccess.php");
include_once("models/user.class.php");
include_once("logic/userService.php");
require_once("logic/getCustomers.php"); 

header("Content-Type: application/json");

// Start session if needed
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$api = new Api();
$api->processRequest();

class Api {

    private $userService;

    public function __construct() {
        $this->userService = new UserService();
    }

    public function processRequest() {
        $method = $_SERVER["REQUEST_METHOD"];
        switch ($method) {
            case "GET":
                $this->processGet();
                break;
            case "POST":
                $this->processPost();
                break;
            case "DELETE":
                $this->processDelete();
                break;
            default:
                $this->error(405, ["Allow: GET, POST, DELETE"], "Method not allowed");
        }
    }

    private function processGet() {
        if (empty($_GET)) {
            $this->success(200, "Hello World!");
        } else if (isset($_GET["users"])) {
            $users = $this->userService->findAll();
            $this->success(200, $users);
        } else if (isset($_GET["user"])) {
            $id = intval($_GET["user"]);
            $user = $this->userService->findByID($id);
            if ($user === null) {
                $this->error(404, [], "No such user with ID $id");
            }
            $this->success(200, $user);
        } else if (isset($_GET["checkSession"])) {
            if (isset($_SESSION['user'])) {
                $this->success(200, [
                    "user" => [
                        "id" => $_SESSION['user_id'],
                        "username" => $_SESSION['user'],
                        "firstname" => $_SESSION['firstname'],
                        "lastname" => $_SESSION['lastname'],
                        "role" => $_SESSION['role']
                    ]
                ]);
            } else {
                $this->success(200, ["user" => null]);
            }
        } 
        else if (isset($_GET["customers"])) { //  Kundenverwaltung
            try {
                $customers = getCustomers(); // Holt alle Kunden (ohne Admins)
                $this->success(200, $customers);
            } catch (Exception $e) {
                $this->error(500, [], "Fehler beim Laden der Kunden: " . $e->getMessage());
            }
        }
        else {
            $this->error(400, [], "Bad Request - invalid parameters: " . http_build_query($_GET));
        }
    }

    private function processPost() {
        $input = file_get_contents("php://input");
        $data = json_decode($input);
    
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error(400, [], "Ungültiges JSON: " . json_last_error_msg());
        }
    
        // Login
        if (isset($_GET["login"])) {
            $result = $this->userService->login($data);
            if ($result["success"]) {
                $this->success(200, [
                    "message" => "Login erfolgreich",
                    "user" => [
                        "id" => $_SESSION['user_id'],
                        "username" => $_SESSION['user'],
                        "email" => $_SESSION['email'],
                        "firstname" => $_SESSION['firstname'],
                        "lastname" => $_SESSION['lastname'],
                        "role" => $_SESSION['role']
                    ]
                ]);
            } else {
                $this->error(401, [], $result["message"]);
            }
        }
    
        // Registrierung
        else if (isset($_GET["user"])) {
            if (!$data || !is_object($data)) {
                $this->error(400, [], "Fehlerhafte Eingabedaten.");
            }
    
            // Pflichtfeld-Validierung
            $requiredFields = ["salutation", "firstname", "lastname", "email", "username", "password", "confirm_password", "postal_code", "city", "address"];
            $missing = [];
    
            foreach ($requiredFields as $field) {
                if (empty($data->$field)) {
                    $missing[] = $field;
                }
            }
    
            if (!empty($missing)) {
                $this->error(400, [], "Fehlende Felder: " . implode(", ", $missing));
            }
    
            if ($data->password !== $data->confirm_password) {
                $this->error(400, [], "Passwörter stimmen nicht überein.");
            }
    
            $errors = $this->userService->validateUserData($data);
            if (!empty($errors)) {
                $this->error(400, [], implode(" ", $errors));
            }
    
            try {
                $newUserId = $this->userService->register($data);
                $this->success(201, ["message" => "Benutzer erfolgreich registriert", "user_id" => $newUserId]);
            } catch (Exception $e) {
                $this->error(400, [], "Registrierung fehlgeschlagen: " . $e->getMessage());
            }
        }
    
        // Kundenstatus ändern
        else if (isset($_GET["updateCustomerStatus"])) {
            if (!isset($data->id) || !isset($data->newStatus)) {
                $this->error(400, [], "Ungültige Daten zur Statusänderung.");
            }
    
            $conn = getDbConnection();
            $stmt = $conn->prepare("UPDATE users SET user_status = ? WHERE id = ?");
            if (!$stmt) {
                $this->error(500, [], "Datenbankfehler beim Vorbereiten des Statements");
            }
    
            $stmt->bind_param("si", $data->newStatus, $data->id);
    
            if ($stmt->execute()) {
                $this->success(200, ["success" => true]);
            } else {
                $this->error(500, [], "Fehler beim Update: " . $conn->error);
            }
        }
    
        //Unbekannter Pfad
        else {
            $this->error(400, [], "Unbekannter POST-Endpunkt: " . http_build_query($_GET));
        }
    }
    
    

    private function processDelete() {
        if (!isset($_GET["user"])) {
            $this->error(400, [], "Bad Request - missing user ID");
        }

        $id = intval($_GET["user"]);
        $user = $this->userService->findByID($id);

        if (!$user) {
            $this->error(404, [], "No such user with ID $id");
        }

        if ($this->userService->delete($user)) {
            $this->success(200, ["message" => "User deleted", "user" => $user]);
        } else {
            $this->error(400, [], "Error deleting user");
        }
    }

    private function success(int $code, $obj) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($obj);
        exit;
    }

    private function error(int $code, array $headers, $msg) {
        http_response_code($code);
        foreach ($headers as $hdr) {
            header($hdr);
        }
        echo json_encode(["error" => $msg]);
        exit;
    }
}
