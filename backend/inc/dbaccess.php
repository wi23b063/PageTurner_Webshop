<?php

function getDbConnection(): mysqli { //connection can now be called via getDbConnection()
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    try{
    $conn = new mysqli('localhost', 'root', '', 'webshop'); 

    

    $conn->set_charset("utf8");
    return $conn;

} catch (mysqli_sql_exception $e ) {
    error_log("DB Connection Error: ". $e->getMessage());
    die("An error occurred while connecting to the database");
}
}

