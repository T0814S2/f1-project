<?php
header('Content-Type: application/json; charset=utf-8');

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

$season = isset($_GET['season']) ? intval($_GET['season']) : 2026;

$query = "
    SELECT 
        r.circuit_name AS circuit,
        r.race_name,
        r.race_type AS type,
        
        -- Dane zwycięzcy (P1)
        d1.code AS p1_code, d1.first_name AS p1_first_name, d1.last_name AS p1_last_name, t1.team_color AS p1_color,
        
        -- Dane drugiego miejsca (P2)
        d2.code AS p2_code, d2.first_name AS p2_first_name, d2.last_name AS p2_last_name, t2.team_color AS p2_color,
        
        -- Dane trzeciego miejsca (P3) - poprawiona literówka na p3_code
        d3.code AS p3_code, d3.first_name AS p3_first_name, d3.last_name AS p3_last_name, t3.team_color AS p3_color,
        
        -- Dane najszybszego okrążenia (Fastest Lap)
        df.code AS fastest_code, df.first_name AS fastest_first_name, df.last_name AS fastest_last_name, tf.team_color AS fastest_color
    FROM races r

    LEFT JOIN race_results rr1 ON r.race_id = rr1.race_id AND rr1.position = 1
    LEFT JOIN drivers d1 ON rr1.driver_id = d1.driver_id
    LEFT JOIN teams t1 ON rr1.team_id = t1.team_id

    LEFT JOIN race_results rr2 ON r.race_id = rr2.race_id AND rr2.position = 2
    LEFT JOIN drivers d2 ON rr2.driver_id = d2.driver_id
    LEFT JOIN teams t2 ON rr2.team_id = t2.team_id

    LEFT JOIN race_results rr3 ON r.race_id = rr3.race_id AND rr3.position = 3
    LEFT JOIN drivers d3 ON rr3.driver_id = d3.driver_id
    LEFT JOIN teams t3 ON rr3.team_id = t3.team_id

    LEFT JOIN race_results rr_f ON r.race_id = rr_f.race_id AND rr_f.is_fastest_lap = 1
    LEFT JOIN drivers df ON rr_f.driver_id = df.driver_id
    LEFT JOIN teams tf ON rr_f.team_id = tf.team_id 
    
    WHERE r.season = :season
    ORDER BY r.round ASC, r.race_type DESC;
";

$stmt = $pdo->prepare($query);
$stmt->execute(['season' => $season]);

$results = [];
while ($row = $stmt->fetch()) {
    $results[] = [
        "circuit"              => $row['circuit'],
        "race_name"            => $row['race_name'],
        "type"                 => $row['type'],
        
        "p1_code"              => $row['p1_code'],
        "p1_first_name"        => $row['p1_first_name'],
        "p1_last_name"         => $row['p1_last_name'],
        "p1_color"             => $row['p1_color'] ?? "#FFFFFF",
        
        "p2_code"              => $row['p2_code'],
        "p2_first_name"        => $row['p2_first_name'],
        "p2_last_name"         => $row['p2_last_name'],
        "p2_color"             => $row['p2_color'] ?? "#FFFFFF",
        
        "p3_code"              => $row['p3_code'],
        "p3_first_name"        => $row['p3_first_name'],
        "p3_last_name"         => $row['p3_last_name'],
        "p3_color"             => $row['p3_color'] ?? "#FFFFFF",
        
        "fastest_code"         => $row['fastest_code'],
        "fastest_first_name"   => $row['fastest_first_name'],
        "fastest_last_name"    => $row['fastest_last_name'],
        "fastest_color"        => $row['fastest_color'] ?? "#FFFFFF"
    ];
}

echo json_encode($results);