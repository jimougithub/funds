<?php
require_once "./api/inc/conn.php";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Fund data refresh</title>
</head>
<body>
<a href="./update.php?update=yes" target="_blank"><input type="button" value='Update data'></a>
<br/><br/>
<?php
$update=$_REQUEST["update"];
if ($update=="yes"){
	$cmd = 'python3 refresh_funddata.py > log.txt &';
	try {
		$ret = shell_exec($cmd);
		die("command executed: ". $ret);
	} catch (Exception $e) {
		die('error=' . $e->getMessage());
	}	
}

// Fund download status
$table = "<table border='1' cellpadding='0' cellspacing='0' align='left'>";
$table .= "<tr align='left'><th width='150'>Download Date</th><th width='100'>Count</th></tr>";
$sql="SELECT fund_download, count(1) fund_count FROM fund_info GROUP BY fund_download";
$stmt=$mysqli->prepare($sql);
$stmt->execute();
$result=$stmt->get_result();
while($row = $result->fetch_assoc()){
	$table .= "<tr><td>". $row["fund_download"] ."</td><td>". $row["fund_count"] ."</td></tr>";
}
$table .= "<tr><td colspan='2'>&nbsp</td></tr>";
$result->free();

// Fund update status
$table .= "<tr align='left'><th>Update Date</th><th>Count</th></tr>";
$sql="SELECT fund_update, count(1) fund_count FROM fund_info GROUP BY fund_update";
$stmt=$mysqli->prepare($sql);
$stmt->execute();
$result=$stmt->get_result();
while($row = $result->fetch_assoc()){
	$table .= "<tr><td>". $row["fund_update"] ."</td><td>". $row["fund_count"] ."</td></tr>";
}
$result->free();
$table .= "</table>";
echo $table;

$mysqli->close();
?>
</body>
</html>
