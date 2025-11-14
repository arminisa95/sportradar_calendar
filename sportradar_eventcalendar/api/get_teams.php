<?php
header('Content-Type: application/json');
include "db_connect.php";

$sql = "SELECT team_id, name AS team_name, sport_id FROM team ORDER BY sport_id, name";
$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "SQL query failed: " . $conn->error]));
}

$teams = [];
while ($row = $result->fetch_assoc()) {
    $teams[] = $row;
}

echo json_encode($teams, JSON_PRETTY_PRINT);
$conn->close();
?>