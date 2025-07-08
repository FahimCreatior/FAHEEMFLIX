<?php
require_once "config/database.php";
require_once "includes/auth.php";

$signup_err = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);
    $confirm_password = trim($_POST["confirm_password"]);
    
    if ($password !== $confirm_password) {
        $signup_err = "Passwords do not match.";
    } else {
        $signup_result = registerUser($username, $email, $password);
        if ($signup_result === true) {
            header("location: login.php?registered=1");
            exit;
        } else {
            $signup_err = $signup_result;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FaheemFlix - Sign Up</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #e50914;
            --dark: #141414;
            --light: #ffffff;
            --gray: #737373;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--dark);
            color: var(--light);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .auth-container {
            background: rgba(0, 0, 0, 0.75);
            padding: 60px 68px 40px;
            border-radius: 4px;
            width: 100%;
            max-width: 450px;
            margin: 0 20px;
        }
        
        .auth-header {
            margin-bottom: 28px;
        }
        
        .auth-header h1 {
            font-size: 32px;
            font-weight: 500;
            margin-bottom: 28px;
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-group input {
            width: 100%;
            height: 50px;
            padding: 16px 20px;
            border: none;
            border-radius: 4px;
            background: #333;
            color: var(--light);
            font-size: 16px;
        }
        
        .form-group input:focus {
            outline: none;
            background: #454545;
        }
        
        .btn {
            width: 100%;
            padding: 16px;
            background: var(--primary);
            color: var(--light);
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            margin: 24px 0 12px;
        }
        
        .btn:hover {
            background: #f40612;
        }
        
        .auth-footer {
            margin-top: 16px;
            color: var(--gray);
        }
        
        .auth-footer a {
            color: var(--light);
            text-decoration: none;
        }
        
        .auth-footer a:hover {
            text-decoration: underline;
        }
        
        .error-message {
            color: #e87c03;
            font-size: 14px;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-header">
            <h1>Sign Up</h1>
        </div>
        <?php 
        if(!empty($signup_err)){
            echo '<div class="error-message">' . $signup_err . '</div>';
        }        
        ?>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group">
                <input type="text" name="username" placeholder="Username" required>
            </div>
            <div class="form-group">
                <input type="email" name="email" placeholder="Email" required>
            </div>
            <div class="form-group">
                <input type="password" name="password" placeholder="Password" required>
            </div>
            <div class="form-group">
                <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            </div>
            <button type="submit" class="btn">Sign Up</button>
        </form>
        <div class="auth-footer">
            <p>Already have an account? <a href="login.php">Sign in now</a>.</p>
        </div>
    </div>
</body>
</html>
