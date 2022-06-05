import numpy as np
import re
import utlities_eastmoney
import pymysql
import datetime
import argparse
from configs import conn
from entity.FundData import FundData

# Parameters
parser = argparse.ArgumentParser(description='--frm 001000 --to 005000 --id 515293')
parser.add_argument('--frm', type=int, default=0)
parser.add_argument('--to', type=int, default=999999)
parser.add_argument('--id', type=int, default=0)
args = parser.parse_args()

# update fund data 1 by 1 from json data ====================================================
def updateFundAllData(db):
    cursor = db.cursor()
    if args.id > 0:
        sql = """SELECT fund_id, fund_download FROM fund_info WHERE fund_id = %s""" % (args.id)
    else:
        sql = """SELECT fund_id, fund_download FROM fund_info WHERE fund_update<fund_download AND fund_id between %s and %s""" % (args.frm, args.to)
    cursor.execute(sql)
    rows = cursor.fetchall()
    for row in rows:
        fs_code = row[0]
        download_date = row[1]
        # update database
        fundInfo, fundDatas = utlities_eastmoney.getData(fs_code)
        if fundInfo != None and fundDatas != None:
            # too many data, skip writting fund data for the moment
            for k in fundDatas:
                if writeFundData(db, fs_code, k, fundDatas[k]) == False:
                    # if data already exist no need to continue
                    break
            updateFundYearly(db, fundInfo, fundDatas)                       # update yearly statistics
            updateFundManager(db, fundInfo, download_date)                  # update fund manager
            updateFundInfo(db, fundInfo, fundDatas, download_date)          # update current statistics
            print(fs_code + ": update done")


# Write data to fund_info ==================================================================
def updateFundInfo(db, fundInfo, fundDatas, curr_date):
    # caculate ranking and drawdown
    totalIncrease = 0
    avgIncrease = 0
    curRanking = 0
    avgRanking = 0
    maxDrawdown = 0
    maxDrawdownBegin = 0
    maxDrawdownEnd = 0
    maxIncrease = 0
    maxIncreaseBegin = 0
    maxIncreaseEnd = 0
    totalIncrease, avgIncrease, fs_start = caculateIncrease(fundDatas, curr_date)
    curRanking, avgRanking = caculateRanking(fundDatas)
    rankings = utlities_eastmoney.getFundArchivesData(fundInfo.fs_Code)
    maxDrawdown, maxDrawdownBegin, maxDrawdownEnd = caculateMaxChanges(fundDatas, Drawdown=True)
    maxIncrease, maxIncreaseBegin, maxIncreaseEnd = caculateMaxChanges(fundDatas, Drawdown=False)

    cursor = db.cursor()
    # Update fund information 
    sql = """UPDATE fund_info SET fund_managerId='%s', 
            fs_pfm_bond=%s, fs_pfm_profit=%s, fs_pfm_riskcontrol=%s, fs_pfm_consistency=%s, fs_pfm_timing=%s, 
            fund_increase=%s, fund_avg_increase=%s, fund_cur_ranking=%s, fund_avg_ranking=%s,
            fund_ranking_ytd=%s, fund_ranking_1w=%s, fund_ranking_1m=%s, fund_ranking_3m=%s, fund_ranking_6m=%s, fund_ranking_1y=%s, fund_ranking_2y=%s, fund_ranking_3y=%s, fund_ranking_5y=%s,
            fund_maxdrawdown=%s, fund_maxdrawdown_begin=%s, fund_maxdrawdown_end=%s, 
            fund_maxincrease=%s, fund_maxincrease_begin=%s, fund_maxincrease_end=%s, 
            fs_start=%s, fund_update=%s WHERE fund_id='%s'""" % \
        (fundInfo.fs_ManagerId, 
        fundInfo.fs_pfm_bond, fundInfo.fs_pfm_profit, fundInfo.fs_pfm_riskcontrol, fundInfo.fs_pfm_consistency, fundInfo.fs_pfm_timing,
        totalIncrease, avgIncrease, curRanking, avgRanking,
        rankings[0], rankings[1], rankings[2], rankings[3], rankings[4], rankings[5], rankings[6], rankings[7], rankings[8], 
        maxDrawdown, maxDrawdownBegin, maxDrawdownEnd, 
        maxIncrease, maxIncreaseBegin, maxIncreaseEnd, 
        fs_start, curr_date, fundInfo.fs_Code)
    try:
        cursor.execute(sql)
        db.commit()
    except:
        db.rollback()
        print(fundInfo.fs_Code + ": update fund_info error: " + sql)


