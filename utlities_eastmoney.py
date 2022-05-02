#!/usr/bin/python3

import requests
import execjs
import re
import os
import utlities_common
from entity.FundData import FundData
from entity.FundInfo import FundInfo

#FOLDER_PATH = "D:/Jim/WEB/funds/data/"
FOLDER_PATH = os.path.dirname(os.path.abspath(__file__)) + "/data/"

# prepare URL
def getUrl(fscode):
  head = 'http://fund.eastmoney.com/pingzhongdata/'
  tail = '.js?v='+ utlities_common.getCurrentTime()
  #print(head+fscode+tail)
  return head+fscode+tail

def getFundArchivesDatasUrl(fscode):
  head = 'http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jdzf&code='
  tail = '&rt=='+ utlities_common.getCurrentTime()
  #print(head+fscode+tail)
  return head+fscode+tail

# get all the fund codes
def getAllCode():
    url = 'http://fund.eastmoney.com/js/fundcode_search.js'
    content = requests.get(url)
    jsContent = execjs.compile(content.text)
    rawData = jsContent.eval('r')
    allCode = []
    for code in rawData:
        allCode.append(code)
    return allCode

# download json data from eastmoney
def downloadJsonData(fscode):
    downloadDone = False
    downloadCount = 0
    while downloadDone == False and downloadCount<5:
        try:
            req = requests.get(getUrl(fscode))
            downloadDone = True
        except Exception as e:
            downloadCount += 1
            print(e)
    
    # download failed. return None
    if downloadDone == False or req.status_code != 200:
        print(fscode + ": data not found xxxxxx")
        return 1

    # save file
    f = open(FOLDER_PATH + fscode+".json", "w")
    f.write(req.text)
    f.close()
    return 0

# download FundArchivesDatas json data from eastmoney
def downloadFundArchivesData(fscode):
    downloadDone = False
    downloadCount = 0
    while downloadDone == False and downloadCount<5:
        try:
            req = requests.get(getFundArchivesDatasUrl(fscode))
            downloadDone = True
        except Exception as e:
            downloadCount += 1
            print(e)
    
    # download failed. return None
    if downloadDone == False or req.status_code != 200:
        print(fscode + ": FundArchivesDatas not found xxxxxx")
        return 1

    # save file
    f = open(FOLDER_PATH + fscode+"_arh.json", "w")
    f.write(req.text)
    f.close()
    return 0

