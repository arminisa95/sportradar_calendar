<?php
header('Content-Type: application/json');
include 'db_connect.php';

$event_id = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
if ($event_id <= 0) {
    echo json_encode(["success" => false, "error" => "Missing or invalid event_id"]);
    exit;
}

$sql = "
SELECT 
    e.event_id,
    e.event_date,
    e.event_time,
    e.description,
    s.sport_id,
    s.name AS sport_name,
    ht.team_id AS home_team_id,
    ht.name AS home_team_name,
    at.team_id AS away_team_id,
    at.name AS away_team_name,
    v.venue_id,
    v.name AS venue_name,
    v.city AS venue_city,
    v.country AS venue_country
FROM `event` e
JOIN sport s ON e.sport_id = s.sport_id
JOIN team ht ON e.home_team_id = ht.team_id
JOIN team at ON e.away_team_id = at.team_id
JOIN venue v ON e.venue_id = v.venue_id
WHERE e.event_id = ?
LIMIT 1";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param('i', $event_id);
if (!$stmt->execute()) {
    echo json_encode(["success" => false, "error" => "SQL Error: " . $stmt->error]);
    $stmt->close();
    exit;
}

$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "event" => $row], JSON_PRETTY_PRINT);
} else {
    echo json_encode(["success" => false, "error" => "Event not found"]);
}

$stmt->close();
$conn->close();
?>
