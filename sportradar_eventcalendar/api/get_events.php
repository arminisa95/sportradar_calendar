<?php
header('Content-Type: application/json');
include "db_connect.php";

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
ORDER BY e.event_date, e.event_time
";

$result = $conn->query($sql);
$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}
echo json_encode($events, JSON_PRETTY_PRINT);
$conn->close();
?>