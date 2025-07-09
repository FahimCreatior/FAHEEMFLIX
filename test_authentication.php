<?php
// test_connection.php
require_once "config/database.php";

try {
    // Test connection
    $stmt = $pdo->query("SELECT 1");
    echo "✅ Database connection successful!<br>";
    
    // Test users table
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "✅ Users table exists with $count users<br>";
    
    // Test inserting a user
    $testEmail = "test_" . time() . "@example.com";
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $result = $stmt->execute(["testuser", $testEmail, password_hash("test123", PASSWORD_DEFAULT)]);
    
    if($result) {
        echo "✅ Successfully inserted test user<br>";
        echo "Test email: $testEmail<br>";
        echo "Password: test123<br>";
    }
    
} catch(PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>