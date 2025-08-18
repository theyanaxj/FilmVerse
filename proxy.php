<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


$api_key = "ec31861437ccd5379e2c1c78c01b2bce"; 


$endpoint = $_GET['endpoint'];
$params = http_build_query(array_merge($_GET, ['api_key' => $api_key, 'language' => 'th-TH']));


$url = "https://api.themoviedb.org/3" . $endpoint . "?" . $params;


$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);


echo $response;
?>