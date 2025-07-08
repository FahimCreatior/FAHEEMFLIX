<?php
session_start();

function registerUser($username, $email, $password) {
    global $pdo;
    
    $sql = "SELECT id FROM users WHERE email = :email";
    if($stmt = $pdo->prepare($sql)){
        $stmt->bindParam(":email", $email, PDO::PARAM_STR);
        if($stmt->execute()){
            if($stmt->rowCount() == 1){
                return "This email is already taken.";
            }
        }
    }
    
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO users (username, email, password) VALUES (:username, :email, :password)";
    if($stmt = $pdo->prepare($sql)){
        $stmt->bindParam(":username", $username, PDO::PARAM_STR);
        $stmt->bindParam(":email", $email, PDO::PARAM_STR);
        $stmt->bindParam(":password", $hashed_password, PDO::PARAM_STR);
        
        if($stmt->execute()){
            return true;
        }
    }
    return "Something went wrong. Please try again later.";
}

function loginUser($email, $password) {
    global $pdo;
    
    $sql = "SELECT id, username, password FROM users WHERE email = :email";
    if($stmt = $pdo->prepare($sql)){
        $stmt->bindParam(":email", $email, PDO::PARAM_STR);
        
        if($stmt->execute()){
            if($stmt->rowCount() == 1){
                if($row = $stmt->fetch()){
                    $id = $row["id"];
                    $username = $row["username"];
                    $hashed_password = $row["password"];
                    if(password_verify($password, $hashed_password)){
                        $_SESSION["loggedin"] = true;
                        $_SESSION["id"] = $id;
                        $_SESSION["username"] = $username;
                        return true;
                    } else {
                        return "Invalid password.";
                    }
                }
            } else {
                return "No account found with that email.";
            }
        }
    }
    return "Oops! Something went wrong. Please try again later.";
}

function isLoggedIn() {
    return isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true;
}

function logout() {
    $_SESSION = array();
    session_destroy();
    header("location: login.php");
    exit;
}
?>
