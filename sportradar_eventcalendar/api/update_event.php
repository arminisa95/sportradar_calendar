<?php
header('Content-Type: application/json');
include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    echo json_encode(["success" => false, "error" => "Invalid JSON body"]);
    exit;
}

$required = [
    'event_id',
    'event_date',
    'event_time',
    'sport_id',
    'home_team_id',
    'away_team_id',
    'venue_id'
];

foreach ($required as $key) {
    if (!isset($data[$key]) || $data[$key] === '') {
        echo json_encode(["success" => false, "error" => "Missing required field: $key"]);
        exit;
    }
}

$event_id = (int)$data['event_id'];
$event_date = $data['event_date'];
$event_time = $data['event_time'];
$sport_id = (int)$data['sport_id'];
$home_team_id = (int)$data['home_team_id'];
$away_team_id = (int)$data['away_team_id'];
$venue_id = (int)$data['venue_id'];
$description = isset($data['description']) && $data['description'] !== '' ? $data['description'] : null;

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $event_date)) {
    echo json_encode(["success" => false, "error" => "Invalid date format. Use YYYY-MM-DD."]);
    exit;
}
if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $event_time)) {
    echo json_encode(["success" => false, "error" => "Invalid time format. Use HH:MM or HH:MM:SS."]);
    exit;
}
if ($event_id <= 0 || $sport_id <= 0 || $home_team_id <= 0 || $away_team_id <= 0 || $venue_id <= 0) {
    echo json_encode(["success" => false, "error" => "IDs must be positive integers."]);
    exit;
}

$sql = "UPDATE `event`
        SET event_date = ?,
            event_time = ?,
            sport_id = ?,
            home_team_id = ?,
            away_team_id = ?,
            venue_id = ?,
            description = ?
        WHERE event_id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param(
    'ssiiiisi',
    $event_date,
    $event_time,
    $sport_id,
    $home_team_id,
    $away_team_id,
    $venue_id,
    $description,
    $event_id
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
} else {
    echo json_encode(["success" => false, "error" => "SQL Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
