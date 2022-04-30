$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

function date_parse(date_val) {
	var str = date_val.toString();
	if(!/^(\d){8}$/.test(str)) return "invalid date";
	var y = str.substr(0,4),
		m = str.substr(4,2),
		d = str.substr(6,2);
	return new Date(y,m-1,d);
}

function format_yyyymmdd(d) {
	return date = [
	  d.getFullYear(),
	  ('0' + (d.getMonth() + 1)).slice(-2),
	  ('0' + d.getDate()).slice(-2)
	].join('');
}

function setCookie(name,value,days){
    var exp = new Date();
    exp.setTime(exp.getTime() + days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

function isEmail(email) {
	email = email.trim();
	var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if(!regex.test(email)) {
		return false;
	}else{
		return true;
	}
}

function replace_html(src){
	var tar = src;
	tar = tar.replace("<", "&lt;");
	tar = tar.replace(">", "&gt;");
	return tar;
}

function htmlEncodeJQ(str) {
    return $('<span/>').text(str).html();
}

function htmlDecodeJQ(str) {
    return $('<span/>').html(str).text();
}

function string2json(json_str) {
    if (!!JSON) {
        try {
            var json = JSON.parse(json_str);
            return json;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}