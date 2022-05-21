<?php
include "../inc/conn.php";

$feature	= "ids";
$keys		= "001857,001880";
$date_begin	= 19000101;
$date_end	= date("Ymd");
if (isset($_GET["feature"]))	$feature  = SQLProtect($_GET["feature"]);
if (isset($_GET["keys"]))		$keys  = SQLProtect($_GET["keys"]);
if (isset($_GET["date_begin"])) $date_begin  = SQLProtect($_GET["date_begin"]);
if (isset($_GET["date_end"]))	$date_end  = SQLProtect($_GET["date_end"]);

$action_result = 0;
$action_reason = "Successful";

if ($feature!=""){
	$ids = "";
	$info=array();
	$yearly=array();
	$data=array();
	
	// select ids
	if ($feature == "ids"){
		$idlist = explode(",", $keys);
		foreach ($idlist as $id) {
			if ($ids==""){
				$ids = "'$id'";
			} else {
				$ids .= ","."'$id'";
			}
		}
	} elseif ($feature == "4433"){
		$sql="SELECT fund_id FROM fund_info WHERE fund_ranking_1y<0.25 AND fund_ranking_2y<0.25 AND fund_ranking_3y<0.25 AND fund_ranking_5y<0.25 AND fund_ranking_6m<0.33 AND fund_ranking_3m<0.33 AND fund_ranking_5y>0 AND fund_update>0 AND fund_type=? AND fs_start<? ORDER BY fund_avg_increase DESC LIMIT 100";
		$stmt=$mysqli->prepare($sql);
		$stmt->bind_param("si", $keys, $date_begin);
		$stmt->execute();
		$result=$stmt->get_result();
		while($row = $result->fetch_assoc()){
			$id = $row["fund_id"];
			if ($ids==""){
				$ids = "'$id'";
			} else {
				$ids .= ","."'$id'";
			}
		}
		$result->free();
	} elseif ($feature == "maxdrawdown"){
		$sql="SELECT fund_id FROM fund_info WHERE fund_type=? AND fs_start<? AND fund_maxdrawdown>0 ORDER BY fund_maxdrawdown LIMIT 100";
		$stmt=$mysqli->prepare($sql);
		$stmt->bind_param("si", $keys, $date_begin);
		$stmt->execute();
		$result=$stmt->get_result();
		while($row = $result->fetch_assoc()){
			$id = $row["fund_id"];
			if ($ids==""){
				$ids = "'$id'";
			} else {
				$ids .= ","."'$id'";
			}
		}
		$result->free();
	}
	
	if ($ids != ""){
		// select fund info
		$sql="SELECT A.*, B.mg_name FROM fund_info A LEFT JOIN fund_manager B ON (A.fund_managerId=B.mg_id) WHERE A.fund_id IN ($ids) ORDER BY A.fund_id";
		$stmt=$mysqli->prepare($sql);
		$stmt->execute();
		$result=$stmt->get_result();
		while($row = $result->fetch_assoc()){
			$info[] = $row;
		}
		$result->free();
		
		// select fund yearly
		$sql="SELECT * FROM fund_yearly WHERE fund_id IN ($ids) ORDER BY fund_id, fund_year";
		$stmt=$mysqli->prepare($sql);
		$stmt->execute();
		$result=$stmt->get_result();
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
		while($row = $result->fetch_assoc()){
			$data[] = $row;
		}
		$result->free();
		$stmt->close();
	}
	echo json_encode(array('result'=>0, 'info'=>$info, 'data'=>$data, 'yearly'=>$yearly));
} else {
	echo json_encode(array('result'=>9, 'reason'=>'Unknow request'));
}

$mysqli->close();
?>