# Write data to fund_yearly ================================================================
def updateFundYearly(db, fundInfo, fundDatas):
    # delete old data
    cursor = db.cursor()
    sql = """DELETE FROM fund_yearly WHERE fund_id='%s'""" % fundInfo.fs_Code
    try:
        cursor.execute(sql)
        db.commit()
    except Exception as e:
        db.rollback()
        print(e)
        print(fundInfo.fs_Code + ": update fund yearly data error: " + sql)

    if len(fundDatas) == 0:
        return None

    # caculate yearly increasment, ranking and drawdown
    lastVal = list(fundDatas.keys())[-1]                # last record
    yearVal = list(fundDatas.keys())[0][0:4]            # first record's year
    currDate = list(fundDatas.keys())[0]
    fundYearlyDatas = {}
    for key, val in fundDatas.items():
        year = key[0:4]
        if yearVal != year or lastVal == key:
            if lastVal == key:
                fundYearlyDatas[key] = val
            totalIncrease = 0
            avgIncrease = 0
            curRanking = 0
            avgRanking = 0
            maxDrawdown = 0
            maxDrawdownBegin = 0
            maxDrawdownEnd = 0
            maxIncrease = 0
            maxIncreaseBegin = 0
            maxIncreaseEnd = 0
            fs_start = 0
            totalIncrease, avgIncrease, fs_start = caculateIncrease(fundYearlyDatas, currDate)
            curRanking, avgRanking = caculateRanking(fundYearlyDatas)
            maxDrawdown, maxDrawdownBegin, maxDrawdownEnd = caculateMaxChanges(fundYearlyDatas, Drawdown=True)
            maxIncrease, maxIncreaseBegin, maxIncreaseEnd = caculateMaxChanges(fundYearlyDatas, Drawdown=False)
            # Write fund yearly data to database
            sql = """INSERT INTO fund_yearly(fund_id, fund_year, fund_increase, fund_ranking, fund_avg_ranking, 
                    fund_maxdrawdown, fund_maxdrawdown_begin, fund_maxdrawdown_end, 
                    fund_maxincrease, fund_maxincrease_begin, fund_maxincrease_end) 
                    VALUES ('%s', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""" % \
                    (fundInfo.fs_Code, yearVal, totalIncrease, curRanking, avgRanking, 
                    maxDrawdown, maxDrawdownBegin, maxDrawdownEnd, 
                    maxIncrease, maxIncreaseBegin, maxIncreaseEnd)
            try:
                cursor.execute(sql)
                db.commit()
            except:
                db.rollback()
                print(fundInfo.fs_Code + ": write fund_yearly error: " + sql)
            
            # clear dict
            yearVal = year
            currDate = key
            fundYearlyDatas.clear()

        # add record into yearly dict
        fundYearlyDatas[key] = val

# Write data to fund_manager ===============================================================
def updateFundManager(db, fundInfo, curr_date):
    cursor = db.cursor()
    # Skip the record if already exists
    sql = """SELECT * FROM fund_manager WHERE mg_id='%s' AND update_date=%s""" % (fundInfo.fs_ManagerId, curr_date)
    cursor.execute(sql)
    if cursor.rowcount > 0:
        return False

    if fundInfo.fs_Manager == None or len(fundInfo.fs_Manager) == 0:
        return False

    sql = """DELETE FROM fund_manager WHERE mg_id='%s'""" % (fundInfo.fs_ManagerId)
    cursor.execute(sql)

    # Write fund information to database
    fs_Manager = fundInfo.fs_Manager[0]
    fundSize = 0
    fundCount = 0
    workYear = 0
    searchYear = re.search( r'(.*)年.*', fs_Manager['workTime'], re.M|re.I)
    if searchYear:
        workYear = searchYear.group(1)
    searchSizes = re.search( r'(.*)亿\((.*)只基金\).*', fs_Manager['fundSize'], re.M|re.I)        #128.36亿(17只基金)
    if searchSizes:
        fundSize = searchSizes.group(1)
        fundCount = searchSizes.group(2)

    sql = """INSERT INTO fund_manager(mg_id, mg_name, mg_star, mg_workyear, 
            mg_fundsize, mg_fundcount, update_date) 
            VALUES (%s, '%s', %s, %s, %s, %s, %s)""" % \
        (fundInfo.fs_ManagerId, fs_Manager['name'], fs_Manager['star'], workYear, 
        fundSize, fundCount, curr_date)
    try:
        cursor.execute(sql)
        db.commit()
    except:
        db.rollback()
        print(fundInfo.fs_ManagerId + ": write fund_manager error: " + sql)
    
    return True


