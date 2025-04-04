<?php

function getDbConnection(): mysqli { //connection can now be called via getDbConnection()
    $conn = new mysqli('localhost', 'root', '', 'webshop'); 

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $conn->set_charset("utf8");
    return $conn;
}

