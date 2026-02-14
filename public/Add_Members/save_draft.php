<?php
// Start session for potential user authentication
session_start();

// Include centralized database configuration
require_once __DIR__ . '/../config.php';

// $pdo, $host, $username, $password, $dbname are now available from config.php

// Function to validate email (optional for drafts)
function isValidEmail($email)
{
    return empty($email) || filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate phone number (optional for drafts)
function isValidPhone($phone)
{
    return empty($phone) || preg_match('/^[\d\s\-\+]{7,20}$/', $phone);
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => ''];

    // Validate email and phone if provided
    if (!empty($_POST['email']) && !isValidEmail($_POST['email'])) {
        $response['message'] = 'Invalid email address';
        echo json_encode($response);
        exit;
    }

    if (!empty($_POST['phone']) && !isValidPhone($_POST['phone'])) {
        $response['message'] = 'Invalid phone number';
        echo json_encode($response);
        exit;
    }

    // Handle file upload
    $photoPath = null;
    if (isset($_FILES['photoInput']) && $_FILES['photoInput']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photoInput'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxSize = 2 * 1024 * 1024; // 2MB

        if (!in_array($file['type'], $allowedTypes)) {
            $response['message'] = 'Invalid file type. Only JPG, PNG, or GIF allowed.';
            echo json_encode($response);
            exit;
        }

        if ($file['size'] > $maxSize) {
            $response['message'] = 'File size exceeds 2MB limit.';
            echo json_encode($response);
            exit;
        }

        $uploadDir = '../Uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = uniqid('draft_profile_') . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $photoPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $photoPath)) {
            $response['message'] = 'Failed to upload photo.';
            echo json_encode($response);
            exit;
        }
    }

    try {
        $pdo->beginTransaction();

        // Insert into drafts table
        $stmt = $pdo->prepare("
            INSERT INTO drafts (
                first_name, last_name, date_of_birth, gender, marital_status, occupation,
                phone, email, address, city, region, status, church_group, leadership_role,
                baptism_status, spiritual_growth, membership_type, notes, photo_path,
                emergency_name, emergency_phone, emergency_relation,
                send_welcome_email, notify_pastor, create_account
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            !empty($_POST['firstName']) ? $_POST['firstName'] : null,
            !empty($_POST['lastName']) ? $_POST['lastName'] : null,
            !empty($_POST['dateOfBirth']) ? $_POST['dateOfBirth'] : null,
            !empty($_POST['gender']) ? $_POST['gender'] : '',
            !empty($_POST['maritalStatus']) ? $_POST['maritalStatus'] : '',
            !empty($_POST['occupation']) ? $_POST['occupation'] : null,
            !empty($_POST['phone']) ? $_POST['phone'] : null,
            !empty($_POST['email']) ? $_POST['email'] : null,
            !empty($_POST['address']) ? $_POST['address'] : null,
            !empty($_POST['city']) ? $_POST['city'] : null,
            !empty($_POST['region']) ? $_POST['region'] : null,
            !empty($_POST['status']) ? $_POST['status'] : '',
            !empty($_POST['selectedMinistry']) ? $_POST['selectedMinistry'] : '',
            !empty($_POST['leadership']) ? $_POST['leadership'] : '',
            !empty($_POST['baptismStatus']) ? $_POST['baptismStatus'] : '',
            !empty($_POST['spiritualGrowth']) ? $_POST['spiritualGrowth'] : '',
            !empty($_POST['membershipType']) ? $_POST['membershipType'] : '',
            !empty($_POST['notes']) ? $_POST['notes'] : null,
            $photoPath,
            !empty($_POST['emergencyName']) ? $_POST['emergencyName'] : null,
            !empty($_POST['emergencyPhone']) ? $_POST['emergencyPhone'] : null,
            !empty($_POST['emergencyRelation']) ? $_POST['emergencyRelation'] : null,
            !empty($_POST['sendWelcomeEmail']) ? 1 : 0,
            !empty($_POST['notifyPastor']) ? 1 : 0,
            !empty($_POST['createAccount']) ? 1 : 0
        ]);

        $draftId = $pdo->lastInsertId();

        // Insert into draft_departments table
        if (!empty($_POST['departments']) && is_array($_POST['departments'])) {
            $stmt = $pdo->prepare("
                INSERT INTO draft_departments (draft_id, department_id)
                SELECT ?, department_id FROM departments WHERE department_name = ?
            ");
            foreach ($_POST['departments'] as $department) {
                $stmt->execute([$draftId, $department]);
            }
        }

        // Insert into draft_ministries table
        if (!empty($_POST['ministries']) && is_array($_POST['ministries'])) {
            $stmt = $pdo->prepare("
                INSERT INTO draft_ministries (draft_id, ministry_id)
                SELECT ?, ministry_id FROM ministries WHERE ministry_name = ?
            ");
            foreach ($_POST['ministries'] as $ministry) {
                $stmt->execute([$draftId, $ministry]);
            }
        }

        $pdo->commit();
        $response['success'] = true;
        echo json_encode($response);
    } catch (Exception $e) {
        $pdo->rollBack();
        if ($photoPath && file_exists($photoPath)) {
            unlink($photoPath); // Remove uploaded file on failure
        }
        $response['message'] = 'Failed to save draft: ' . $e->getMessage();
        echo json_encode($response);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
