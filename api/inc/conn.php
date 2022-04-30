<?php
header("Content-Type: text/html;charset=utf-8");
date_default_timezone_set('PRC');
//error_reporting(0);
error_reporting(E_ALL);
include "mysql.php";

$sslurl = "http://". $_SERVER["HTTP_HOST"];

$mysqli = new mysqli($mysql_server_name, $mysql_username, $mysql_password, $mysql_database);
mysqli_query($mysqli,"SET NAMES utf8");
if (mysqli_connect_errno()) { 
	printf("Connect failed: %s\n", mysqli_connect_error()); 
	exit();
}

function currentId(){
	return substr(str_replace(".", "", microtime(true))."0000000000", 6, 8);
}

function xDate(){
	return date("Y-m-d");
}

//Julian day
function xJulianDays(){
	return unixtojd(time());
}

function xTime(){
	return date("G:i:s");
}

function FmtISODate($dteDate){
	return date("Y-m-d",strtotime($dteDate));
}

function SQLFix($inval){
	$tmpval=str_replace("'","\'",$inval);
	$tmpval=str_replace(Chr(0),"",$tmpval);
	$tmpval=str_replace("--","__",$tmpval);
	$tmpval=str_replace(";","",$tmpval);
	$tmpval=str_replace("/*","",$tmpval);
	$tmpval=str_replace("*/","",$tmpval);
	return $tmpval;
}

function SQLProtect($inval){
	$tmpval=str_replace("'","''",$inval);
	$tmpval=str_replace("%","",$tmpval);
	$tmpval=str_replace(Chr(0),"",$tmpval);
	$tmpval=str_replace("--","",$tmpval);
	$tmpval=str_replace(";","",$tmpval);
	$tmpval=str_replace("/*","",$tmpval);
	$tmpval=str_replace("*/","",$tmpval);
	return $tmpval;
}

/*
** check a date
** dd.mm.yyyy || mm/dd/yyyy || dd-mm-yyyy || yyyy-mm-dd 
*/
function isDate($date) {
    if(strlen($date) == 10) {
        $pattern = '/\.|\/|-/i';    // . or / or -
        preg_match($pattern, $date, $char);
        
        $array = preg_split($pattern, $date, -1, PREG_SPLIT_NO_EMPTY); 
        
        if(strlen($array[2]) == 4) {
            // dd.mm.yyyy || dd-mm-yyyy
            if($char[0] == "."|| $char[0] == "-") {
                $month = $array[1];
                $day = $array[0];
                $year = $array[2];
            }
            // mm/dd/yyyy    # Common U.S. writing
            if($char[0] == "/") {
                $month = $array[0];
                $day = $array[1];
                $year = $array[2];
            }
        }
        // yyyy-mm-dd    # iso 8601
        if(strlen($array[0]) == 4 && $char[0] == "-") {
            $month = $array[1];
            $day = $array[2];
            $year = $array[0];
        }
        if(checkdate($month, $day, $year)) {    //Validate Gregorian date
            return TRUE;
        
        } else {
            return FALSE;
        }
    }else {
        return FALSE;    // more or less 10 chars
    }
}

function isEmail($mail){ 
	$isemail = false;
	if($mail!=""){
		$pattern = "/^([0-9A-Za-z\\-_\\.]+)@([0-9a-z]+\\.[a-z]{2,3}(\\.[a-z]{2})?)$/i";
		if(preg_match($pattern, $mail)){
			$isemail=true;
		}
	}
	return $isemail;
}
?>