# Write data to fund_data ==================================================================
def writeFundData(db, fs_Code, dateVal, fundData):
    cursor = db.cursor()
    # Skip the record if already exists
    sql = """SELECT * FROM fund_data WHERE fund_id='%s' AND date_val=%s""" % (fs_Code, dateVal)
    cursor.execute(sql)
    if cursor.rowcount > 0:
        return False

    # Write fund information to database
    sql = """INSERT INTO fund_data(fund_id, date_val, shares_position, net_worth, ac_worth, 
            equity_return, unit_money, ranking) 
            VALUES ('%s', %s, %s, %s, %s, %s, %s, %s)""" % \
        (fs_Code, dateVal, fundData.sharesPosition, fundData.netWorth, fundData.acWorth, 
        fundData.equityReturn, fundData.unitMoney, fundData.ranking)
    try:
        cursor.execute(sql)
        db.commit()
    except:
        db.rollback()
        print(fs_Code + ": write fund_data error: " + sql)
    
    return True


# caculate increasement -------------------------------------------------------------------
def caculateIncrease(fundDatas, currDate):
    endAcWorth = 0
    strAcWorth = 0
    end_date = 0
    str_date = 0
    num_year = 0
    totalIncrease = 0
    fs_start = 0
    avgIncrease = 0         # yearly avg increament
    if len(fundDatas) > 0:
        endAcWorth = list(fundDatas.values())[0].acWorth
        strAcWorth = list(fundDatas.values())[-1].acWorth
        fs_start = list(fundDatas.keys())[-1]
    
    if strAcWorth != 0 and endAcWorth != 0:
        totalIncrease = (endAcWorth-strAcWorth)/strAcWorth
        str_date = datetime.datetime.strptime(fs_start, "%Y%m%d")
        end_date = datetime.datetime.strptime(str(currDate), "%Y%m%d")
        num_days = (end_date - str_date).days
        if num_days<365:
            avgIncrease = totalIncrease
        else:
            num_year = num_days / 365
            avgIncrease = (endAcWorth/strAcWorth)**(1/num_year)-1       #pow(endAcWorth, strAcWorth/num_year) - 1

    return totalIncrease, avgIncrease, fs_start


# caculate latest ranking & avg ranking ----------------------------------------------------
def caculateRanking(fundDatas):
    rankings = []
    lastRanking = 0
    avgRanking = 0
    # the frist record is latest one
    for val in fundDatas.values():
        lastRanking = val.ranking / 100
        break

    for val in fundDatas.values():
        if val.ranking > 0:
            rankings.append(val.ranking)

    # find avage ranking
    if len(rankings)>0:
        avgRanking = np.ma.average(rankings) / 100
    
    return lastRanking, avgRanking


# caculate max Increase / Drawdown % -------------------------------------------------------------------
def caculateMaxChanges(fundDatas, Drawdown):
    acWorths = []
    acDates = []
    for (key, val) in fundDatas.items():
        if val.acWorth > 0:
            acDates.append(key)
            acWorths.append(val.acWorth)
    
    if len(acWorths) == 0:
        return 0, '0', '0'

    # records order is from latest to old. hence need to reverse it before caculate max drawdown. different with max increase
    if Drawdown == True:
        acDates.reverse()
        acWorths.reverse()

    # 1. find all of the peak of cumlative return 
    maxcum = np.zeros(len(acWorths))
    b = acWorths[0]
    for i in range(0,len(acWorths)):
        if (acWorths[i]>b):
            b = acWorths[i]
        maxcum[i] = b
    
    # 2. then find the max drawndown/increase point
    i = np.argmax((maxcum-acWorths)/maxcum) 
    if i == 0:
        return 0, '0', '0'
    j = np.argmax(acWorths[:i])   
    
    # 3. return the maxdrawndown
    if Drawdown == True:
        return (acWorths[j]-acWorths[i])/acWorths[j], acDates[j], acDates[i]
    else:
        return (acWorths[j]-acWorths[i])/acWorths[j], acDates[i], acDates[j]

# update manager's mg_fund_avg_increase and mg_best_fund_avg_increase -----------------------------------------------
def updateManagerAvgIncrease(db):
    cursor = db.cursor()
    sql = "UPDATE fund_manager LEFT JOIN (SELECT fund_managerId, MAX(fund_companyid) fund_companyid, AVG(fund_avg_increase) fund_avg_increase, MAX(fund_avg_increase) max_fund_avg_increase FROM fund_info GROUP BY fund_managerId) B ON mg_id = B.fund_managerId SET mg_fund_avg_increase = fund_avg_increase, mg_best_fund_avg_increase = max_fund_avg_increase, mg_companyId = fund_companyid"
    try:
        cursor.execute(sql)
        db.commit()
    except:
        print("updateManagerAvgIncrease error: " + sql)

# Connect to database
db = pymysql.connect(host=conn.host,user=conn.dbuser,passwd=conn.dbpass,db=conn.dbname,charset='utf8')

# Load fund infomation one by one
updateFundAllData(db)

# update manager's performance according to fund performance
updateManagerAvgIncrease(db)

# Close database
db.close()