# get fund's data
def getData(fscode):
    try:
        #f = open(FOLDER_PATH + fscode+".json", "r", encoding="gbk")
        f = open(FOLDER_PATH + fscode+".json", "r")
        jsContent = execjs.compile(f.read())
        f.close()
    except Exception as e:
        print(e)
        return None, None

    #基本信息
    fs_Name = jsContent.eval('fS_name')
    fs_Code = jsContent.eval('fS_code')
    try:
        fs_Manager = jsContent.eval('Data_currentFundManager')
        fs_ManagerId = fs_Manager[0]['id']
    except:
        fs_ManagerId = 'NULL'
    try:
        fs_performance = jsContent.eval('Data_performanceEvaluation')
        fs_pfm_bond         = fs_performance['data'][0]
        fs_pfm_profit       = fs_performance['data'][1]
        fs_pfm_riskcontrol  = fs_performance['data'][2]
        fs_pfm_consistency  = fs_performance['data'][3]
        fs_pfm_timing       = fs_performance['data'][4]
    except:
        fs_pfm_bond         = 0
        fs_pfm_profit       = 0
        fs_pfm_riskcontrol  = 0
        fs_pfm_consistency  = 0
        fs_pfm_timing       = 0

    if fs_pfm_bond == None:         fs_pfm_bond = 0
    if fs_pfm_profit == None:       fs_pfm_profit = 0
    if fs_pfm_riskcontrol == None:  fs_pfm_riskcontrol = 0
    if fs_pfm_consistency == None:  fs_pfm_consistency = 0
    if fs_pfm_timing == None:       fs_pfm_timing = 0
    fundInfo = FundInfo(fs_Code, fs_Name, fs_ManagerId, fs_pfm_bond, 
    fs_pfm_profit, fs_pfm_riskcontrol, fs_pfm_consistency, fs_pfm_timing, fs_Manager)
    
    #股票仓位测算图
    try:
        sharesPosition = jsContent.eval('Data_fundSharesPositions')
    except:
        sharesPosition = []

    #单位净值走势
    try:
        netWorthTrend = jsContent.eval('Data_netWorthTrend')
    except:
        netWorthTrend = []

    #累计净值走势
    try:
        ACWorthTrend = jsContent.eval('Data_ACWorthTrend')
    except:
        ACWorthTrend = []
    #货币基金：基金收益走势图 每万份收益 --> 累计净值走势
    if len(ACWorthTrend) == 0:
        baseAmount = 1.00000
        try:
            millionCopiesIncomes = jsContent.eval('Data_millionCopiesIncome')
            for income in millionCopiesIncomes:
                baseAmount = baseAmount + income[1]/10000
                ACWorthTrend.append([income[0], baseAmount])
        except:
            millionCopiesIncomes = []
    
    #同类排名百分比
    try:
        rankings = jsContent.eval('Data_rateInSimilarPersent')
    except:
        rankings = []
    
    fundDatas = {}
    for dayWorth in netWorthTrend[::-1]:
        if dayWorth['y'] == None: dayWorth['y'] = 0
        if dayWorth['equityReturn'] == None: dayWorth['equityReturn'] = 0
        unitMoneys = re.findall('\d+.?\d*', dayWorth['unitMoney'])
        if unitMoneys: 
            unitMoney = unitMoneys[0]
        else:
            unitMoney = 0
        fundDatas[utlities_common.epochToISODate(dayWorth['x'])] = FundData(0, dayWorth['y'], 0, dayWorth['equityReturn'], unitMoney, 0)
    for dayACWorth in ACWorthTrend[::-1]:
        if utlities_common.epochToISODate(dayACWorth[0]) not in fundDatas:
            fundDatas[utlities_common.epochToISODate(dayACWorth[0])] = FundData(0, 0, 0, 0, 0, 0)
        if dayACWorth[1] == None: dayACWorth[1] = 0
        fundDatas[utlities_common.epochToISODate(dayACWorth[0])].acWorth = dayACWorth[1]
    for sharePos in sharesPosition[::-1]:
        if utlities_common.epochToISODate(sharePos[0]) not in fundDatas:
            fundDatas[utlities_common.epochToISODate(sharePos[0])] = FundData(0, 0, 0, 0, 0, 0)
        if sharePos[1] == None: sharePos[1] = 0
        fundDatas[utlities_common.epochToISODate(sharePos[0])].sharesPosition = sharePos[1]
    for ranking in rankings[::-1]:
        if utlities_common.epochToISODate(ranking[0]) not in fundDatas:
            fundDatas[utlities_common.epochToISODate(ranking[0])] = FundData(0, 0, 0, 0, 0, 0)
        if ranking[1] == None: ranking[1] = 0
        fundDatas[utlities_common.epochToISODate(ranking[0])].ranking = ranking[1]

    '''
    # for testing
    for i in fundDatas:
        if(i>='20200628'):
            print("%s: sharesPosition: %s, netWorth: %s, acWorth: %s, equityReturn: %s, unitMoney: %s, ranking: %s" %
            (i, fundDatas[i].sharesPosition, fundDatas[i].netWorth, fundDatas[i].acWorth, fundDatas[i].equityReturn, 
            fundDatas[i].unitMoney, fundDatas[i].ranking))
    
    fundInfo.displayFundInfo()
    '''
    
    return fundInfo, fundDatas

# get FundArchives data
def getFundArchivesData(fscode):
    rankings = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    try:
        #f = open(FOLDER_PATH + fscode+"_arh.json", "r", encoding="gbk")
        f = open(FOLDER_PATH + fscode+"_arh.json", "r")
        apidata = f.read()
        f.close()
    except Exception as e:
        print(e)
        return rankings

    #同类排名
    try:
        #apidata = jsContent.eval('apidata')
        re_body = re.findall(r'</div></div></li></ul>(.*?)</div>', apidata)
        if "<li class='title'>今年来</li><li class='tlpm'>---</li><li class='tlpm'>---</li><li class='tlpm'>---</li><li class='tlpm'>---</li>" in re_body[0]:
            # no data
            return rankings
        else:
            re_arry = re.findall(r'<ul><li class=\'title\'>(?P<duration_name>.+?)</li><li class=\'.*?\'>(?P<fund_increase>.+?)[-|%]</li><li class=\'.*?\'>(?P<peer_increase>.+?)[-|%]</li><li class=\'.*?\'>(?P<stock300_increase>.+?)[-|%]</li>.*?<li class=\'tlpm\'>(?P<ranking>---|\d+)<font class=\'gray\'>\|</font>(?P<fund_count>---|\d+)</li><li class=\'pmbd\'>', re_body[0])
            i = 0
            for data in re_arry:
                if data[4] != '---' and data[5] != '---':
                    ranking_percent = int(data[4]) / int(data[5])
                    rankings[i] = ranking_percent
                    i = i + 1
    except Exception as e:
        print(e)
        return rankings
    
    return rankings

'''
# for testing
downloadJsonData('110011')
downloadFundArchivesData('000011')
downloadFundArchivesData('970042')
downloadJsonData('000009')
downloadFundArchivesData('000009')
getFundArchivesData('970042')
print(getData('110011'))
'''

'''
# for testing
fs_codes = getAllCode()
for code in fs_codes:
    print(code)
'''
