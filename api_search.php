<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$db   = 'f1_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (\PDOException $e) {
    echo json_encode(["error" => "Błąd bazy"]);
    exit;
}

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

$results = [
    "drivers" => [],
    "races" => []
];

if (strlen($query) > 0) {
    $searchParam = "%" . $query . "%";

    $sql_drivers = "
        SELECT d.driver_id, d.first_name, d.last_name, t.team_name, t.team_color 
        FROM drivers d
        LEFT JOIN race_results rr ON d.driver_id = rr.driver_id
        LEFT JOIN teams t ON rr.team_id = t.team_id
        WHERE d.driver_id LIKE :q OR d.first_name LIKE :q OR d.last_name LIKE :q 
        GROUP BY d.driver_id, d.first_name, d.last_name, t.team_name, t.team_color
        LIMIT 5
    ";
    
    $stmt1 = $pdo->prepare($sql_drivers);
    $stmt1->execute(['q' => $searchParam]);
    $results["drivers"] = $stmt1->fetchAll();

    $sql_races = "
        SELECT season, round, race_name, circuit_name, race_type 
        FROM races 
        WHERE race_name LIKE :q OR circuit_name LIKE :q 
        ORDER BY season DESC, round ASC 
        LIMIT 5
    ";
    
    $stmt2 = $pdo->prepare($sql_races);
    $stmt2->execute(['q' => $searchParam]);
    $results["races"] = $stmt2->fetchAll();
}

echo json_encode($results, JSON_UNESCAPED_UNICODE);