var chart = null;
const max_count = 1000;
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
var years = new Array();			//年份
var fund_managers = new Array();	//基金经理
var fund_companies = new Array();	//基金公司
var show_data = new Array();
var colors = ['#E53935', '#1E88E5', '#43A047', '#FFB300', '#8E24AA', '#00FF33', '#5E35B1', '#FF00FF', '#0033FF', '#990000'];

function search_fund_data(feature, keys, date_begin, date_end) {
	// generate url
	var url = "../api/search/?feature="+ feature +"&keys=" + keys;
	if (date_begin>0){
		url = url + "&date_begin="+date_begin;
	}
	if (date_end>0){
		url = url + "&date_end="+date_end;
	}

	// submit request
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(json){
			if(json.result==0){
				// fund info
				var info = json.info;
				var yearly = json.yearly;
				fund_info = new Array();
				for (i=0; i < info.length; i++) {
					// load yearly data
					fund_yearly = new Array();
					for (j=0; j<yearly.length; j++){
						if (yearly[j]['fund_id']==info[i]['fund_id']){
							fund_yearly.push({
								fund_year: yearly[j]['fund_year'],
								fund_increase: yearly[j]['fund_increase'],
								fund_avg_ranking: yearly[j]['fund_avg_ranking']
							})
							if (years.indexOf(yearly[j]['fund_year'])<0){
								years.push(yearly[j]['fund_year'])
							}
						}
					}

					fund_info.push({
						fund_id: info[i]['fund_id'],
						fund_name: info[i]['fund_name'],
						fund_type: info[i]['fund_type'],
						mg_id: info[i]['fund_managerId'],
						mg_name: info[i]['mg_name'],
						mg_star: info[i]['mg_star'],
						mg_workyear: info[i]['mg_workyear'],
						mg_fundsize: info[i]['mg_fundsize'],
						mg_fundcount: info[i]['mg_fundcount'],
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
						fund_maxincrease_end: info[i]['fund_maxincrease_end'],
						fund_ranking_ytd: info[i]['fund_ranking_ytd'],
						fund_ranking_1w: info[i]['fund_ranking_1w'],
						fund_ranking_1m: info[i]['fund_ranking_1m'],
						fund_ranking_3m: info[i]['fund_ranking_3m'],
						fund_ranking_6m: info[i]['fund_ranking_6m'],
						fund_ranking_1y: info[i]['fund_ranking_1y'],
						fund_ranking_2y: info[i]['fund_ranking_2y'],
						fund_ranking_3y: info[i]['fund_ranking_3y'],
						fund_ranking_5y: info[i]['fund_ranking_5y'],
						fund_increase_yearly: fund_yearly
					})
				}
				for (i=0; i < max_count; i++) {
					fund_info.push({
						fund_id: '000000',
						fund_name: '',
						fund_type: '',
						mg_id: '000000'
					})
				}
				
				// fund data
				for (i=0; i < max_count; i++) {
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
				
				// Show data
				if (feature == 'ids'){
					if (info.length>0){
						change_yvalue();
						chart = create_chart();
					} else {
						chart.destroy();
					}
				}
				show_fund_info(feature);
			} else {
				console.log(json.reason)
			}
		},
		error: function(XMLHttpRequest, msg, e){
			console.log(e)
		}
	});
}

function search_manager_data(feature, keys, date_begin, date_end) {
	// generate url
	var url = "../api/search/?feature="+ feature +"&keys=" + keys;
	if (date_begin>0){
		url = url + "&date_begin="+date_begin;
	}
	if (date_end>0){
		url = url + "&date_end="+date_end;
	}

	// submit request
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(json){
			if(json.result==0){
				// fund manager
				var managers = json.managers;
				fund_managers = new Array();
				for (i=0; i < managers.length; i++) {
					fund_managers.push({
						mg_id: managers[i]['mg_id'],
						mg_name: managers[i]['mg_name'],
						mg_companyid: managers[i]['co_id'],
						mg_companyname: managers[i]['co_name'],
						mg_companyshortname: managers[i]['co_shortname'],
						mg_star: managers[i]['mg_star'],
						mg_workyear: managers[i]['mg_workyear'],
						mg_fundsize: managers[i]['mg_fundsize'],
						mg_fundcount: managers[i]['mg_fundcount'],
						mg_fund_avg_increase: managers[i]['mg_fund_avg_increase'],
						mg_best_fund_avg_increase: managers[i]['mg_best_fund_avg_increase'],
						update_date: managers[i]['update_date']
					})
				}
				// Show data
				show_managers_info(feature);
			} else {
				console.log(json.reason)
			}
		},
		error: function(XMLHttpRequest, msg, e){
			console.log(e)
		}
	});
}

