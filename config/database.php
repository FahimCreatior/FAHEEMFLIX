<?php
define('DB_SERVER', 'sql303.byethost10.com');
define('DB_USERNAME', 'b10_39157650');
define('DB_PASSWORD', '#T#mpRx2!7Y3L8m');
define('DB_NAME', 'b10_39157650_authentication');

try {
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}
?>
