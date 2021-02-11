<!-- <!DOCTYPE html> -->
<html>
	<head>
		<title>Demo</title>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	    <meta name="description" content="Demo project">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
		<style type="text/css"></style>
	</head>
	<body>
	<?php 
	
	$fileDir = "data/";
	$csvText = $_POST["surveydata"];
	echo $csvText;
	$writeFile = fopen($fileDir.time().'.csv', "w") or die("Unable to open file!");
	fwrite($writeFile, $csvText);
	fclose($writeFile);
	$writeLogFile = fopen($fileDir.time().'_iplog.csv', 'w') or die("Unable to open file!");
	fwrite($writeLogFile, $_SERVER['REMOTE_ADDR']);
	fclose($writeLogFile);

	 ?>
	</body>
	<script type="text/javascript"></script>
</html>
