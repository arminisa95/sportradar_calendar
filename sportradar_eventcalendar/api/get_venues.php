<?php
header('Content-Type: application/json');
include "db_connect.php";

$result = $conn->query("SELECT venue_id, name, city, country, sport_id FROM venue ORDER BY name");
if (!$result) {
    die(json_encode(["error" => "SQL query failed: " . $conn->error]));
}

$venues = [];
while ($row = $result->fetch_assoc()) {
    $venues[] = $row;
}

echo json_encode($venues, JSON_PRETTY_PRINT);
$conn->close();
?>
