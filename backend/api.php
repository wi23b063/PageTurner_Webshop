<?php

require_once("inc/dbaccess.php");
include_once("models/user.class.php");
include_once("logic/userService.php");

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
        
else {
            $this->error(400, [], "Bad Request - invalid parameters: " . http_build_query($_GET));
        }
    }

    private function processPost() {
        $data = json_decode(file_get_contents("php://input"));

        // 🔐 Login flow
        if (isset($_GET["login"])) {
            $result = $this->userService->login($data);
            if ($result["success"]) {
                $this->success(200, [
                    "message" => "Login successful",
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

        // 📝 Registration flow
        else if (isset($_GET["user"])) {
            $errors = $this->userService->validateUserData($data);
            if (!empty($errors)) {
                $this->error(400, [], implode(" ", $errors));
            }

            try {
                $newUserId = $this->userService->register($data);
                $this->success(201, ["message" => "User created", "user_id" => $newUserId]);
            } catch (Exception $e) {
                $this->error(400, [], $e->getMessage());
            }
        }

        // 🤷‍♂️ Unknown POST request
        else {
            $this->error(400, [], "Bad Request - unknown path: " . http_build_query($_GET));
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


