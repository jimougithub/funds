var chart = null;
var fund_info =  new Array();		//基金信息
var fund_code =  new Array();		//基金代码
var shares_position = new Array();	//股票仓位
var net_worth = new Array();		//单位净值
var net_worth_pcent = new Array();	//单位净值%
var ac_worth = new Array();			//累计净值
var ac_worth_pcent = new Array();	//累计净值%
var equity_return = new Array();	//净值回报
var unit_money = new Array();		//分红金额
var ranking = new Array();			//同类排名
var show_data = new Array();
var colors = ['#E53935', '#1E88E5', '#43A047', '#FFB300', '#8E24AA', '#00FF33', '#5E35B1', '#FF00FF', '#0033FF', '#990000'];

function load_fund_data(fundid, date_begin, date_end) {
	// load and prepare data
	var url = "../api/search/?fundid=" + fundid
	if (date_begin>0){
		url = url + "&date_begin="+date_begin;
	}
	if (date_end>0){
		url = url + "&date_end="+date_end;
	}
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(json){
			if(json.result==0){
				// fund info
				var info = json.info;
				fund_info = new Array();
				for (i=0; i < info.length; i++) {
					fund_info.push({
						fund_id: info[i]['fund_id'],
						fund_name: info[i]['fund_name'],
						fund_managerId: info[i]['fund_managerId'],
						mg_name: info[i]['mg_name'],
						fs_start: info[i]['fs_start'],
						fund_increase: info[i]['fund_increase'],
						fund_avg_increase: info[i]['fund_avg_increase'],
						fund_cur_ranking: info[i]['fund_cur_ranking'],
						fund_avg_ranking: info[i]['fund_avg_ranking'],
						fund_maxdrawdown: info[i]['fund_maxdrawdown'],
						fund_maxdrawdown_begin: info[i]['fund_maxdrawdown_begin'],
						fund_maxdrawdown_end: info[i]['fund_maxdrawdown_end'],
						fund_maxincrease: info[i]['fund_maxincrease'],
						fund_maxincrease_begin: info[i]['fund_maxincrease_begin'],
						fund_maxincrease_end: info[i]['fund_maxincrease_end']
					})
				}
				for (i=0; i < 10; i++) {
					fund_info.push({
						fund_id: '000000',
						fund_name: '',
						fund_managerId: '000000',
						mg_name: '',
						fs_start: '',
						fund_increase: '',
						fund_avg_increase: '',
						fund_cur_ranking: '',
						fund_avg_ranking: '',
						fund_maxdrawdown: '',
						fund_maxdrawdown_begin: '',
						fund_maxdrawdown_end: '',
						fund_maxincrease: '',
						fund_maxincrease_begin: '',
						fund_maxincrease_end: ''
					})
				}
				
				// fund data
				for (i=0; i < 10; i++) {
						fund_code[i] = '000000';
						shares_position[i] = new Array();
						net_worth[i] = new Array();
						ac_worth[i] = new Array();
						net_worth_pcent[i] = new Array();
						ac_worth_pcent[i] = new Array();
						equity_return[i] = new Array();
						unit_money[i] = new Array();
						ranking[i] = new Array();
						show_data[i] = new Array();
				}
				var data = json.data;
				var fund_id = '000000';
				var ac_worth0 = 0;
				var index = -1;
				for (i=0; i < data.length; i++) {
					if (fund_id != data[i]['fund_id']){
						index ++;
						fund_id = data[i]['fund_id'];
						fund_code[index] = fund_id;
						net_worth0 = 0;
						ac_worth0 = 0;
						unit_money0 = 0;
						unit_money_pcent0 = 1;
					}
					unit_money0 = parseFloat(data[i]['unit_money']);
					if (unit_money0>0){
						if (unit_money0>1 && unit_money0*2 > parseFloat(data[i]['net_worth'])) {
							unit_money_pcent0 = unit_money_pcent0 * unit_money0;
						} else {
							unit_money_pcent0 = unit_money_pcent0 * (1+unit_money0/parseFloat(data[i]['net_worth']))
						}
						unit_money[index].push({
							x: date_parse(data[i]['date_val']),
							y: unit_money0,
							indexLabel: data[i]['unit_money'], markerType: "triangle", markerColor: "#6B8E23"
						});
					}
					if (parseFloat(data[i]['shares_position'])>0){
						shares_position[index].push({
							x: date_parse(data[i]['date_val']),
							y: parseFloat(data[i]['shares_position'])
						});
					}
					if (parseFloat(data[i]['net_worth'])>0){
						net_worth[index].push({
							x: date_parse(data[i]['date_val']),
							y: parseFloat(data[i]['net_worth'])
						});
						if (net_worth0==0){
							net_worth0 = parseFloat(data[i]['net_worth']);
						}
						net_worth_pcent[index].push({
							x: date_parse(data[i]['date_val']),
							y: ( (parseFloat(data[i]['net_worth'])/net_worth0) * unit_money_pcent0 - 1 ) * 100
						});
					}
					if (parseFloat(data[i]['ac_worth'])>0){
						ac_worth[index].push({
							x: date_parse(data[i]['date_val']),
							y: parseFloat(data[i]['ac_worth'])
						});
						if (net_worth0==0){
							net_worth0 = parseFloat(data[i]['net_worth']);
						}
						if (ac_worth0==0){
							ac_worth0 = parseFloat(data[i]['ac_worth']);
						}
						ac_worth_pcent[index].push({
							x: date_parse(data[i]['date_val']),
							y: ( (parseFloat(data[i]['ac_worth'])-ac_worth0) / net_worth0 ) * 100
						});
					}
					if (parseFloat(data[i]['equity_return'])>0){
						equity_return[index].push({
							x: date_parse(data[i]['date_val']),
							y: parseFloat(data[i]['equity_return'])
						});
					}
					if (parseFloat(data[i]['ranking'])>0){
						ranking[index].push({
							x: date_parse(data[i]['date_val']),
							y: parseFloat(data[i]['ranking'])
						});
					}
				}
				change_yvalue();
				chart = create_chart();
				show_fund_info();
			} else {
				console.log(json.reason)
			}
		},
		error: function(XMLHttpRequest, msg, e){
			console.log(e)
		}
	});
}

