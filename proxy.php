<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// ✅ ซ่อน API Key จริงไว้ที่นี่
$api_key = "ec31861437ccd5379e2c1c78c01b2bce"; 

// ตรวจสอบ endpoint
$endpoint = $_GET['endpoint'] ?? "";
if (!$endpoint) {
    http_response_code(400);
    echo json_encode(["error" => "Missing endpoint"]);
    exit;
}

// สร้าง query string ใหม่ (กันการ override api_key/language)
$query = $_GET;
unset($query['endpoint']); // เอาออกก่อน
$query['api_key'] = $api_key;
$query['language'] = 'th-TH';

// ประกอบ URL
$url = "https://api.themoviedb.org/3" . $endpoint . "?" . http_build_query($query);

// ใช้ cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "cURL Error: " . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);
echo $response;
