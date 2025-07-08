<?php
require_once "config/database.php";
require_once "includes/auth.php";

// Check if user is logged in, if not redirect to login page
if (!isLoggedIn()) {
    header("location: login.php");
    exit;
}

// Get username for display
$username = $_SESSION["username"];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#e50914">
    <meta name="description" content="Stream your favorite movies and shows on FaheemFlix">
    
    <!-- PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="FaheemFlix">
    <meta name="application-name" content="FaheemFlix">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="msapplication-TileColor" content="#e50914">
    <meta name="msapplication-config" content="/browserconfig.xml">
    
    <title>FaheemFlix - Welcome, <?php echo htmlspecialchars($username); ?></title>
    
    <!-- Manifest and Icons -->
    <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        /* Your existing CSS styles here */
        /* ... */
        
        /* Add a welcome message */
        .welcome-message {
            color: white;
            margin-right: 20px;
            font-size: 16px;
        }
        
        .logout-btn {
            background: #e50914;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .logout-btn:hover {
            background: #f40612;
        }
        
        .user-nav {
            display: flex;
            align-items: center;
        }
    </style>
</head>
<body>
    <header class="header">
        <a href="#" class="logo">FAHEEMFLIX</a>
        <div class="user-nav">
            <span class="welcome-message">Welcome, <?php echo htmlspecialchars($username); ?></span>
            <a href="logout.php" class="logout-btn">Sign Out</a>
        </div>
    </header>
    
    <!-- Rest of your HTML content -->
    
    <!-- Your existing scripts -->
    <script type="module" src="js/app.js"></script>
</body>
</html>
