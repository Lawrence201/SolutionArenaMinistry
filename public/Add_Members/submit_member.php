<?php
// Start session for potential user authentication
session_start();

// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Log errors to file
ini_set('log_errors', 1);
ini_set('error_log', 'C:/xampp/php/logs/php_error_log');

// Include centralized database configuration
require_once __DIR__ . '/../config.php';

// $pdo, $host, $username, $password, $dbname are now available from config.php

// Function to validate email
function isValidEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate phone number
function isValidPhone($phone)
{
    return preg_match('/^[\d\s\-\+]{7,20}$/', $phone);
}

// Function to get valid department names from the database
function getValidDepartments($pdo)
{
    $stmt = $pdo->query("SELECT department_name FROM departments");
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => '', 'redirect' => ''];

    // Log all received POST and FILES data for debugging
    error_log('Received POST data: ' . print_r($_POST, true));
    error_log('Received FILES data: ' . print_r($_FILES, true));

    // Required fields validation
    $requiredFields = ['firstName', 'lastName', 'phone', 'email', 'status', 'selectedMinistry'];
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
            $response['message'] = ucfirst(str_replace('selectedMinistry', 'church group', $field)) . ' is required';
            error_log('Validation failed: ' . $response['message']);
            echo json_encode($response);
            exit;
        }
    }

    // Validate specific fields
    if (!isValidEmail($_POST['email'])) {
        $response['message'] = 'Invalid email address';
        error_log('Validation failed: Invalid email address');
        echo json_encode($response);
        exit;
    }

    if (!isValidPhone($_POST['phone'])) {
        $response['message'] = 'Invalid phone number';
        error_log('Validation failed: Invalid phone number');
        echo json_encode($response);
        exit;
    }

    // Validate church_group (case-insensitive)
    $validChurchGroups = ['Dunamis', 'Kabod', 'Judah', 'Karis'];
    $churchGroup = trim($_POST['selectedMinistry']);

    // Check case-insensitive match
    $churchGroupLower = strtolower($churchGroup);
    $validGroupsLower = array_map('strtolower', $validChurchGroups);

    if (!in_array($churchGroupLower, $validGroupsLower)) {
        $response['message'] = 'Invalid church group selected: ' . htmlspecialchars($churchGroup);
        error_log('Validation failed: Invalid church group - ' . $churchGroup);
        echo json_encode($response);
        exit;
    }

    // Get the correct capitalized version from valid groups
    $churchGroupIndex = array_search($churchGroupLower, $validGroupsLower);
    $churchGroup = $validChurchGroups[$churchGroupIndex];

    // Validate spiritual_growth - Form sends correct DB format already!
    $validSpiritualGrowth = ['New believer', 'Growing', 'Committed', 'Leader', ''];
    $spiritualGrowth = trim($_POST['spiritualGrowth'] ?? '');

    // If not in valid list, try mapping common variations
    if (!in_array($spiritualGrowth, $validSpiritualGrowth)) {
        $spiritualGrowthLower = strtolower($spiritualGrowth);
        $spiritualGrowthMap = [
            'new believer' => 'New believer',
            'new_believer' => 'New believer',
            'growing' => 'Growing',
            'committed' => 'Committed',
            'leader' => 'Leader'
        ];
        $spiritualGrowth = $spiritualGrowthMap[$spiritualGrowthLower] ?? '';

        if (!empty($_POST['spiritualGrowth']) && empty($spiritualGrowth)) {
            $response['message'] = 'Invalid spiritual growth level selected: ' . htmlspecialchars($_POST['spiritualGrowth']);
            error_log('Validation failed: Invalid spiritual growth - ' . ($_POST['spiritualGrowth'] ?? 'none'));
            echo json_encode($response);
            exit;
        }
    }

    // Validate status - Map to DB enum (Active/Inactive)
    $statusMap = [
        'active' => 'Active',
        'inactive' => 'Inactive'
    ];
    $statusInput = strtolower($_POST['status'] ?? '');
    if (empty($_POST['status']) || !isset($statusMap[$statusInput])) {
        $response['message'] = 'Invalid status selected';
        error_log('Validation failed: Invalid status - ' . ($_POST['status'] ?? 'none'));
        echo json_encode($response);
        exit;
    }
    $status = $statusMap[$statusInput];

    // Validate gender - Map to DB enum (Male/Female)
    $genderMap = [
        'male' => 'Male',
        'female' => 'Female',
        '' => ''
    ];
    $genderInput = strtolower($_POST['gender'] ?? '');
    $gender = $genderMap[$genderInput] ?? '';

    // Validate marital status - Map to DB enum
    $maritalStatusMap = [
        'single' => 'Single',
        'married' => 'Married',
        'divorced' => 'Divorced',
        'widowed' => 'Widowed',
        '' => ''
    ];
    $maritalInput = strtolower($_POST['maritalStatus'] ?? '');
    $maritalStatus = $maritalStatusMap[$maritalInput] ?? '';

    // Validate baptism status - Form sends correct DB format already!
    $validBaptismStatuses = ['Baptized', 'Not baptized', 'Pending', ''];
    $baptismStatus = trim($_POST['baptismStatus'] ?? '');

    // If not in valid list, try mapping common variations
    if (!in_array($baptismStatus, $validBaptismStatuses)) {
        $baptismLower = strtolower($baptismStatus);
        $baptismStatusMap = [
            'baptized' => 'Baptized',
            'not baptized' => 'Not baptized',
            'not_baptized' => 'Not baptized',
            'pending' => 'Pending'
        ];
        $baptismStatus = $baptismStatusMap[$baptismLower] ?? '';
    }

    // Validate membership type - Form sends correct DB format already!
    $validMembershipTypes = ['Full Member', 'Associate Member', 'Visitor', ''];
    $membershipType = trim($_POST['membershipType'] ?? '');

    // If not in valid list, try case-insensitive match
    if (!in_array($membershipType, $validMembershipTypes)) {
        $membershipLower = strtolower($membershipType);
        $membershipTypeMap = [
            'full member' => 'Full Member',
            'associate member' => 'Associate Member',
            'visitor' => 'Visitor',
            'full' => 'Full Member',
            'associate' => 'Associate Member'
        ];
        $membershipType = $membershipTypeMap[$membershipLower] ?? '';
    }

    // Validate leadership role - Map to DB enum
    $leadershipRoleMap = [
        'none' => 'None',
        'pastor' => 'Pastor',
        'minister' => 'Minister',
        'group_leader' => 'Group leader',
        'group leader' => 'Group leader'
    ];
    $leadershipInput = strtolower($_POST['leadership'] ?? 'none');
    $leadershipRole = $leadershipRoleMap[$leadershipInput] ?? 'None';

    // Validate departments against database
    $validDepartments = getValidDepartments($pdo);
    $departments = [];
    if (!empty($_POST['departments']) && is_array($_POST['departments'])) {
        foreach ($_POST['departments'] as $dept) {
            if (in_array($dept, ['None', 'Usher', 'Choir', 'Media', 'Instrumentalist']) && in_array($dept, $validDepartments)) {
                $departments[] = $dept;
            } elseif ($dept !== 'none' && !in_array($dept, $validDepartments)) {
                $response['message'] = "Department '$dept' not found in departments table";
                error_log("Validation failed: Department '$dept' not found in database");
                echo json_encode($response);
                exit;
            }
        }
    }
    if (in_array('none', $departments) && count($departments) > 1) {
        $departments = ['none']; // Enforce mutual exclusivity
    }

    // Validate ministries - Map to DB enum (Children, Women, Men, Youth - capitalized!)
    $ministryMap = [
        'children-ministry' => 'Children',
        'women-ministry' => 'Women',
        'men-ministry' => 'Men',
        'youth-ministry' => 'Youth'
    ];
    $ministries = [];
    if (!empty($_POST['ministries']) && is_array($_POST['ministries'])) {
        foreach ($_POST['ministries'] as $ministry) {
            if (isset($ministryMap[$ministry])) {
                $ministries[] = $ministryMap[$ministry];
            }
        }
    }

    // Handle file upload
    $photoPath = null;
    if (isset($_FILES['photoInput']) && $_FILES['photoInput']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photoInput'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!in_array($file['type'], $allowedTypes)) {
            $response['message'] = 'Invalid file type. Only JPG, PNG, or GIF allowed.';
            error_log('Validation failed: Invalid file type - ' . $file['type']);
            echo json_encode($response);
            exit;
        }

        $uploadDir = './Uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = uniqid('profile_') . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $photoPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $photoPath)) {
            $response['message'] = 'Failed to upload photo.';
            error_log('File upload failed: Unable to move file to ' . $photoPath);
            echo json_encode($response);
            exit;
        }
    }

    // Handle birthday thumb upload
    $birthdayThumbPath = null;
    if (isset($_FILES['birthdayThumb']) && $_FILES['birthdayThumb']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['birthdayThumb'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!in_array($file['type'], $allowedTypes)) {
            $response['message'] = 'Invalid birthday flyer type. Only JPG, PNG, or GIF allowed.';
            error_log('Validation failed: Invalid birthday flyer type - ' . $file['type']);
            echo json_encode($response);
            exit;
        }

        $uploadDir = './Uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = uniqid('bday_') . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $birthdayThumbPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $birthdayThumbPath)) {
            $response['message'] = 'Failed to upload birthday flyer.';
            error_log('File upload failed: Unable to move birthday flyer to ' . $birthdayThumbPath);
            echo json_encode($response);
            exit;
        }
    }

    try {
        $pdo->beginTransaction();

        // Insert into members table
        $stmt = $pdo->prepare("
            INSERT INTO members (
                first_name, last_name, date_of_birth, gender, marital_status, occupation,
                phone, email, address, city, region, status, church_group, leadership_role,
                baptism_status, spiritual_growth, membership_type, notes, photo_path,
                birthday_thumb, birthday_title, birthday_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $_POST['firstName'],
            $_POST['lastName'],
            !empty($_POST['dateOfBirth']) ? $_POST['dateOfBirth'] : null,
            $gender,
            $maritalStatus,
            !empty($_POST['occupation']) ? $_POST['occupation'] : null,
            $_POST['phone'],
            $_POST['email'],
            !empty($_POST['address']) ? $_POST['address'] : null,
            !empty($_POST['city']) ? $_POST['city'] : null,
            !empty($_POST['region']) ? $_POST['region'] : null,
            $status,
            $churchGroup,
            $leadershipRole,
            $baptismStatus,
            $spiritualGrowth,
            $membershipType,
            !empty($_POST['notes']) ? $_POST['notes'] : null,
            $photoPath,
            $birthdayThumbPath,
            !empty($_POST['birthdayTitle']) ? $_POST['birthdayTitle'] : null,
            !empty($_POST['birthdayMessage']) ? $_POST['birthdayMessage'] : null,
        ]);
        $memberId = $pdo->lastInsertId();

        // Insert into emergency_contacts table
        if (!empty($_POST['emergencyName']) || !empty($_POST['emergencyPhone']) || !empty($_POST['emergencyRelation'])) {
            if (isValidPhone($_POST['emergencyPhone'] ?? '')) {
                $stmt = $pdo->prepare("
                    INSERT INTO emergency_contacts (member_id, emergency_name, emergency_phone, emergency_relation)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $memberId,
                    !empty($_POST['emergencyName']) ? $_POST['emergencyName'] : null,
                    !empty($_POST['emergencyPhone']) ? $_POST['emergencyPhone'] : null,
                    !empty($_POST['emergencyRelation']) ? $_POST['emergencyRelation'] : null
                ]);
            } else {
                $pdo->rollBack();
                if ($photoPath && file_exists($photoPath)) {
                    unlink($photoPath);
                }
                if ($birthdayThumbPath && file_exists($birthdayThumbPath)) {
                    unlink($birthdayThumbPath);
                }
                $response['message'] = 'Invalid emergency contact phone number';
                error_log('Validation failed: Invalid emergency phone - ' . ($_POST['emergencyPhone'] ?? 'none'));
                echo json_encode($response);
                exit;
            }
        }

        // Insert into member_departments table
        if (!empty($departments) && !in_array('none', $departments)) {
            $stmt = $pdo->prepare("
                INSERT INTO member_departments (member_id, department_id)
                SELECT ?, department_id FROM departments WHERE department_name = ?
            ");
            foreach ($departments as $department) {
                $stmt->execute([$memberId, $department]);
                if ($stmt->rowCount() == 0) {
                    $pdo->rollBack();
                    if ($photoPath && file_exists($photoPath)) {
                        unlink($photoPath);
                    }
                    if ($birthdayThumbPath && file_exists($birthdayThumbPath)) {
                        unlink($birthdayThumbPath);
                    }
                    $response['message'] = "Department '$department' not found in departments table";
                    error_log("Insert failed: Department '$department' not found");
                    echo json_encode($response);
                    exit;
                }
            }
        }

        // Insert into member_ministries table
        if (!empty($ministries)) {
            $stmt = $pdo->prepare("
                INSERT INTO member_ministries (member_id, ministry_id)
                SELECT ?, ministry_id FROM ministries WHERE ministry_name = ?
            ");
            foreach ($ministries as $ministry) {
                $stmt->execute([$memberId, $ministry]);
                if ($stmt->rowCount() == 0) {
                    $pdo->rollBack();
                    if ($photoPath && file_exists($photoPath)) {
                        unlink($photoPath);
                    }
                    if ($birthdayThumbPath && file_exists($birthdayThumbPath)) {
                        unlink($birthdayThumbPath);
                    }
                    $response['message'] = "Ministry '$ministry' not found in ministries table";
                    error_log("Insert failed: Ministry '$ministry' not found");
                    echo json_encode($response);
                    exit;
                }
            }
        }

        // Insert into welcome_actions table
        $stmt = $pdo->prepare("
            INSERT INTO welcome_actions (member_id, send_welcome_email, notify_pastor, create_account)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $memberId,
            !empty($_POST['sendWelcomeEmail']) ? 1 : 0,
            !empty($_POST['notifyPastor']) ? 1 : 0,
            !empty($_POST['createAccount']) ? 1 : 0
        ]);

        // Placeholder for email and notification logic
        if (!empty($_POST['sendWelcomeEmail'])) {
            error_log('Placeholder: Send welcome email to ' . $_POST['email']);
        }
        if (!empty($_POST['notifyPastor'])) {
            error_log('Placeholder: Notify pastor for new member');
        }
        if (!empty($_POST['createAccount'])) {
            error_log('Placeholder: Create member portal account for ' . $_POST['email']);
        }

        $pdo->commit();
        
        // Log activity to dashboard
        try {
            // Use mysqli connection for activity logging (from centralized config)
            $activityConn = getDBConnection();
            if (!$activityConn->connect_error) {
                $memberName = $_POST['firstName'] . ' ' . $_POST['lastName'];
                $activityType = 'member_added';
                $activityTitle = 'New member added';
                $activityDescription = $memberName . ' joined the church';
                $iconType = 'member';
                
                $stmt = $activityConn->prepare("INSERT INTO activity_log (activity_type, title, description, icon_type, related_id) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param('ssssi', $activityType, $activityTitle, $activityDescription, $iconType, $memberId);
                $stmt->execute();
                $stmt->close();
                
                // Keep only the 4 most recent activities
                $activityConn->query("DELETE FROM activity_log WHERE activity_id NOT IN (SELECT activity_id FROM (SELECT activity_id FROM activity_log ORDER BY created_at DESC LIMIT 4) AS recent)");
                
                $activityConn->close();
                
                error_log('Activity logged: Member added - ' . $memberName);
            }
        } catch (Exception $e) {
            error_log('Failed to log activity: ' . $e->getMessage());
            // Don't fail the entire operation if activity logging fails
        }
        
        
        // Store member data in session for success page
        $_SESSION['new_member_data'] = [
            'name' => $_POST['firstName'] . ' ' . $_POST['lastName'],
            'email' => $_POST['email'],
            'phone' => $_POST['phone'],
            'status' => $status,
            'gender' => $gender,
            'date_of_birth' => $_POST['dateOfBirth'] ?? '',
            'marital_status' => $maritalStatus,
            'occupation' => $_POST['occupation'] ?? '',
            'address' => $_POST['address'] ?? '',
            'city' => $_POST['city'] ?? '',
            'region' => $_POST['region'] ?? '',
            'church_group' => $churchGroup,
            'departments' => !empty($departments) ? implode(', ', $departments) : '',
            'leadership_role' => $leadershipRole,
            'ministries' => !empty($ministries) ? implode(', ', $ministries) : '',
            'baptism_status' => $baptismStatus,
            'spiritual_growth' => $spiritualGrowth,
            'membership_type' => $membershipType,
            'notes' => $_POST['notes'] ?? '',
            'emergency_name' => $_POST['emergencyName'] ?? '',
            'emergency_phone' => $_POST['emergencyPhone'] ?? '',
            'emergency_relation' => $_POST['emergencyRelation'] ?? '',
            'emergency_relation' => $_POST['emergencyRelation'] ?? '',
            'photo_path' => $photoPath,
            'birthday_thumb' => $birthdayThumbPath,
            'birthday_title' => $_POST['birthdayTitle'] ?? '',
            'birthday_message' => $_POST['birthdayMessage'] ?? ''
        ];
        
        $response['success'] = true;
        $response['message'] = 'Member added successfully';
        $response['redirect'] = 'http://localhost/Church_Management_System/admin_dashboard/Add_Members/success.php';
        error_log('Member added successfully: member_id = ' . $memberId);
        echo json_encode($response);
    } catch (Exception $e) {
        $pdo->rollBack();
        if ($photoPath && file_exists($photoPath)) {
            unlink($photoPath);
        }
        if ($birthdayThumbPath && file_exists($birthdayThumbPath)) {
            unlink($birthdayThumbPath);
        }
        $response['message'] = 'Failed to save member: ' . $e->getMessage();
        error_log('Insert failed: ' . $e->getMessage());
        echo json_encode($response);
    }
} else {
    $response = ['success' => false, 'message' => 'Invalid request method'];
    error_log('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
    echo json_encode($response);
}
?>