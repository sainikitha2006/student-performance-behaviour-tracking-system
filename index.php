<?php
session_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id = $_POST['id'];
    $role = $_POST['role'];
    
    try {
        switch($role) {
            case 'student':
                $stmt = $pdo->prepare("SELECT * FROM STUDENT WHERE student_id = ?");
                break;
            case 'faculty':
                $stmt = $pdo->prepare("SELECT * FROM FACULTY WHERE faculty_id = ?");
                break;
            case 'parent':
                $stmt = $pdo->prepare("SELECT * FROM PARENT WHERE parent_id = ?");
                break;
            case 'admin':
                if ($id == 'admin') {
                    $_SESSION['role'] = 'admin';
                    header("Location: admin_dashboard.php");
                    exit();
                }
                break;
        }
        
        if (isset($stmt)) {
            $stmt->execute([$id]);
            $user = $stmt->fetch();
            
            if ($user) {
                $_SESSION['user_id'] = $id;
                $_SESSION['role'] = $role;
                $_SESSION['name'] = $user['name'];
                
                switch($role) {
                    case 'student':
                        header("Location: student_dashboard.php");
                        break;
                    case 'faculty':
                        header("Location: faculty_dashboard.php");
                        break;
                    case 'parent':
                        header("Location: parent_dashboard.php");
                        break;
                }
                exit();
            } else {
                $error = "Invalid credentials";
            }
        }
    } catch(PDOException $e) {
        $error = "Error: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Performance System - Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-container">
            <h2 class="text-center mb-4">Login</h2>
            <?php if (isset($error)): ?>
                <div class="alert alert-danger"><?php echo $error; ?></div>
            <?php endif; ?>
            <form method="POST">
                <div class="mb-3">
                    <label for="role" class="form-label">Select Role</label>
                    <select class="form-select" id="role" name="role" required>
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="id" class="form-label">ID</label>
                    <input type="text" class="form-control" id="id" name="id" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div class="text-center mt-3">
                <a href="register.php" class="text-decoration-none">New Student? Register here</a>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html> 