function load_fund_data_json(fundcode) {
	var url = "../data/" + fundcode + ".json"
	$.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		success: function(json){
			if(json.fS_code==fundcode){
				// fund data
				for (i=0; i < 10; i++) {
						fund_code[i] = '000000';
						shares_position[i] = new Array();
						net_worth[i] = new Array();
						ac_worth[i] = new Array();
						net_worth_pcent[i] = new Array();
						ac_worth_pcent[i] = new Array();
						equity_return[i] = new Array();
						unit_money[i] = new Array();
						ranking[i] = new Array();
						show_data[i] = new Array();
				}
				var networth = json.Data_netWorthTrend;
				var fund_id = '000000';
				net_worth0 = 0;
				ac_worth0 = 0;
				unit_money0 = 0;
				unit_money_pcent0 = 1;
				var index = 0;
				for (i=0; i < networth.length; i++) {
					if (parseFloat(networth[i]['y'])>0){
						net_worth[index].push({
							x: date_parse(networth[i]['x']),
							y: parseFloat(networth[i]['y'])
						});
						if (net_worth0==0){
							net_worth0 = parseFloat(data[i]['net_worth']);
						}
						net_worth_pcent[index].push({
							x: date_parse(networth[i]['x']),
							y: ( (parseFloat(networth[i]['y'])/net_worth0) * unit_money_pcent0 - 1 ) * 100
						});
					}
				}
				change_yvalue();
				chart = create_chart();
				show_fund_info();
			} else {
				console.log(json.reason)
			}
		},
		error: function(XMLHttpRequest, msg, e){
			console.log(e)
		}
	});
}

