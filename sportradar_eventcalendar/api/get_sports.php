<?php
header('Content-Type: application/json');
include "db_connect.php";

$result = $conn->query("SELECT sport_id, name AS sport_name FROM sport ORDER BY name");
if (!$result) {
    die(json_encode(["error" => "SQL query failed: " . $conn->error]));
}

$sports = [];
while ($row = $result->fetch_assoc()) {
    $sports[] = $row;
}

echo json_encode($sports, JSON_PRETTY_PRINT);
$conn->close();
?>