function search_company_data(feature, keys, date_begin, date_end) {
	// generate url
	var url = "../api/search/?feature="+ feature +"&keys=" + keys;
	if (date_begin>0){
		url = url + "&date_begin="+date_begin;
	}
	if (date_end>0){
		url = url + "&date_end="+date_end;
	}

	// submit request
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(json){
			if(json.result==0){
				// fund company
				var companies = json.companies;
				fund_companies = new Array();
				for (i=0; i < companies.length; i++) {
					fund_companies.push({
						co_id: companies[i]['co_id'],
						co_code: companies[i]['co_code'],
						co_name: companies[i]['co_name'],
						co_shortname: companies[i]['co_shortname'],
						co_start: companies[i]['co_start'],
						co_fundcount: companies[i]['co_fundcount'],
						co_manager: companies[i]['co_manager'],
						co_star: companies[i]['co_star'],
						co_fundsize: companies[i]['co_fundsize'],
						co_ranking: companies[i]['co_ranking'],
						update_date: companies[i]['update_date']
					})
				}
				// Show data
				show_company_info(feature);
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
function show_fund_info(feature){
	var having_data = false;
	var info_val = "<table id='table_data' class='display' style='width:auto; margin:0;'><thead>";
	info_val += "<tr><th colspan='6'>基金</th><th colspan='5' id='th_manager' bgcolor='#c2d1f0'>基金经理</th><th colspan='3' id='th_maxincrease' bgcolor='#ffa366'>最大升幅</th><th colspan='3' id='th_maxdrawdown' bgcolor='#8cd98c'>最大回撤</th><th colspan='11' id='th_ranking' bgcolor='#b3d9ff'>同业排名</th><th colspan='"+ years.length +"' id='th_increase' bgcolor='#ffbf80'>历史升幅</th></tr>";
	info_val += "<tr><th>基金代码</th><th>基金名称</th><th>基金类型</th><th>成立日期</th><th>总升幅</th><th>年均升幅</th>";
	info_val += "<th bgcolor='#c2d1f0'>基金经理</th><th bgcolor='#c2d1f0'>经理评级</th><th bgcolor='#c2d1f0'>经理年资</th><th bgcolor='#c2d1f0'>管理规模</th><th bgcolor='#c2d1f0'>管理基金数</th>";
	info_val += "<th bgcolor='#ffa366'>升幅</th><th bgcolor='#ffa366'>开始</th><th bgcolor='#ffa366'>结束</th><th bgcolor='#8cd98c'>回撤</th><th bgcolor='#8cd98c'>开始</th><th bgcolor='#8cd98c'>结束</th>";
	info_val += "<th bgcolor='#b3d9ff'>当前</th><th bgcolor='#b3d9ff'>平均</th><th bgcolor='#b3d9ff'>YTD</th><th bgcolor='#b3d9ff'>1周</th><th bgcolor='#b3d9ff'>1个月</th><th bgcolor='#b3d9ff'>3个月</th><th bgcolor='#b3d9ff'>6个月</th><th bgcolor='#b3d9ff'>1年</th><th bgcolor='#b3d9ff'>2年</th><th bgcolor='#b3d9ff'>3年</th><th bgcolor='#b3d9ff'>5年</th>";
	years.sort();
	for (i=0; i < years.length; i++) {
		info_val += "<th bgcolor='#ffbf80'>"+ years[i] +"</th>";
	}
	info_val += "</tr></thead><tbody>";
	for (i=0; i < max_count; i++) {
		if (fund_info[i].fund_id!='000000'){
			having_data = true;
			info_val += "<tr><td><a href='http://fund.eastmoney.com/"+ fund_info[i].fund_id +".html?spm=search' rel='noreferrer' target='_blank'>"+ fund_info[i].fund_id +"</a></td><td>"+ 
									fund_info[i].fund_name +"</td><td>"+ 
									fund_info[i].fund_type +"</td><td>"+ 
									fund_info[i].fs_start +"</td><td class='txt-right'>"+
									(fund_info[i].fund_increase*100).toFixed(2) +"%</td><td class='txt-right'>"+
									"<b><font color='red'>"+ (fund_info[i].fund_avg_increase*100).toFixed(2) +"%</font></b></td><td>"+
									"<a href='?feature=manager&keys="+ fund_info[i].mg_id +"'>" + fund_info[i].mg_name +"</a></td><td>"+
									"Level" + fund_info[i].mg_star +"</td><td class='txt-right'>"+
									fund_info[i].mg_workyear +"</td><td class='txt-right'>"+
									fund_info[i].mg_fundsize +"</td><td class='txt-right'>"+
									fund_info[i].mg_fundcount +"</td><td class='txt-right'>"+
									"<b><font color='red'>"+ (fund_info[i].fund_maxincrease*100).toFixed(2) +"%</font></b></td><td>"+
									fund_info[i].fund_maxincrease_begin +"</td><td>"+
									fund_info[i].fund_maxincrease_end +"</td><td class='txt-right'>"+
									"<b><font color='#0fd132'>"+ (fund_info[i].fund_maxdrawdown*100).toFixed(2) +"%</font></b></td><td>"+
									fund_info[i].fund_maxdrawdown_begin +"</td><td>"+
									fund_info[i].fund_maxdrawdown_end +"</td><td class='txt-right'>"+
									(fund_info[i].fund_cur_ranking*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_avg_ranking*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_ytd*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_1w*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_1m*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_3m*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_6m*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_1y*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_2y*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_3y*100).toFixed(2) +"%</td><td class='txt-right'>"+
									(fund_info[i].fund_ranking_5y*100).toFixed(2) +"%</td>";
			for (n=0; n < years.length; n++) {
				year_increase = "";
				for (j=0; j < fund_info[i].fund_increase_yearly.length; j++) {
					if (years[n] == fund_info[i].fund_increase_yearly[j].fund_year){
						year_increase = (fund_info[i].fund_increase_yearly[j].fund_increase*100).toFixed(2);
						if (fund_info[i].fund_increase_yearly[j].fund_increase>0){
							year_increase = "<font color='red'>" + year_increase + "%</font>";
						} else {
							year_increase = "<font color='#0fd132'>" + year_increase + "%</font>";
						}
					}
				}
				info_val = info_val + "<td class='txt-right'>"+ year_increase +"</td>";
			}
			info_val = info_val + "</tr>";
		}
	}
	info_val += "</tbody></table>";
	if (having_data){
		// show table
		$('#div_fund_info').html(info_val);
		// sorting
		if (feature == "ids"){
			$('#table_data').DataTable( {
				paging: false,
				order: [[0, 'asc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		} else if(feature == "4433") {
			$('#table_data').DataTable( {
				paging: false,
				order: [[5, 'desc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		} else if(feature == "maxdrawdown") {
			$('#table_data').DataTable( {
				paging: false,
				order: [[14, 'asc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		} else if(feature == "manager") {
			$('#table_data').DataTable( {
				paging: false,
				order: [[5, 'desc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		} else if(feature == "company") {
			$('#table_data').DataTable( {
				paging: false,
				order: [[5, 'desc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		}
		// show / hide
		show_columns("cb_manager_details", getCookie('cb_manager_details'));
		show_columns("cb_max_increase", getCookie('cb_max_increase'));
		show_columns("cb_max_drawdown", getCookie('cb_max_drawdown'));
		show_columns("cb_ranking", getCookie('cb_ranking'));
		show_columns("cb_increase", getCookie('cb_increase'));
		show_columns("op_max_years", getCookie('op_max_years'));
	} else {
		$('#div_fund_info').html("no data");
	}
}

// show managers informaiton
function show_managers_info(feature){
	var having_data = false;
	var managers_val = "<table id='table_data' class='display' style='width:auto; margin:0;'><thead><tr><th>经理ID</th><th>基金经理</th><th>基金公司</th><th>经理评级</th><th>工作年资</th><th>平均年均升幅</th><th>最好基金年均升幅</th><th>管理规模（亿元）</th><th>管理数目</th></tr></thead><tbody>";
	for (i=0; i < fund_managers.length; i++) {
		having_data = true;
		managers_val += "<tr><td>"+ fund_managers[i].mg_id +"</td><td>"+ 
								"<a href='?feature=manager&keys="+ fund_managers[i].mg_id +"'>" + fund_managers[i].mg_name +"</a></td><td>"+ 
								"<a href='?feature=company&keys="+ fund_managers[i].mg_companyid +"'>" + fund_managers[i].mg_companyname +"</a></td><td>"+ 
								"Level" + fund_managers[i].mg_star +"</td><td class='txt-right'>"+ 
								fund_managers[i].mg_workyear +"</td><td class='txt-right'>"+
								(fund_managers[i].mg_fund_avg_increase*100).toFixed(2) +"</td><td class='txt-right'>"+
								(fund_managers[i].mg_best_fund_avg_increase*100).toFixed(2) +"</td><td class='txt-right'>"+
								fund_managers[i].mg_fundsize +"</td><td class='txt-right'>"+
								fund_managers[i].mg_fundcount +"</td></tr>";
	}
	managers_val += "</tbody></table>";
	if (having_data){
		// show table
		$('#div_fund_info').html(managers_val);
		// sorting
		if (feature == "managerlist"){
			$('#table_data').DataTable( {
				paging: false,
				order: [[5, 'desc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		}
	} else {
		$('#div_fund_info').html("no data");
	}
}

// show company informaiton
function show_company_info(feature){
	var having_data = false;
	var company_val = "<table id='table_data' class='display' style='width:auto; margin:0;'><thead><tr><th>公司ID</th><th>基金公司</th><th>成立日期</th><th>评级</th><th>排名</th><th>规模（亿元）</th><th>基金数目</th></tr></thead><tbody>";
	for (i=0; i < fund_companies.length; i++) {
		having_data = true;
		company_val += "<tr><td>"+ fund_companies[i].co_id +"</td><td>"+ 
								"<a href='?feature=company&keys="+ fund_companies[i].co_id +"'>" + fund_companies[i].co_name +"</a></td><td>"+ 
								fund_companies[i].co_start +"</td><td class='txt-right'>"+
								"Level" + fund_companies[i].co_star +"</td><td class='txt-right'>"+ 
								fund_companies[i].co_ranking +"</td><td class='txt-right'>"+
								fund_companies[i].co_fundsize +"</td><td class='txt-right'>"+
								fund_companies[i].co_fundcount +"</td></tr>";
	}
	company_val += "</tbody></table>";
	if (having_data){
		// show table
		$('#div_fund_info').html(company_val);
		// sorting
		if (feature == "companylist"){
			$('#table_data').DataTable( {
				paging: false,
				order: [[5, 'desc']],
				"autoWidth": false,
				"dom": '<"pull-left"f><"pull-right"l>tip'
			} );
		}
	} else {
		$('#div_fund_info').html("no data");
	}
}

// show / hide columns
function show_columns(category, show){
	if (category == "cb_manager_details"){
		if (show == true || show == "true"){
			for (n=7; n < 12; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').show();
			}
			$('#th_manager').show();
		} else {
			for (n=7; n < 12; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').hide();
			}
			$('#th_manager').hide();
		}
	} else if (category == "cb_max_increase"){
		if (show == true || show == "true"){
			for (n=12; n < 15; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').show();
			}
			$('#th_maxincrease').show();
		} else {
			for (n=12; n < 15; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').hide();
			}
			$('#th_maxincrease').hide();
		}
	} else if (category == "cb_max_drawdown"){
		if (show == true || show == "true"){
			for (n=15; n < 18; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').show();
			}
			$('#th_maxdrawdown').show();
		} else {
			for (n=15; n < 18; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').hide();
			}
			$('#th_maxdrawdown').hide();
		}
	} else if (category == "cb_ranking"){
		if (show == true || show == "true"){
			for (n=18; n < 29; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').show();
			}
			$('#th_ranking').show();
		} else {
			for (n=18; n < 29; n++) {
				$('td:nth-child('+ n +'),th:nth-child('+ n +')').hide();
			}
			$('#th_ranking').hide();
		}
	} else if (category == "cb_increase"){
		if (show == true || show == "true"){
			for (n=0; n < years.length; n++) {
				icolumn = n + 29;
				$('td:nth-child('+ icolumn +'),th:nth-child('+ icolumn +')').show();
			}
			$('#th_increase').show();
		} else {
			for (n=0; n < years.length; n++) {
				icolumn = n + 29;
				$('td:nth-child('+ icolumn +'),th:nth-child('+ icolumn +')').hide();
			}
			$('#th_increase').hide();
		}
	} else if (category == "op_max_years") {
		var show_from_year = 0;
		if (show != ""){
			show_from_year = years.length - Number(show);
		}
		for (n=0; n < years.length; n++) {
			icolumn = n + 29;
			if (n >= show_from_year) {
				$('td:nth-child('+ icolumn +'),th:nth-child('+ icolumn +')').show();
			} else {
				$('td:nth-child('+ icolumn +'),th:nth-child('+ icolumn +')').hide();
			}
		}
	}
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