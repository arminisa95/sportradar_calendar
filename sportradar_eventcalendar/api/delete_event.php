<?php
header("Content-Type: application/json");
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data["event_id"])) {
    $event_id = (int)$data["event_id"];
    $sql = "DELETE FROM `event` WHERE event_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $event_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "Event with ID $event_id not found."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "SQL Error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Missing event_id in request."]);
}

$conn->close();
?>