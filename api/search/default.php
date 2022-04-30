<?php
include "../inc/conn.php";

$fundids		= "001857,001880";
$date_begin		= 19000101;
$date_end		= date("Ymd");
if (isset($_GET["fundid"]))		$fundids  = SQLProtect($_GET["fundid"]);
if (isset($_GET["date_begin"])) $date_begin  = SQLProtect($_GET["date_begin"]);
if (isset($_GET["date_end"]))	$date_end  = SQLProtect($_GET["date_end"]);

$action_result = 0;
$action_reason = "Successful";

if ($fundids!=""){
	$idlist = explode(",",$fundids);
	$ids = "";
	foreach ($idlist as $id) {
		if ($ids==""){
			$ids = "'$id'";
		} else {
			$ids .= ","."'$id'";
		}
	}
	// select fund info
	$sql="SELECT A.*, B.mg_name FROM fund_info A LEFT JOIN fund_manager B ON (A.fund_managerId=B.mg_id) WHERE A.fund_id IN ($ids) ORDER BY A.fund_id";
	$stmt=$mysqli->prepare($sql);
	$stmt->execute();
	$result=$stmt->get_result();
	$info=array();
	while($row = $result->fetch_assoc()){
		$info[] = $row;
	}
	$result->free();
	
	// select fund yearly
	$sql="SELECT * FROM fund_yearly WHERE fund_id IN ($ids) ORDER BY fund_id";
	$stmt=$mysqli->prepare($sql);
	$stmt->execute();
	$result=$stmt->get_result();
	$yearly=array();
	while($row = $result->fetch_assoc()){
		$yearly[] = $row;
	}
	$result->free();
	
	// select fund data
	$sql="SELECT * FROM fund_data WHERE fund_id IN ($ids) AND date_val BETWEEN ? AND ? ORDER BY fund_id, date_val";
	$stmt=$mysqli->prepare($sql);
	$stmt->bind_param("ii", $date_begin, $date_end);
	$stmt->execute();
	$result=$stmt->get_result();
	$data=array();
	while($row = $result->fetch_assoc()){
		$data[] = $row;
	}
	$result->free();
	$stmt->close();
	echo json_encode(array('result'=>0, 'info'=>$info, 'data'=>$data, 'yearly'=>$yearly));
} else {
	echo json_encode(array('result'=>9, 'reason'=>'Unknow request'));
}

$mysqli->close();
?>
