<?php
header("Content-Type: application/json");
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data["event_date"]) && 
    isset($data["event_time"]) && 
    isset($data["sport_id"]) &&
    isset($data["home_team_id"]) &&
    isset($data["away_team_id"]) &&
    isset($data["venue_id"])
) {
    $event_date = $data["event_date"];
    $event_time = $data["event_time"];
    $sport_id = (int)$data["sport_id"];
    $home_team_id = (int)$data["home_team_id"];
    $away_team_id = (int)$data["away_team_id"];
    $venue_id = (int)$data["venue_id"];
    $description = isset($data["description"]) && !empty($data["description"]) ? $data["description"] : null;

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $event_date)) {
        echo json_encode(["success" => false, "error" => "Invalid date format. Use YYYY-MM-DD."]);
        exit;
    }
    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $event_time)) {
        echo json_encode(["success" => false, "error" => "Invalid time format. Use HH:MM or HH:MM:SS."]);
        exit;
    }
    if ($sport_id <= 0 || $home_team_id <= 0 || $away_team_id <= 0 || $venue_id <= 0) {
        echo json_encode(["success" => false, "error" => "IDs must be positive integers."]);
        exit;
    }

    $sql = "INSERT INTO `event` (event_date, event_time, sport_id, home_team_id, away_team_id, venue_id, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiiiis", $event_date, $event_time, $sport_id, $home_team_id, $away_team_id, $venue_id, $description);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "event_id" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "error" => "SQL Error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
}

$conn->close();
?>