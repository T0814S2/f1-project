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

$wdc_stmt = $pdo->prepare("
    SELECT 
        d.code, 
        d.last_name, 
        dss.points, 
        t.team_color,
        (
            SELECT COUNT(*) 
            FROM race_results rr 
            JOIN races r ON rr.race_id = r.race_id 
            WHERE rr.driver_id = dss.driver_id 
              AND r.season = dss.season 
              AND rr.position = 1 
              AND r.race_type = 'Grand Prix'
        ) AS wins
    FROM driver_season_stats dss
    LEFT JOIN teams t ON dss.team_id = t.team_id
    LEFT JOIN drivers d ON dss.driver_id = d.driver_id
    WHERE dss.season = :season
    ORDER BY dss.points DESC, wins DESC
");
$wdc_stmt->execute(['season' => $season]);

$wcc_stmt = $pdo->prepare("
    SELECT 
        dss.team_id, 
        t.team_name, 
        SUM(dss.points) AS points, 
        t.team_color,
        (
            SELECT COUNT(*) 
            FROM race_results rr 
            JOIN races r ON rr.race_id = r.race_id 
            WHERE rr.team_id = dss.team_id 
              AND r.season = dss.season 
              AND rr.position = 1 
              AND r.race_type = 'Grand Prix'
        ) AS wins
    FROM driver_season_stats dss
    LEFT JOIN teams t ON dss.team_id = t.team_id
    WHERE dss.season = :season
    GROUP BY dss.team_id, t.team_name, t.team_color
    ORDER BY points DESC, wins DESC
");
$wcc_stmt->execute(['season' => $season]);

echo json_encode([
    "wdc" => $wdc_stmt->fetchAll(),
    "wcc" => $wcc_stmt->fetchAll()
]);