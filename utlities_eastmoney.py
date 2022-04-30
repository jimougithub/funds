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
        print(fscode + ": data not found xxxxxx")
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

    currencyFund = jsContent.eval('ishb')
    if currencyFund == True:
        print(fscode + ": ignore currency fund")
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


'''
# for testing
downloadJsonData('110011')
downloadFundArchivesData('000011')
print(getData('110011'))
'''

'''
# for testing
fs_codes = getAllCode()
for code in fs_codes:
    print(code)
'''