// create chart
function create_chart(){
	var chart = new CanvasJS.StockChart("stockChartContainer", {
		exportEnabled: true,
		title: {
			text: "基金数据对比"
		},
		subtitles: [{
			//text:"Fund price compare with stock"
		}],
		charts: [{
			toolTip:{
				//fontColor: "black",
				shared: true
			},
			axisX: {
				crosshair: {
					enabled: true,
					snapToDataPoint: true,
					valueFormatString: "YYYY-MMM-DD"
				}
			},
			axisY: {
				title: "Value",
				prefix: "",
				suffix: "",
				crosshair: {
					enabled: true,
					snapToDataPoint: true,
				}
			},
			data: [{
				type: "line",
				lineColor: colors[0],
				name: '<font color="'+ colors[0] +'">' + fund_info[0].fund_id + ' - ' + fund_info[0].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[0]
			},{
				type: "line",
				lineColor: colors[1],
				name: '<font color="'+ colors[1] +'">' + fund_info[1].fund_id + ' - ' + fund_info[1].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[1]
			},{
				type: "line",
				name: '<font color="'+ colors[2] +'">' + fund_info[2].fund_id + ' - ' + fund_info[2].fund_name.substring(0,6) + '</font>',
				lineColor: colors[2],
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[2]
			},{
				type: "line",
				lineColor: colors[3],
				name: '<font color="'+ colors[3] +'">' + fund_info[3].fund_id + ' - ' + fund_info[3].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[3]
			},{
				type: "line",
				lineColor: colors[4],
				name: '<font color="'+ colors[4] +'">' + fund_info[4].fund_id + ' - ' + fund_info[4].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[4]
			},{
				type: "line",
				lineColor: colors[5],
				name: '<font color="'+ colors[5] +'">' + fund_info[5].fund_id + ' - ' + fund_info[5].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[5]
			},{
				type: "line",
				lineColor: colors[6],
				name: '<font color="'+ colors[6] +'">' + fund_info[6].fund_id + ' - ' + fund_info[6].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[6]
			},{
				type: "line",
				lineColor: colors[7],
				name: '<font color="'+ colors[7] +'">' + fund_info[7].fund_id + ' - ' + fund_info[7].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[7]
			},{
				type: "line",
				lineColor: colors[8],
				name: '<font color="'+ colors[8] +'">' + fund_info[8].fund_id + ' - ' + fund_info[8].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[8]
			},{
				type: "line",
				lineColor: colors[9],
				name: '<font color="'+ colors[9] +'">' + fund_info[9].fund_id + ' - ' + fund_info[9].fund_name.substring(0,6) + '</font>',
				xValueFormatString: "YYYY-MMM-DD",
				dataPoints : show_data[9]
			}],
			rangeSelector: {
				selectedRangeButtonIndex: 5
			}
		}]
	});
	chart.render();
	return chart;
}

// show fund info
function show_fund_info(){
	var info_val = "<table border=\"1\"><tr><th>Id</th><th>Name</th><th>Manager</th><th>Establish Date</th><th>Total Increment</th><th>Avg Yearly Increment</th><th>Current Ranking</th><th>Avg Ranking</th><th>Max Increment</th><th>Increase Begin</th><th>Increase End</th><th>Max Drawdown</th><th>Drawdown Begin</th><th>Drawdown End</th></tr>";
	for (i=0; i < 10; i++) {
		if (fund_info[i].fund_id!='000000'){
			info_val += "<tr><td><b><font color="+ colors[i] +">"+ fund_info[i].fund_id +"</font></b></td><td>"+ 
									fund_info[i].fund_name +"</td><td>"+ 
									fund_info[i].mg_name +"</td><td>"+
									fund_info[i].fs_start +"</td><td>"+
									(fund_info[i].fund_increase*100).toFixed(2) +"</td><td>"+
									"<b><font color='#0fd132'>"+ (fund_info[i].fund_avg_increase*100).toFixed(2) +"</font></b></td><td>"+
									(fund_info[i].fund_cur_ranking*1).toFixed(2) +"</td><td>"+
									(fund_info[i].fund_avg_ranking*1).toFixed(2) +"</td><td>"+
									"<b><font color='#0fd132'>"+ (fund_info[i].fund_maxincrease*100).toFixed(2) +"</font></b></td><td>"+
									fund_info[i].fund_maxincrease_begin +"</td><td>"+
									fund_info[i].fund_maxincrease_end +"</td><td>"+
									"<b><font color='red'>"+ (fund_info[i].fund_maxdrawdown*100).toFixed(2) +"</font></b></td><td>"+
									fund_info[i].fund_maxdrawdown_begin +"</td><td>"+
									fund_info[i].fund_maxdrawdown_end +"</td></tr>"
		}
	}
	info_val += "</table>";
	$('#div_fund_info').html(info_val);
}

// change Y value
function change_yvalue(){
	var yvalue = $('#yvalue').val();
	if (yvalue == 'ac_worth') {
		show_data = ac_worth;
	} else if (yvalue == 'net_worth') {
		show_data = net_worth;
	} else if (yvalue == 'ranking') {
		show_data = ranking;
	} else if (yvalue == 'ac_worth_pcent'){
		show_data = ac_worth_pcent
	} else if (yvalue == 'net_worth_pcent'){
		show_data = net_worth_pcent
	}
}